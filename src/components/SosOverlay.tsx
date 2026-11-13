import React, { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, MapPin, Share2, AlertOctagon, Check, Send, Navigation, HeartHandshake, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { buildSOSMessage, getSmsUrl, getWhatsAppUrl } from '../utils/emergency';
import { playAlarmTone } from '../utils/audio';
import { findNearbyEmergencyFacilities, HospitalFacility } from '../services/hospitalLocator';
import { EmergencyPhraseCarousel } from './EmergencyPhraseCarousel';

interface SosOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onOpenFirstResponder?: () => void;
}

export const SosOverlay: React.FC<SosOverlayProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenFirstResponder
}) => {
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'fetching' | 'ready' | 'denied'>('fetching');
  const [copied, setCopied] = useState<boolean>(false);
  const [nearbyFacilities, setNearbyFacilities] = useState<HospitalFacility[]>([]);
  const [isSearchingHospitals, setIsSearchingHospitals] = useState<boolean>(false);
  const [isPhrasesOpen, setIsPhrasesOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      playAlarmTone(1);
      setGpsStatus('fetching');

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setGpsLocation({ lat, lng });
            setGpsStatus('ready');

            // Search nearest hospitals and AEDs
            setIsSearchingHospitals(true);
            findNearbyEmergencyFacilities(lat, lng, 5000, true)
              .then(facs => setNearbyFacilities(facs.slice(0, 3)))
              .catch(err => console.warn('Facilities search error:', err))
              .finally(() => setIsSearchingHospitals(false));
          },
          (err) => {
            console.warn('GPS location denied or timed out:', err);
            setGpsStatus('denied');
            // Fallback facilities with approximate coordinates
            findNearbyEmergencyFacilities(28.6139, 77.2090, 5000, true)
              .then(facs => setNearbyFacilities(facs.slice(0, 3)))
              .catch(() => {});
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setGpsStatus('denied');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mapLink = gpsLocation
    ? `https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}`
    : undefined;

  const sosMessage = buildSOSMessage(profile, mapLink);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sosMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EMERGENCY ALERT: ${profile.fullName}`,
          text: sosMessage
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FF3B30] animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Siren Header */}
        <div className="bg-gradient-to-r from-[#C0392B] to-[#FF3B30] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-3 sos-pulse">
            <AlertOctagon size={36} className="text-white" />
          </div>

          <h2 className="font-black text-2xl tracking-wider">
            EMERGENCY SOS MODE
          </h2>
          <p className="text-xs text-white/90 font-semibold mt-1">
            {profile.fullName} • Blood Group: <span className="underline">{profile.bloodGroup || 'O+'}</span>
          </p>

          {/* GPS Badge */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-[11px] font-medium text-white/90">
            <MapPin size={13} className={gpsStatus === 'fetching' ? 'animate-bounce text-yellow-300' : 'text-[#34C759]'} />
            {gpsStatus === 'fetching' && 'Locating GPS position...'}
            {gpsStatus === 'ready' && 'Live GPS Coordinates Attached'}
            {gpsStatus === 'denied' && 'GPS Unavailable (Sending text alert)'}
          </div>
        </div>

        {/* Action Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 no-scrollbar text-xs">
          {/* Fast Bystander & Non-Verbal Action Bar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsPhrasesOpen(true)}
              className="p-2.5 rounded-2xl bg-[#FEF8F3] hover:bg-orange-50 border border-[#DC7009]/40 text-[#DC7009] font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <HeartHandshake size={16} />
              <span>Non-Verbal Cards (12 Lang)</span>
            </button>

            {onOpenFirstResponder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFirstResponder();
                }}
                className="p-2.5 rounded-2xl bg-black hover:bg-gray-900 border border-black text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              >
                <span>🧓 Bystander Card</span>
              </button>
            )}
          </div>

          {/* Quick Dial Emergency Services */}
          <div>
            <div className="font-extrabold uppercase text-[#FF3B30] text-[11px] mb-2">
              National Emergency Helplines (1-Tap Dial)
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-2.5 font-bold text-red-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <div className="text-xs">112 Emergency</div>
                  <div className="text-[10px] text-red-700 font-normal">All-in-One India</div>
                </div>
              </a>

              <a
                href="tel:108"
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-2.5 font-bold text-emerald-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <div className="text-xs">108 Ambulance</div>
                  <div className="text-[10px] text-emerald-700 font-normal">Medical Response</div>
                </div>
              </a>
            </div>
          </div>

          {/* Nearest Hospitals & Emergency Facilities (OpenStreetMap Overpass 5km Radius) */}
          <div>
            <div className="font-extrabold uppercase text-[#1A0E06] text-[11px] mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#DC7009]" />
                <span>Nearest Hospitals & AEDs (5km Radius)</span>
              </span>
              {isSearchingHospitals && <span className="text-[10px] text-gray-400 font-normal animate-pulse">Scanning GPS...</span>}
            </div>

            <div className="space-y-2">
              {nearbyFacilities.map((fac) => (
                <div
                  key={fac.id}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 truncate flex items-center gap-1">
                      {fac.type === 'aed' ? (
                        <span className="text-emerald-700 font-black flex items-center gap-0.5">
                          <Zap size={12} /> AED
                        </span>
                      ) : null}
                      <span className="truncate">{fac.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-black text-orange-700">~{fac.distanceKm} km away</span>
                      {fac.emergency && <span className="text-red-600 font-bold">• 24x7 Casualty</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      title="Navigate"
                    >
                      <Navigation size={13} />
                    </a>
                    <a
                      href={`tel:${fac.phone}`}
                      className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      title="Call"
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Emergency Contacts */}
          <div>
            <div className="font-extrabold uppercase text-gray-800 text-[11px] mb-2 flex justify-between items-center">
              <span>Notify Emergency Contacts ({profile.contacts.length})</span>
            </div>

            <div className="space-y-2.5">
              {profile.contacts.map((contact, idx) => (
                <div
                  key={contact.id || idx}
                  className="p-3.5 bg-[#FEF8F3] rounded-2xl border border-[#DC7009]/20 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      {contact.name}
                      {contact.isPrimary && (
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-600">{contact.relationship} • {contact.phone}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm"
                      title="Call directly"
                    >
                      <Phone size={14} />
                    </a>
                    <a
                      href={getSmsUrl(contact.phone, sosMessage)}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
                      title="Send offline SMS alert"
                    >
                      <MessageSquare size={14} />
                    </a>
                    <a
                      href={getWhatsAppUrl(contact.phone, sosMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold transition-all shadow-sm"
                      title="Send WhatsApp alert"
                    >
                      <Send size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick SOS Message Preview */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="text-[11px] font-bold text-gray-700 mb-1">SOS Alert Message Content:</div>
            <div className="text-[11px] text-gray-600 line-clamp-4 font-mono bg-white p-2 rounded-lg border border-gray-100">
              {sosMessage}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2.5">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-2xl bg-white border border-gray-300 text-gray-800 font-bold hover:bg-gray-100 text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <MessageSquare size={16} />}
            {copied ? 'Copied!' : 'Copy Alert Text'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-2xl bg-[#FF3B30] text-white font-bold hover:opacity-90 active:scale-95 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-500/30 transition-all"
          >
            <Share2 size={16} /> Broadcast SOS
          </button>
        </div>
      </div>

      {/* Non-Verbal Emergency Phrases Modal */}
      {isPhrasesOpen && (
        <EmergencyPhraseCarousel onClose={() => setIsPhrasesOpen(false)} />
      )}
    </div>
  );
};
