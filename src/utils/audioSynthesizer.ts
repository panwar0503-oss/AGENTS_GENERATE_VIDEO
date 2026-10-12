/**
 * Audio Synthesizer: Handles AI Voiceover (Gemini TTS with Web Speech fallback)
 * and royalty-free Web Audio procedural music synthesis.
 */

let globalAudioCtx: AudioContext | null = null;
let currentMusicSource: { stop: () => void } | null = null;

export function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioCtx = new AudioCtxClass();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

// Convert base64 audio/wav string to an AudioBuffer
export async function base64ToAudioBuffer(base64Data: string): Promise<AudioBuffer> {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const ctx = getAudioContext();
  return await ctx.decodeAudioData(bytes.buffer.slice(0));
}

// Play Voiceover Narration via Gemini TTS or Browser Fallback
export async function synthesizeVoice(
  text: string,
  voiceName: string = 'Zephyr',
  speed: number = 1.0
): Promise<{ play: () => Promise<void>; stop: () => void; durationEstimate: number }> {
  const words = text.split(/\s+/).length;
  const durationEstimate = Math.max(2, (words / (2.5 * speed)));

  try {
    const response = await fetch('/api/generate-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audioBase64) {
        const audioBuffer = await base64ToAudioBuffer(data.audioBase64);
        let activeSource: AudioBufferSourceNode | null = null;

        return {
          durationEstimate: audioBuffer.duration,
          play: async () => {
            const ctx = getAudioContext();
            if (activeSource) {
              try { activeSource.stop(); } catch {}
            }
            activeSource = ctx.createBufferSource();
            activeSource.buffer = audioBuffer;
            activeSource.playbackRate.value = speed;
            activeSource.connect(ctx.destination);
            activeSource.start();

            return new Promise((resolve) => {
              if (activeSource) {
                activeSource.onended = () => resolve();
              } else {
                resolve();
              }
            });
          },
          stop: () => {
            if (activeSource) {
              try { activeSource.stop(); } catch {}
              activeSource = null;
            }
          }
        };
      }
    }
  } catch (err) {
    console.warn('Backend TTS failed, falling back to Web Speech Synthesis:', err);
  }

  // Web Speech API fallback
  return {
    durationEstimate,
    play: async () => {
      return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
          setTimeout(resolve, durationEstimate * 1000);
          return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.pitch = voiceName === 'Kore' ? 1.15 : voiceName === 'Fenrir' ? 0.85 : 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Select natural sounding voice if available
          const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
          if (preferred) utterance.voice = preferred;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    },
    stop: () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };
}

// Procedural Background Music Synthesizer (Zero-copyright, 100% royalty-free Web Audio generation)
export function startProceduralMusic(trackId: string, volume: number = 0.25): { stop: () => void; setVolume: (v: number) => void } {
  if (currentMusicSource) {
    currentMusicSource.stop();
    currentMusicSource = null;
  }

  if (trackId === 'track_none' || volume <= 0) {
    return { stop: () => {}, setVolume: () => {} };
  }

  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  masterGain.connect(ctx.destination);

  let isPlaying = true;
  let timerId: any = null;

  // Chord frequencies (Hz) for different moods
  const chordsByTrack: Record<string, number[][]> = {
    track_lofi_focus: [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ],
    track_synth_momentum: [
      [130.81, 164.81, 196.00, 261.63], // C minor / power
      [116.54, 146.83, 174.61, 233.08], // Bb
      [103.83, 130.81, 155.56, 207.65], // Ab
      [116.54, 146.83, 174.61, 233.08], // Bb
    ],
    track_cinematic_inspire: [
      [196.00, 246.94, 293.66, 392.00], // G
      [164.81, 196.00, 246.94, 329.63], // Em
      [174.61, 220.00, 261.63, 349.23], // F
      [130.81, 164.81, 196.00, 261.63], // C
    ],
    track_corporate_clarity: [
      [261.63, 329.63, 392.00], // C
      [293.66, 369.99, 440.00], // D
      [329.63, 392.00, 493.88], // Em
      [261.63, 329.63, 392.00], // C
    ]
  };

  const chordProgression = chordsByTrack[trackId] || chordsByTrack.track_lofi_focus;
  let currentChordIndex = 0;

  function playNextChord() {
    if (!isPlaying) return;

    const chord = chordProgression[currentChordIndex];
    currentChordIndex = (currentChordIndex + 1) % chordProgression.length;

    const chordDuration = trackId === 'track_synth_momentum' ? 1.8 : 3.2;
    const now = ctx.currentTime;

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Instrument Timbre
      if (trackId === 'track_synth_momentum') {
        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
      } else if (trackId === 'track_lofi_focus') {
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
      } else {
        osc.type = 'triangle';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
      }

      osc.frequency.setValueAtTime(freq, now);

      // Envelope
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.08 / chord.length, now + 0.3);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + chordDuration);
    });

    timerId = setTimeout(playNextChord, chordDuration * 950);
  }

  playNextChord();

  const controller = {
    stop: () => {
      isPlaying = false;
      if (timerId) clearTimeout(timerId);
      try {
        masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      } catch {}
    },
    setVolume: (v: number) => {
      try {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v * 0.4)), ctx.currentTime);
      } catch {}
    }
  };

  currentMusicSource = controller;
  return controller;
}
