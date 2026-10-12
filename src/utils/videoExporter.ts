import { VideoProject } from '../types/video';
import { renderVideoFrame, preloadImage } from './videoCanvasPlayer';
import { getAudioContext, startProceduralMusic, getSceneAudioBuffer } from './audioSynthesizer';
import { PRESENTER_CHARACTERS } from '../data/presenterCharacters';

export async function renderAndExportVideo(
  project: VideoProject,
  onProgress: (percent: number, statusText: string) => void
): Promise<{ videoBlob: Blob; downloadUrl: string; filename: string }> {
  // 1. Preload all scene images & presenter portraits
  onProgress(5, 'Preloading royalty-free visual assets...');
  for (const scene of project.scenes) {
    if (!scene.mediaUrl.startsWith('gen:')) {
      await preloadImage(scene.mediaUrl);
    }
  }

  if (project.presenterConfig?.enabled) {
    const character = PRESENTER_CHARACTERS.find(
      (c) => c.id === project.presenterConfig.characterId
    ) || PRESENTER_CHARACTERS[0];
    await preloadImage(character.avatarUrl);
    for (const exprUrl of Object.values(character.emotionalExpressions)) {
      await preloadImage(exprUrl);
    }
  }

  // 2. Synthesize & cache clean voiceover audio buffers with scene-matched emotions
  onProgress(10, 'Generating clean studio voiceovers with matched scene emotions...');
  const sceneVoiceBuffers: AudioBuffer[] = [];
  for (const scene of project.scenes) {
    const { buffer: buf } = await getSceneAudioBuffer(
      scene.narrationText,
      project.voiceConfig.voiceName,
      scene.emotion || 'explaining',
      project.voiceConfig.speed || 1.0
    );
    sceneVoiceBuffers.push(buf);
  }

  const isVertical = project.aspectRatio === '9:16';
  // Standard export dimensions (1080x1920 for vertical, 1920x1080 for horizontal)
  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Set up audio destination for recording
  const audioCtx = getAudioContext();
  const audioDest = audioCtx.createMediaStreamDestination();

  // Background music fed directly into audioDest stream
  const musicController = startProceduralMusic(
    project.musicConfig.trackId,
    project.musicConfig.volume || 0.2,
    audioDest
  );

  // Combine canvas video stream + audio stream
  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  // Determine supported mime type
  const mimeType = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    ? 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 4_500_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  const totalDuration = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const fps = 30;
  const frameInterval = 1000 / fps;
  let currentTime = 0;

  onProgress(15, 'Rendering video frames and syncing audio...');

  return new Promise((resolve, reject) => {
    let sceneIndex = 0;
    let sceneStartTime = 0;
    let activeVoiceSource: AudioBufferSourceNode | null = null;

    function playSceneVoice(idx: number) {
      if (activeVoiceSource) {
        try { activeVoiceSource.stop(); } catch {}
        activeVoiceSource = null;
      }
      const buf = sceneVoiceBuffers[idx];
      if (buf) {
        activeVoiceSource = audioCtx.createBufferSource();
        activeVoiceSource.buffer = buf;
        activeVoiceSource.playbackRate.value = project.voiceConfig.speed || 1.0;
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(project.voiceConfig.volume || 1.0, audioCtx.currentTime);
        activeVoiceSource.connect(gainNode);
        gainNode.connect(audioDest);
        activeVoiceSource.start();
      }
    }

    // Play first scene voiceover
    playSceneVoice(0);

    const intervalId = setInterval(() => {
      currentTime += 1 / fps;
      const progressPercent = Math.min(95, Math.round(15 + (currentTime / totalDuration) * 80));

      const currentScene = project.scenes[sceneIndex];
      const sceneElapsed = currentTime - sceneStartTime;

      if (sceneElapsed >= currentScene.durationSeconds) {
        sceneIndex++;
        sceneStartTime = currentTime;
        if (sceneIndex >= project.scenes.length) {
          // Finished rendering
          clearInterval(intervalId);
          if (activeVoiceSource) {
            try { activeVoiceSource.stop(); } catch {}
          }
          onProgress(98, 'Packaging final MP4 container...');
          recorder.stop();
          musicController.stop();

          recorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: mimeType });
            const downloadUrl = URL.createObjectURL(finalBlob);
            const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const filename = `${safeTitle}_${project.aspectRatio.replace(':', 'x')}.${ext}`;

            onProgress(100, 'Video ready for download!');
            resolve({ videoBlob: finalBlob, downloadUrl, filename });
          };
          return;
        }

        // Trigger next scene voiceover
        playSceneVoice(sceneIndex);
      }

      const activeScene = project.scenes[sceneIndex];
      const activeSceneTime = currentTime - sceneStartTime;

      renderVideoFrame({
        ctx,
        project,
        currentScene: activeScene,
        sceneLocalTime: activeSceneTime,
        width,
        height,
      });

      onProgress(progressPercent, `Rendering Scene ${sceneIndex + 1} of ${project.scenes.length} (${Math.round(currentTime)}s / ${Math.round(totalDuration)}s)...`);
    }, frameInterval);
  });
}
