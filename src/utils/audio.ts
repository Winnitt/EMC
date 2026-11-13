/**
 * Web Audio API alarm and alert synthesizer
 * Generates clear medical buzzer and notification tones without external audio files
 */

export const playAlarmTone = (count = 3): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      // Alternating high & mid frequency tones: A5 (880Hz) and E5 (660Hz)
      osc.frequency.value = i % 2 === 0 ? 880 : 660;

      const t = ctx.currentTime + i * 0.38;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);

      osc.start(t);
      osc.stop(t + 0.35);
    }
  } catch (err) {
    console.warn('Audio tone playback restricted by browser policy', err);
  }
};

export const playDoseChime = (): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Bright ascending chime)
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const t = ctx.currentTime + idx * 0.1;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  } catch (err) {
    console.warn('Audio chime playback restricted', err);
  }
};
