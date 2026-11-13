import { UserProfile, Medication } from '../types';
import { getMedications } from './storage';

export const buildSOSMessage = (prof: UserProfile, mapLink?: string): string => {
  let msg = `🆘 EMERGENCY MEDICAL ALERT 🆘\n\n${prof.fullName} needs immediate medical assistance!\n\n`;
  if (prof.id) msg += `🪪 ID: ${prof.id}\n`;
  if (prof.bloodGroup) msg += `🩸 Blood Group: ${prof.bloodGroup}\n`;
  if (prof.dob) msg += `🎂 DOB: ${prof.dob}\n`;
  if (prof.allergies && prof.allergies.length > 0) {
    msg += `⚠️ ALLERGIES: ${prof.allergies.join(', ')}\n`;
  }
  if (prof.conditions && prof.conditions.length > 0) {
    msg += `🫀 CONDITIONS: ${prof.conditions.join(', ')}\n`;
  }
  
  const meds = getMedications();
  if (meds.length > 0) {
    msg += `💊 MEDICATIONS: ${meds.map(m => m.name).join(', ')}\n`;
  }

  if (prof.emergencyNotes) {
    msg += `📝 NOTES: ${prof.emergencyNotes}\n`;
  }

  if (prof.insurancePolicy) {
    msg += `🛡️ INSURANCE: ${prof.insurancePolicy}\n`;
  }

  if (mapLink) {
    msg += `\n📍 LIVE GPS LOCATION: ${mapLink}\n`;
  } else {
    msg += `\n📍 GPS Location: Shared via device\n`;
  }

  msg += `\nPlease respond or call emergency services immediately.\n— Sent via EMC (Emergency Medical Card)`;
  return msg;
};

export const getSmsUrl = (phone: string, msg: string): string => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
};

export const getWhatsAppUrl = (phone: string, msg: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
};

