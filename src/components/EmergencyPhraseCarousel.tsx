import React, { useState } from 'react';
import { Volume2, VolumeX, X, ChevronLeft, ChevronRight, MessageSquare, Radio } from 'lucide-react';
import phrasesData from '../data/emergencyPhrases.json';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speech';
import { useI18n } from '../utils/i18n';

interface EmergencyPhraseCarouselProps {
  onClose: () => void;
  isSeniorMode?: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' }
];

export const EmergencyPhraseCarousel: React.FC<EmergencyPhraseCarouselProps> = ({
  onClose,
  isSeniorMode = false
}) => {
  const { currentLang } = useI18n();
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    // If the active app language is in our flashcard languages, start with it
    if (LANGUAGES.some(l => l.code === currentLang)) {
      return currentLang;
    }
    return 'en';
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [speaking, setSpeaking] = useState<boolean>(false);

  const currentItem = phrasesData[currentIndex] || phrasesData[0];
  const phraseInLang = (currentItem.phrases as Record<string, string>)[selectedLang] || currentItem.phrases.en;
  const phraseInEn = currentItem.phrases.en;

  const handleNext = () => {
    stopSpeaking();
    setSpeaking(false);
    setCurrentIndex(prev => (prev + 1) % phrasesData.length);
  };

  const handlePrev = () => {
    stopSpeaking();
    setSpeaking(false);
    setCurrentIndex(prev => (prev - 1 + phrasesData.length) % phrasesData.length);
  };

  const handleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);

    // Read the condition completely:
    // Full condition announcement + clear step-by-step instructions
    const conditionPrefix = `Emergency Medical Alert. Condition: ${currentItem.category}. `;
    const fullTextNative = `${currentItem.category}. ${phraseInLang}`;

    if (selectedLang !== 'en') {
      // Speak the native instruction first with native voice, followed by the complete English translation
      speakText(fullTextNative, () => {
        speakText(`In English. Medical Condition: ${currentItem.category}. Instructions: ${phraseInEn}`, () => {
          setSpeaking(false);
        }, 'en');
      }, selectedLang);
    } else {
      speakText(`${conditionPrefix} Instructions: ${phraseInEn}`, () => {
        setSpeaking(false);
      }, 'en');
    }
  };

  const handleClose = () => {
    stopSpeaking();
    setSpeaking(false);
    onClose();
  };

  return (
    <div
      id="emergency-phrase-carousel-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#1D120A] border-2 border-[#DC7009] rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-600/20 text-[#DC7009]">
              <MessageSquare size={20} />
            </span>
            <div>
              <h2 className="font-black text-base sm:text-lg leading-tight">
                Emergency Flashcard
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                12 Indian Languages • Non-Verbal Bystander Display
              </p>
            </div>
          </div>

          <button
            id="emergency-phrases-close-btn"
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Language Selection Bar (Scrollable) */}
        <div className="py-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-b border-white/10">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelectedLang(lang.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                selectedLang === lang.code
                  ? 'bg-[#DC7009] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span>{lang.native}</span>
              <span className="text-[10px] ml-1 opacity-70">({lang.name})</span>
            </button>
          ))}
        </div>

        {/* Main Card Content */}
        <div className="flex-1 flex flex-col justify-center py-6 text-center">
          <div className="text-5xl mb-3">{currentItem.icon}</div>
          <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-black uppercase tracking-wider mx-auto mb-4 border border-red-500/30">
            {currentItem.category}
          </span>

          {/* Native Language Big Text */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-3">
            <p className={`font-black text-white leading-snug ${isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              "{phraseInLang}"
            </p>
          </div>

          {/* English Subtitle */}
          {selectedLang !== 'en' && (
            <p className="text-xs sm:text-sm text-gray-400 italic px-4 font-medium">
              English: "{phraseInEn}"
            </p>
          )}
        </div>

        {/* Footer Controls */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={handlePrev}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1"
            title="Previous Scenario"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            id="emergency-phrase-speak-btn"
            type="button"
            onClick={handleSpeak}
            className={`flex-1 py-3 px-4 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
              speaking
                ? 'bg-red-600 hover:bg-red-700 animate-pulse ring-2 ring-red-400'
                : 'bg-[#DC7009] hover:bg-[#EB8524]'
            }`}
            title="Read condition name and full instructions completely aloud"
          >
            {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{speaking ? 'Stop Reading' : 'Read Condition Completely'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1"
            title="Next Scenario"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Counter Indicators */}
        <div className="flex justify-center gap-1.5 pt-3">
          {phrasesData.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'w-6 bg-[#DC7009]' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
