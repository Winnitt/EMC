// Zero-Backend URL Hash AES-GCM Sync Engine
// Preserves complete offline privacy: URL hash fragments are never sent to web servers.

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateShareableEncryptedUrl(profileData: any): Promise<string> {
  const jsonStr = JSON.stringify(profileData);

  // 1. Generate local ephemeral AES-GCM Key (256-bit)
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // 2. Generate 12-byte random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(jsonStr);

  // 3. Encrypt payload
  const encryptedBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  // 4. Export key to raw base64
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);

  const payload = {
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encryptedBuf)
  };

  const hashString = `data=${encodeURIComponent(JSON.stringify(payload))}&key=${encodeURIComponent(arrayBufferToBase64(exportedKey))}`;
  const origin = window.location.origin + window.location.pathname;
  return `${origin}#share=${hashString}`;
}

export async function decryptShareablePayload(hashString: string): Promise<any | null> {
  try {
    const cleanHash = hashString.startsWith('#') ? hashString.substring(1) : hashString;
    const match = cleanHash.match(/data=([^&]+)&key=([^&]+)/);
    if (!match) return null;

    const payloadRaw = decodeURIComponent(match[1]);
    const keyBase64 = decodeURIComponent(match[2]);

    const payload = JSON.parse(payloadRaw);
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const encryptedData = base64ToArrayBuffer(payload.data);
    const keyRaw = base64ToArrayBuffer(keyBase64);

    const key = await window.crypto.subtle.importKey(
      'raw',
      keyRaw,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    const decodedStr = new TextDecoder().decode(decryptedBuf);
    return JSON.parse(decodedStr);
  } catch (err) {
    console.error('Failed to decrypt shareable payload:', err);
    return null;
  }
}