export const generateLockscreenWallpaper = async (
  prof: UserProfile,
  qrDataUrl: string
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    // 1. Dark warm background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#130B05');
    bgGrad.addColorStop(0.35, '#1F1108');
    bgGrad.addColorStop(0.7, '#2A170B');
    bgGrad.addColorStop(1, '#110903');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative top glow
    const glowGrad = ctx.createRadialGradient(540, 150, 10, 540, 150, 600);
    glowGrad.addColorStop(0, 'rgba(220, 112, 9, 0.35)');
    glowGrad.addColorStop(1, 'rgba(220, 112, 9, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, 1080, 700);

    // Helper for rounded cards
    const drawCard = (x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    // 2. Header banner with Blood Group Badge
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY MEDICAL ID', 540, 240);

    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#F8C07C';
    ctx.fillText('SCAN QR CODE FOR FULL MEDICAL HISTORY', 540, 280);

    // Profile Box
    drawCard(70, 320, 940, 310, 36, 'rgba(255, 255, 255, 0.08)', 'rgba(220, 112, 9, 0.4)');

    // Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(prof.fullName || 'Medical Card Holder', 120, 410);

    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#F8C07C';
    ctx.fillText(`ID: ${prof.id || 'EMC-00000'}  •  DOB: ${prof.dob || '—'}  •  ${prof.gender || ''}`, 120, 460);

    // Blood Group pill
    drawCard(120, 500, 240, 80, 40, '#FF3B30');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🩸 ${prof.bloodGroup || 'O+'}`, 240, 555);

    if (prof.organDonor) {
      drawCard(390, 500, 260, 80, 40, '#34C759');
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('🫀 ORGAN DONOR', 520, 552);
    }

    // 3. Urgent Allergies section
    drawCard(70, 660, 940, 200, 32, 'rgba(255, 59, 48, 0.12)', 'rgba(255, 59, 48, 0.5)');
    ctx.fillStyle = '#FF453A';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚠️ CRITICAL ALLERGIES', 110, 710);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    const allergiesText = prof.allergies && prof.allergies.length > 0 ? prof.allergies.join(', ') : 'None documented';
    ctx.fillText(allergiesText.length > 55 ? allergiesText.slice(0, 52) + '...' : allergiesText, 110, 770);

    // 4. Medical Conditions section
    drawCard(70, 890, 940, 200, 32, 'rgba(220, 112, 9, 0.12)', 'rgba(220, 112, 9, 0.4)');
    ctx.fillStyle = '#F8C07C';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🫀 CHRONIC CONDITIONS', 110, 940);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    const condText = prof.conditions && prof.conditions.length > 0 ? prof.conditions.join(', ') : 'None documented';
    ctx.fillText(condText.length > 55 ? condText.slice(0, 52) + '...' : condText, 110, 1000);

    // 5. Emergency Contacts section
    drawCard(70, 1120, 940, 200, 32, 'rgba(52, 199, 89, 0.12)', 'rgba(52, 199, 89, 0.4)');
    ctx.fillStyle = '#34C759';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📞 PRIMARY EMERGENCY CONTACT', 110, 1170);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    const primaryContact = prof.contacts?.find(c => c.isPrimary) || prof.contacts?.[0];
    if (primaryContact) {
      ctx.fillText(`${primaryContact.name} (${primaryContact.relationship}): ${primaryContact.phone}`, 110, 1230);
    } else {
      ctx.fillText('Emergency Services: 112 / 108', 110, 1230);
    }

    // 6. QR Code Card (Lower area)
    drawCard(70, 1350, 940, 480, 36, '#FFFFFF');
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 120, 1390, 400, 400);

      ctx.fillStyle = '#1A0E06';
      ctx.textAlign = 'left';
      ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SCAN FOR LIVE', 560, 1500);
      ctx.fillText('MEDICAL DATA', 560, 1545);

      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#5C4030';
      ctx.fillText('• Full Prescription list', 560, 1600);
      ctx.fillText('• Blood test history', 560, 1635);
      ctx.fillText('• Doctor contacts', 560, 1670);
      ctx.fillText('• Insurance info', 560, 1705);

      ctx.fillStyle = '#DC7009';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('EMC • Offline First', 560, 1760);

      // Bottom footer text
      ctx.fillStyle = '#8E8E93';
      ctx.textAlign = 'center';
      ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('In case of emergency, first responders may scan without unlocking', 540, 1870);

      const url = canvas.toDataURL('image/png');
      resolve(url);
    };
    qrImg.onerror = () => {
      resolve(canvas.toDataURL('image/png'));
    };
    qrImg.src = qrDataUrl;
  });
};

export const printMedicalCard = (
  prof: UserProfile,
  meds: Medication[],
  qrDataUrl: string
): void => {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups to print your Medical Card.');
    return;
  }

  const escapeScript = '<' + 'script>';
  const escapeEndScript = '<' + '/script>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EMC — Print & Wallet Card</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 24px;
      color: #1A0E06;
      background: #FFFFFF;
    }
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    .no-print {
      margin-bottom: 24px;
      padding: 12px 20px;
      background: #FEF2E0;
      border: 1px solid #DC7009;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #DC7009;
      color: #FFF;
      border: none;
      padding: 10px 24px;
      font-size: 16px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }

    /* Wallet Card Section (85.6mm x 54mm Standard Credit/ID size) */
    .wallet-section {
      border: 2px dashed #DC7009;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 32px;
      background: #FFFBF7;
    }
    .wallet-card-container {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .wallet-card {
      width: 324px;
      height: 204px;
      border-radius: 12px;
      box-sizing: border-box;
      padding: 14px;
      position: relative;
      background: linear-gradient(135deg, #A84B06 0%, #DC7009 50%, #F0943C 100%);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .wallet-card-back {
      background: #1A0E06;
      color: #FFFFFF;
      border: 1px solid rgba(220,112,9,0.3);
    }
    .badge-bg {
      position: absolute;
      top: 14px;
      right: 14px;
      background: #FF3B30;
      color: #FFF;
      font-weight: 900;
      font-size: 18px;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .card-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .card-name {
      font-size: 20px;
      font-weight: 900;
      margin: 4px 0 2px;
    }
    .card-meta {
      font-size: 11px;
      opacity: 0.95;
    }
    .card-tags {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 10px;
    }
    .tag-red {
      background: rgba(255,59,48,0.9);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
    .tag-amber {
      background: rgba(0,0,0,0.35);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Full A4 Admission Record */
    .a4-section {
      border-top: 2px solid #DC7009;
      padding-top: 24px;
    }
    .a4-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .a4-title {
      font-size: 24px;
      font-weight: 900;
      color: #A84B06;
    }
    .a4-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-box {
      border: 1px solid #E5D5C5;
      padding: 12px;
      border-radius: 8px;
      background: #FAFAFA;
    }
    .info-box.alert {
      border-color: #FF3B30;
      background: #FFF5F5;
    }
    .info-lbl {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #A08060;
      margin-bottom: 4px;
    }
    .info-val {
      font-size: 14px;
      font-weight: 700;
      color: #1A0E06;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .table th, .table td {
      border: 1px solid #E5D5C5;
      padding: 8px 10px;
      text-align: left;
      font-size: 12px;
    }
    .table th {
      background: #FEF2E0;
      font-weight: 800;
      color: #A84B06;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong>🖨️ EMC Printable Sheet</strong>
      <div style="font-size: 13px; color: #5C4030;">Cut out the wallet card or save the full A4 medical sheet for hospital admission.</div>
    </div>
    <button class="btn-print" onclick="window.print()">Print Document</button>
  </div>

  <!-- WALLET CARD CUTOUT -->
  <div class="wallet-section">
    <div style="font-weight: 800; font-size: 13px; color: #A84B06; margin-bottom: 12px;">
      ✂️ WALLET CARD (Cut & Fold / Laminate — Standard 85.6 × 54 mm)
    </div>
    <div class="wallet-card-container">
      <!-- FRONT -->
      <div class="wallet-card">
        <div class="card-title">EMC • EMERGENCY ID</div>
        <div class="badge-bg">${prof.bloodGroup || 'O+'}</div>
        <div class="card-name">${prof.fullName || 'Medical Card Holder'}</div>
        <div class="card-meta">DOB: ${prof.dob || '—'} • Age: ${prof.dob ? new Date().getFullYear() - new Date(prof.dob).getFullYear() : '—'} • ${prof.gender || ''}</div>
        
        <div class="card-tags">
          <div class="tag-red">⚠️ ALLERGIES: ${(prof.allergies || []).join(', ') || 'None reported'}</div>
          <div class="tag-amber">🫀 ${(prof.conditions || []).join(', ') || 'No chronic conditions'}</div>
        </div>

        <div style="position: absolute; bottom: 10px; left: 14px; font-size: 9px; opacity: 0.9;">
          ID: ${prof.id || 'EMC-00000'} ${prof.organDonor ? '• Organ Donor' : ''}
        </div>
      </div>

      <!-- BACK -->
      <div class="wallet-card wallet-card-back">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div class="card-title" style="color: #F8C07C;">EMERGENCY CONTACTS</div>
            ${(prof.contacts || []).map(c => `
              <div style="font-size: 11px; margin-top: 4px;">
                <strong>${c.name}</strong> (${c.relationship})<br>
                <span style="color: #34C759; font-weight: 700;">${c.phone}</span>
              </div>
            `).join('')}
            <div style="margin-top: 8px; font-size: 9px; color: #A08060;">
              Insurance: ${prof.insurancePolicy || 'None'}<br>
              Emergency Dial: 112 / 108
            </div>
          </div>
          <div>
            <img src="${qrDataUrl}" alt="QR" style="width: 100px; height: 100px; border-radius: 6px; background: #FFF; padding: 4px;" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- FULL A4 SHEET -->
  <div class="a4-section">
    <div class="a4-header">
      <div>
        <div class="a4-title">EMERGENCY MEDICAL RECORD</div>
        <div style="font-size: 13px; color: #5C4030;">Generated via EMC — Comprehensive Emergency Health Profile</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 18px; font-weight: 900; color: #FF3B30;">BLOOD GROUP: ${prof.bloodGroup || 'Unknown'}</div>
        <div style="font-size: 12px; color: #A08060;">Card ID: ${prof.id || 'EMC-00000'}</div>
      </div>
    </div>

    <div class="a4-grid">
      <div class="info-box">
        <div class="info-lbl">Patient Full Name</div>
        <div class="info-val">${prof.fullName || '—'}</div>
        <div style="font-size: 12px; margin-top: 4px; color: #5C4030;">DOB: ${prof.dob || '—'} | Gender: ${prof.gender || '—'} | Weight: ${prof.weight ? prof.weight + ' kg' : '—'}</div>
      </div>

      <div class="info-box alert">
        <div class="info-lbl" style="color: #FF3B30;">Known Allergies (Severe Warning)</div>
        <div class="info-val" style="color: #C0392B;">${(prof.allergies || []).join(', ') || 'No Known Drug / Food Allergies'}</div>
      </div>

      <div class="info-box">
        <div class="info-lbl">Diagnosed Chronic Conditions</div>
        <div class="info-val">${(prof.conditions || []).join(', ') || 'None Documented'}</div>
      </div>

      <div class="info-box">
        <div class="info-lbl">Emergency Contacts & Next of Kin</div>
        <div class="info-val">
          ${(prof.contacts || []).map(c => `${c.name} (${c.relationship}): ${c.phone}`).join(' | ') || 'None'}
        </div>
      </div>
    </div>

    ${prof.emergencyNotes ? `
      <div class="info-box" style="margin-bottom: 16px;">
        <div class="info-lbl">Emergency Clinical Notes & Directives</div>
        <div class="info-val" style="font-size: 13px;">${prof.emergencyNotes}</div>
      </div>
    ` : ''}

    <div style="font-weight: 800; font-size: 15px; margin-top: 16px; margin-bottom: 6px; color: #A84B06;">
      CURRENT ACTIVE MEDICATIONS (${meds.length})
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Medicine Name</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Timing</th>
          <th>Indication / Notes</th>
        </tr>
      </thead>
      <tbody>
        ${meds.length > 0 ? meds.map(m => `
          <tr>
            <td><strong>${m.name}</strong>${m.genericName ? `<br><small style="color:#777;">${m.genericName}</small>` : ''}</td>
            <td>${m.dose || '—'}</td>
            <td>${m.freq || '—'}</td>
            <td>${m.tod || '—'} (${m.time || '—'})</td>
            <td>${m.cond || m.notes || '—'}</td>
          </tr>
        `).join('') : '<tr><td colspan="5">No active medications registered.</td></tr>'}
      </tbody>
    </table>

    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #EEE; display: flex; justify-content: space-between; font-size: 11px; color: #888;">
      <div>EMC v2.0 • Offline-First Personal Health Card</div>
      <div>Printed on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
    </div>
  </div>

  ${escapeScript}
    // Auto trigger print when loaded
    window.addEventListener('load', () => {
      // Allow image rendering before printing
      setTimeout(() => {}, 400);
    });
  ${escapeEndScript}
</body>
</html>`;

  win.document.write(html);
  win.document.close();
};

export const writeNfcMedicalTag = async (prof: UserProfile): Promise<{ success: boolean; message: string }> => {
  if (!('NDEFReader' in window)) {
    return {
      success: false,
      message: 'Web NFC is only supported on Android Chrome. Please use the QR code or share option.'
    };
  }

  try {
    const NDEFReaderClass = (window as unknown as { NDEFReader: new () => { write: (msg: { records: { recordType: string; data: string }[] }) => Promise<void> } }).NDEFReader;
    const ndef = new NDEFReaderClass();
    const sosMsg = buildSOSMessage(prof);

    await ndef.write({
      records: [
        { recordType: 'url', data: window.location.href },
        { recordType: 'text', data: `EMC:${prof.id}|${prof.fullName}|${prof.bloodGroup}` },
        { recordType: 'text', data: sosMsg }
      ]
    });

    return {
      success: true,
      message: 'Successfully written to NFC tag! Tap again to verify.'
    };
  } catch (err) {
    console.error('NFC Write Error:', err);
    return {
      success: false,
      message: 'Failed to write NFC tag. Hold the card close to the phone NFC antenna.'
    };
  }
};
