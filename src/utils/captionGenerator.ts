import { Scene } from '../types/video';

export interface TimedWord {
  word: string;
  start: number; // in seconds relative to scene
  end: number;
  isKeyWord: boolean;
}

export interface TimedPhrase {
  words: TimedWord[];
  start: number;
  end: number;
}

// Compute word-level timing from scene narration text and duration
export function calculateSceneWordTimings(scene: Scene): TimedWord[] {
  const rawWords = scene.narrationText.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return [];

  const totalDuration = scene.durationSeconds || 5;
  const wordDuration = totalDuration / rawWords.length;
  const lowerKeyWords = (scene.captionKeywords || []).map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));

  return rawWords.map((w, index) => {
    const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isKeyWord = lowerKeyWords.some(k => k && cleanWord.includes(k));
    const start = index * wordDuration;
    const end = (index + 1) * wordDuration;

    return {
      word: w,
      start,
      end,
      isKeyWord
    };
  });
}

// Group into compact reading phrases (e.g. 3-5 words at a time like TikTok/Shorts captions)
export function groupIntoPhrases(timedWords: TimedWord[], wordsPerPhrase: number = 4): TimedPhrase[] {
  const phrases: TimedPhrase[] = [];
  for (let i = 0; i < timedWords.length; i += wordsPerPhrase) {
    const slice = timedWords.slice(i, i + wordsPerPhrase);
    if (slice.length > 0) {
      phrases.push({
        words: slice,
        start: slice[0].start,
        end: slice[slice.length - 1].end
      });
    }
  }
  return phrases;
}

// Format seconds into SRT timestamp: 00:00:00,000
function formatSrtTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(millis, 3)}`;
}

// Generate .SRT subtitle file text from scenes
export function exportScenesToSrt(scenes: Scene[]): string {
  let srtContent = '';
  let counter = 1;
  let runningTime = 0;

  for (const scene of scenes) {
    const timedWords = calculateSceneWordTimings(scene);
    const phrases = groupIntoPhrases(timedWords, 5);

    for (const phrase of phrases) {
      const phraseStart = runningTime + phrase.start;
      const phraseEnd = runningTime + phrase.end;
      const text = phrase.words.map(w => w.word).join(' ');

      srtContent += `${counter}\n`;
      srtContent += `${formatSrtTimestamp(phraseStart)} --> ${formatSrtTimestamp(phraseEnd)}\n`;
      srtContent += `${text}\n\n`;
      counter++;
    }

    runningTime += scene.durationSeconds;
  }

  return srtContent.trim();
}
