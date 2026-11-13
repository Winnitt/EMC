// Speech Synthesis helper for Senior Citizen accessibility
export const speakText = (text: string, onEnd?: () => void, langCode?: string): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop previous utterances
    const cleanText = text.replace(/[*_#•]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.88; // Slightly slower, clearer pace for seniors
    utterance.pitch = 1.0;

    // Map short codes to BCP-47 language tags
    const langMap: Record<string, string> = {
      ml: 'ml-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      bn: 'bn-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN',
      en: 'en-US'
    };

    const targetLang = (langCode && langMap[langCode]) || (langCode && langCode.includes('-') ? langCode : 'en-US');
    utterance.lang = targetLang;

    // Try to find a matching voice if voices are loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchingVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
    return false;
  }
};

export const stopSpeaking = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};
