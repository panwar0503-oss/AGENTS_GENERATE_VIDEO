import { VideoProject, Scene, CaptionConfig } from '../types/video';
import { calculateSceneWordTimings, groupIntoPhrases, TimedPhrase } from './captionGenerator';
import { PRESENTER_CHARACTERS } from '../data/presenterCharacters';
import { getLiveAudioVolume, isCharacterSpeaking } from './audioSynthesizer';

// Cache loaded images
const imageCache = new Map<string, HTMLImageElement>();

export function preloadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      // Create fallback colored canvas
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1200;
      fallbackCanvas.height = 800;
      const fCtx = fallbackCanvas.getContext('2d')!;
      fCtx.fillStyle = '#1e1b4b';
      fCtx.fillRect(0, 0, 1200, 800);
      const fallbackImg = new Image();
      fallbackImg.src = fallbackCanvas.toDataURL();
      imageCache.set(url, fallbackImg);
      resolve(fallbackImg);
    };
    img.src = url;
  });
}

// Procedural Generative Art Renderers
function renderGenerativeVisual(
  ctx: CanvasRenderingContext2D,
  type: string,
  width: number,
  height: number,
  sceneTime: number
) {
  const t = sceneTime * 1.5;

  if (type === 'gen:neural' || type === 'gen:synapse') {
    // Neural network grid with pulsing nodes & connections
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 1.5;

    const nodeCount = 35;
    const nodes: { x: number; y: number; pulse: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 4 + t * 0.1;
      const radius = 120 + Math.sin(t + i) * 60;
      const x = width / 2 + Math.cos(angle + i) * (width * 0.38);
      const y = height / 2 + Math.sin(angle * 1.5 + i) * (height * 0.35);
      nodes.push({ x, y, pulse: Math.sin(t * 3 + i * 2) });
    }

    // Connect close nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < width * 0.25) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw glowing nodes
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4 + node.pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = node.pulse > 0.5 ? '#38bdf8' : '#818cf8';
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  } else if (type === 'gen:candlestick') {
    // Financial Candlestick Chart Motion
    ctx.fillStyle = '#060d17';
    ctx.fillRect(0, 0, width, height);

    const candleWidth = width / 22;
    for (let i = 0; i < 20; i++) {
      const x = (i + 1) * (width / 21);
      const baseH = height * 0.55 + Math.sin(i * 0.8 + t) * (height * 0.2);
      const open = baseH + Math.sin(i * 2 + t * 1.2) * 40;
      const close = baseH - Math.cos(i * 1.5 + t * 1.4) * 50;
      const isGreen = close < open;

      ctx.strokeStyle = isGreen ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, Math.min(open, close) - 25);
      ctx.lineTo(x, Math.max(open, close) + 25);
      ctx.stroke();

      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)';
      ctx.fillRect(x - candleWidth * 0.4, Math.min(open, close), candleWidth * 0.8, Math.abs(close - open) || 8);
    }
  } else if (type === 'gen:nebula') {
    // Cosmic Nebula Starfield
    const grad = ctx.createRadialGradient(
      width / 2 + Math.sin(t * 0.3) * 100,
      height / 2 + Math.cos(t * 0.3) * 100,
      40,
      width / 2,
      height / 2,
      width * 0.8
    );
    grad.addColorStop(0, '#4338ca');
    grad.addColorStop(0.4, '#6b21a8');
    grad.addColorStop(0.8, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 123.45 + t * 20) % width);
      const sy = ((i * 678.9) % height);
      const sRadius = (Math.sin(t * 2 + i) + 1.2) * 1.2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'gen:cyber_grid') {
    // Cyber Grid Matrix Flow
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1.2;

    const horizonY = height * 0.42;
    // Perspective grid lines
    const lineCount = 14;
    for (let i = 0; i < lineCount; i++) {
      const lx = (i / (lineCount - 1)) * width * 1.6 - width * 0.3;
      ctx.beginPath();
      ctx.moveTo(width / 2, horizonY);
      ctx.lineTo(lx, height);
      ctx.stroke();
    }
    // Horizontal animated terrain bars
    for (let j = 0; j < 10; j++) {
      const prog = (j / 10 + (t * 0.4) % 0.1) % 1;
      const py = horizonY + Math.pow(prog, 2) * (height - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.strokeStyle = `rgba(129, 140, 248, ${0.1 + prog * 0.4})`;
      ctx.stroke();
    }
  } else if (type === 'gen:synapse') {
    // Cognitive Synapse & Neural Pulse Network
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    for (let r = 0; r < 5; r++) {
      const radius = 60 + r * 55 + Math.sin(t * 2 + r) * 15;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.35 - r * 0.05})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (let p = 0; p < 24; p++) {
      const angle = (p / 24) * Math.PI * 2 + t * 0.5;
      const dist = 70 + (p % 4) * 50 + Math.sin(t * 3 + p) * 20;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  } else {
    // Aurora Gradient Flow (default)
    const g = ctx.createLinearGradient(
      Math.sin(t * 0.4) * width * 0.5 + width * 0.5,
      0,
      width,
      height
    );
    g.addColorStop(0, '#0f172a');
    g.addColorStop(0.35, '#1e1b4b');
    g.addColorStop(0.7, '#312e81');
    g.addColorStop(1, '#0284c7');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
}

// Render Video Frame onto Canvas
export function renderVideoFrame({
  ctx,
  project,
  currentScene,
  sceneLocalTime,
  width,
  height,
}: {
  ctx: CanvasRenderingContext2D;
  project: VideoProject;
  currentScene: Scene;
  sceneLocalTime: number;
  width: number;
  height: number;
}) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Visual / Media
  const mediaUrl = currentScene.mediaUrl;
  if (mediaUrl.startsWith('gen:')) {
    renderGenerativeVisual(ctx, mediaUrl, width, height, sceneLocalTime);
  } else if (imageCache.has(mediaUrl)) {
    const img = imageCache.get(mediaUrl)!;
    
    // --- Cinematic Camera Motion Smoothing Engine ---
    // Smooth documentary camera moves: subtle pans, tilts, zooms, and organic handheld micro-drifts
    const duration = Math.max(1, currentScene.durationSeconds || 5);
    const rawProgress = Math.min(1, Math.max(0, sceneLocalTime / duration));
    
    // Cinematic cubic bezier easing (easeInOutCubic) for organic acceleration & deceleration
    const easeProgress = rawProgress < 0.5
      ? 4 * rawProgress * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

    // Organic micro-breathing / handheld drift
    const driftX = Math.sin(sceneLocalTime * 0.8) * 4 + Math.sin(sceneLocalTime * 1.7) * 2;
    const driftY = Math.cos(sceneLocalTime * 0.7) * 3 + Math.cos(sceneLocalTime * 1.5) * 1.5;

    // Select or auto-assign motion pattern based on scene properties if not specified
    const motionMode = currentScene.motionType || (
      currentScene.sceneNumber % 5 === 1 ? 'ken_burns_zoom_in' :
      currentScene.sceneNumber % 5 === 2 ? 'pan_left' :
      currentScene.sceneNumber % 5 === 3 ? 'tilt_up' :
      currentScene.sceneNumber % 5 === 4 ? 'pan_right' :
      'orbital_drift'
    );

    // Compute base scale and translate offsets
    let zoomScale = 1.08; // Base scale headroom to avoid revealing canvas bounds
    let panX = 0;
    let panY = 0;

    switch (motionMode) {
      case 'ken_burns_zoom_in':
        zoomScale = 1.04 + easeProgress * 0.12; // 1.04x -> 1.16x slow documentary push-in
        panX = (easeProgress - 0.5) * 25 + driftX;
        panY = (easeProgress - 0.5) * 15 + driftY;
        break;
      case 'ken_burns_zoom_out':
        zoomScale = 1.16 - easeProgress * 0.11; // 1.16x -> 1.05x cinematic reveal pull-back
        panX = (0.5 - easeProgress) * 20 + driftX;
        panY = (0.5 - easeProgress) * 12 + driftY;
        break;
      case 'pan_left':
        zoomScale = 1.12 + Math.sin(easeProgress * Math.PI) * 0.03;
        panX = 35 - easeProgress * 70 + driftX; // Slow pan from right to left
        panY = driftY;
        break;
      case 'pan_right':
        zoomScale = 1.12 + Math.sin(easeProgress * Math.PI) * 0.03;
        panX = -35 + easeProgress * 70 + driftX; // Slow pan from left to right
        panY = driftY;
        break;
      case 'tilt_up':
        zoomScale = 1.11 + easeProgress * 0.05;
        panX = driftX;
        panY = 25 - easeProgress * 50 + driftY; // Gentle pedestal tilt upward
        break;
      case 'tilt_down':
        zoomScale = 1.11 + easeProgress * 0.05;
        panX = driftX;
        panY = -25 + easeProgress * 50 + driftY; // Gentle pedestal tilt downward
        break;
      case 'orbital_drift':
      default:
        zoomScale = 1.07 + Math.sin(easeProgress * Math.PI) * 0.07;
        panX = Math.sin(easeProgress * Math.PI * 1.5) * 30 + driftX;
        panY = Math.cos(easeProgress * Math.PI * 1.5) * 20 + driftY;
        break;
    }

    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;

    let drawW = width;
    let drawH = height;

    if (imgAspect > canvasAspect) {
      drawH = height;
      drawW = height * imgAspect;
    } else {
      drawW = width;
      drawH = width / imgAspect;
    }

    drawW *= zoomScale;
    drawH *= zoomScale;

    const offsetX = (width - drawW) / 2 + panX;
    const offsetY = (height - drawH) / 2 + panY;

    ctx.save();
    // Image smoothing high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  } else {
    // Fallback gradient while loading
    renderGenerativeVisual(ctx, 'gen:aurora', width, height, sceneLocalTime);
    preloadImage(mediaUrl);
  }

  // 2. Scrim Overlay for Legibility (WCAG Compliant)
  const isVertical = project.aspectRatio === '9:16';
  const scrimGrad = ctx.createLinearGradient(0, 0, 0, height);
  scrimGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
  scrimGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
  scrimGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = scrimGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Top Badges & Disclosures
  if (project.platformMetadata.aiDisclosureRequired) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.roundRect?.(24, 24, 140, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText('AI GENERATED', 36, 45);
  }

  // Watermark (for free tier)
  if (project.watermarkEnabled && !project.isProUser) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('TopicToVideo Free', width - 24, 45);
    ctx.textAlign = 'left';
  }

  // 4. Presenter Character Rendering (Real Studio Host with Scene Emotion)
  if (project.presenterConfig?.enabled) {
    renderPresenterOnCanvas({
      ctx,
      project,
      currentScene,
      sceneLocalTime,
      width,
      height,
      isVertical,
    });
  }

  // 5. Word-by-Word Synchronized Animated Captions
  renderCaptionsOnCanvas({
    ctx,
    scene: currentScene,
    sceneLocalTime,
    captionConfig: project.captionConfig,
    width,
    height,
    isVertical,
  });

  ctx.restore();
}

function renderPresenterOnCanvas({
  ctx,
  project,
  currentScene,
  sceneLocalTime,
  width,
  height,
  isVertical,
}: {
  ctx: CanvasRenderingContext2D;
  project: VideoProject;
  currentScene: Scene;
  sceneLocalTime: number;
  width: number;
  height: number;
  isVertical: boolean;
}) {
  const character = PRESENTER_CHARACTERS.find(
    (c) => c.id === project.presenterConfig?.characterId
  ) || PRESENTER_CHARACTERS[0];

  const emotion = currentScene.emotion || 'explaining';
  const emotionImgUrl =
    character.emotionalExpressions?.[emotion] || character.avatarUrl;

  const mode = project.presenterConfig?.mode || 'pip_corner';

  // If cuts_only mode: show fullscreen host cut on Hook (scene 1) or CTA (final scene); else corner PIP
  const isKeyScene = currentScene.sceneNumber === 1 || currentScene.sceneNumber === project.scenes.length;
  if (mode === 'cuts_only' && !isKeyScene) {
    // Show subtle miniature host badge in corner
  }

  // Emotion color themes
  const emotionThemeMap: Record<string, { rim: string; glow: string; text: string }> = {
    intrigued: { rim: '#f59e0b', glow: 'rgba(245, 158, 11, 0.55)', text: '#fbbf24' },
    explaining: { rim: '#6366f1', glow: 'rgba(99, 102, 241, 0.55)', text: '#818cf8' },
    shocked: { rim: '#ef4444', glow: 'rgba(239, 68, 68, 0.65)', text: '#f87171' },
    thoughtful: { rim: '#10b981', glow: 'rgba(16, 185, 129, 0.55)', text: '#34d399' },
    inspiring: { rim: '#eab308', glow: 'rgba(234, 179, 8, 0.65)', text: '#fde047' },
  };
  const theme = emotionThemeMap[emotion] || emotionThemeMap.explaining;

  // Retrieve cached image or fallback to avatar
  let imgToDraw: HTMLImageElement | null = null;
  if (imageCache.has(emotionImgUrl)) {
    imgToDraw = imageCache.get(emotionImgUrl)!;
  } else if (imageCache.has(character.avatarUrl)) {
    imgToDraw = imageCache.get(character.avatarUrl)!;
  } else {
    preloadImage(emotionImgUrl);
    preloadImage(character.avatarUrl);
  }

  // Live Audio Volume for authentic lip-sync, blinking, and dynamic equalizer
  const liveVol = getLiveAudioVolume();
  const isSpeaking = isCharacterSpeaking() || (sceneLocalTime < currentScene.durationSeconds - 0.4);

  // Micro-motion breathing / head movement
  const breath = 1.0 + Math.sin(sceneLocalTime * 2.2) * 0.012;

  // Natural human blink cycle (lasts ~120ms every 3.4 seconds)
  const blinkCycle = (sceneLocalTime * 0.29) % 1.0;
  const isBlinking = blinkCycle > 0.94 && blinkCycle < 0.98;

  if (mode === 'split_screen') {
    // Split Screen Layout
    const splitW = isVertical ? width : width * 0.46;
    const splitH = isVertical ? height * 0.46 : height;
    const splitX = 0;
    const splitY = isVertical ? height - splitH : 0;

    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, splitY, splitW, splitH);
    ctx.clip();

    if (imgToDraw) {
      ctx.drawImage(imgToDraw, splitX, splitY, splitW, splitH);

      // Split Screen Lip-Sync
      if (isSpeaking && liveVol > 0.04) {
        const mouthX = splitX + splitW * 0.5;
        const mouthY = splitY + splitH * 0.58;
        const mW = splitW * 0.08;
        const mH = Math.min(splitH * 0.06, Math.max(2, liveVol * splitH * 0.08));
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, mW * 0.5, mH * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40, 16, 22, 0.95)';
        ctx.fill();
        if (mH > 3) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.rect(mouthX - mW * 0.25, mouthY - mH * 0.45, mW * 0.5, mH * 0.35);
          ctx.fill();
        }
        ctx.restore();
      }

      // Split Screen Natural Blink
      if (isBlinking) {
        const eyeY = splitY + splitH * 0.46;
        const eyeDist = splitW * 0.08;
        const eyeW = splitW * 0.05;
        ctx.save();
        ctx.strokeStyle = 'rgba(45, 25, 25, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(splitX + splitW * 0.5 - eyeDist, eyeY, eyeW * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(splitX + splitW * 0.5 + eyeDist, eyeY, eyeW * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Studio backdrop fallback
      const bgGrad = ctx.createLinearGradient(splitX, splitY, splitX + splitW, splitY + splitH);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(splitX, splitY, splitW, splitH);

      // Studio host silhouette / monogram
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(character.name.charAt(0), splitX + splitW / 2, splitY + splitH / 2);
    }

    // Emotion glow vignette
    const vigGrad = ctx.createLinearGradient(splitX, splitY + splitH - 80, splitX, splitY + splitH);
    vigGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    vigGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(splitX, splitY + splitH - 80, splitW, 80);

    // Separator neon line
    ctx.strokeStyle = theme.rim;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (isVertical) {
      ctx.moveTo(0, splitY);
      ctx.lineTo(width, splitY);
    } else {
      ctx.moveTo(splitW, 0);
      ctx.lineTo(splitW, height);
    }
    ctx.stroke();
    ctx.restore();

    // Host Name Badge & Sound Bars
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    const badgeW = Math.min(splitW - 32, 220);
    const badgeH = 34;
    const badgeX = splitX + 16;
    const badgeY = splitY + splitH - badgeH - 14;

    ctx.roundRect?.(badgeX, badgeY, badgeW, badgeH, 8);
    ctx.fill();
    ctx.strokeStyle = theme.rim;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(character.name, badgeX + 12, badgeY + 18);

    ctx.fillStyle = theme.text;
    ctx.font = '800 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(emotion.toUpperCase(), badgeX + 12, badgeY + 29);

    // Animated equalizing soundbars connected to real audio volume
    if (isSpeaking) {
      for (let b = 0; b < 4; b++) {
        const barH = 4 + (liveVol * 18) + Math.abs(Math.sin(sceneLocalTime * 12 + b * 1.5)) * 6;
        ctx.fillStyle = theme.rim;
        ctx.fillRect(badgeX + badgeW - 36 + b * 6, badgeY + badgeH / 2 - barH / 2, 3, barH);
      }
    }
  } else if (mode === 'cinema_host') {
    // Cinema Host Lower Third Banner
    const barW = isVertical ? width * 0.9 : width * 0.55;
    const barH = 58;
    const barX = (width - barW) / 2;
    const barY = height - (isVertical ? 150 : 80);
    const avatarR = 24;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 15 + liveVol * 25;
    ctx.roundRect?.(barX, barY, barW, barH, 16);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = theme.rim;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Round avatar
    const aCenterX = barX + avatarR + 10;
    const aCenterY = barY + barH / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(aCenterX, aCenterY, avatarR, 0, Math.PI * 2);
    ctx.clip();
    if (imgToDraw) {
      ctx.drawImage(imgToDraw, aCenterX - avatarR, aCenterY - avatarR, avatarR * 2, avatarR * 2);

      // Micro lip-sync in cinema host avatar
      if (isSpeaking && liveVol > 0.04) {
        const mY = aCenterY + avatarR * 0.32;
        const mW = avatarR * 0.35;
        const mH = Math.min(avatarR * 0.28, Math.max(1.5, liveVol * avatarR * 0.3));
        ctx.beginPath();
        ctx.ellipse(aCenterX, mY, mW * 0.5, mH * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40, 16, 22, 0.95)';
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(aCenterX - avatarR, aCenterY - avatarR, avatarR * 2, avatarR * 2);
    }
    ctx.restore();

    // Outer rim ring
    ctx.beginPath();
    ctx.arc(aCenterX, aCenterY, avatarR, 0, Math.PI * 2);
    ctx.strokeStyle = theme.rim;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Host Info
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${character.name}`, aCenterX + avatarR + 12, aCenterY - 4);

    ctx.fillStyle = theme.text;
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${character.title} · ${emotion.toUpperCase()}`, aCenterX + avatarR + 12, aCenterY + 14);

    // Audio sound bars
    if (isSpeaking) {
      for (let b = 0; b < 4; b++) {
        const barH = 4 + (liveVol * 20) + Math.abs(Math.sin(sceneLocalTime * 14 + b * 2)) * 6;
        ctx.fillStyle = theme.rim;
        ctx.fillRect(barX + barW - 38 + b * 7, aCenterY - barH / 2, 4, barH);
      }
    }
    ctx.restore();
  } else {
    // PIP Corner Circle (Default & Most Versatile)
    const pipSize = isVertical ? width * 0.34 : height * 0.36;
    const margin = 20;

    let pipX = width - pipSize - margin;
    let pipY = height - pipSize - (isVertical ? 175 : 80);

    if (project.presenterConfig?.position === 'bottom_left') {
      pipX = margin;
    } else if (project.presenterConfig?.position === 'top_right') {
      pipY = margin + 45;
    }

    ctx.save();

    const centerX = pipX + pipSize / 2;
    const centerY = pipY + pipSize / 2;

    ctx.translate(centerX, centerY);
    ctx.scale(breath, breath);
    ctx.translate(-centerX, -centerY);

    // Outer Emotion Glow & Border Ring (pulses with live audio volume!)
    ctx.shadowColor = theme.glow;
    ctx.shadowBlur = 16 + liveVol * 28;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, pipSize / 2 + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outer rim stroke with emotion color
    ctx.strokeStyle = theme.rim;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Clip image to circular portrait
    ctx.beginPath();
    ctx.arc(centerX, centerY, pipSize / 2, 0, Math.PI * 2);
    ctx.clip();

    if (imgToDraw) {
      ctx.drawImage(imgToDraw, pipX, pipY, pipSize, pipSize);

      // Real-time Mouth Lip-Sync Movement synchronized to Sound
      if (isSpeaking && liveVol > 0.04) {
        const mouthY = centerY + pipSize * 0.165;
        const mouthWidth = pipSize * 0.14;
        const mouthHeight = Math.min(pipSize * 0.11, Math.max(2, liveVol * pipSize * 0.12));

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY, mouthWidth * 0.5, mouthHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40, 16, 22, 0.96)';
        ctx.fill();

        if (mouthHeight > 3.5) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.rect(centerX - mouthWidth * 0.28, mouthY - mouthHeight * 0.45, mouthWidth * 0.56, mouthHeight * 0.35);
          ctx.fill();
        }

        ctx.strokeStyle = 'rgba(180, 80, 80, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // Natural Human Blinking (lasts 120ms every ~3.4s)
      if (isBlinking) {
        const eyeY = centerY - pipSize * 0.075;
        const eyeDist = pipSize * 0.12;
        const eyeW = pipSize * 0.08;
        ctx.save();
        ctx.strokeStyle = 'rgba(45, 25, 25, 0.9)';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX - eyeDist, eyeY, eyeW * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + eyeDist, eyeY, eyeW * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // High-end fallback studio portrait
      const fbGrad = ctx.createRadialGradient(centerX, centerY - 20, 10, centerX, centerY, pipSize / 2);
      fbGrad.addColorStop(0, '#312e81');
      fbGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = fbGrad;
      ctx.fillRect(pipX, pipY, pipSize, pipSize);

      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.round(pipSize * 0.32)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(character.name.charAt(0), centerX, centerY - 6);
    }

    ctx.restore();

    // Broadcaster Badge & Soundbars
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    const badgeW = pipSize;
    const badgeH = 26;
    const badgeX = pipX;
    const badgeY = pipY + pipSize - 14;

    ctx.roundRect?.(badgeX, badgeY, badgeW, badgeH, 8);
    ctx.fill();
    ctx.strokeStyle = theme.rim;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 10.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${character.name.toUpperCase()}`, badgeX + badgeW / 2 - (isSpeaking ? 10 : 0), badgeY + 12);

    ctx.fillStyle = theme.text;
    ctx.font = '700 8.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`• ${emotion.toUpperCase()}`, badgeX + badgeW / 2 - (isSpeaking ? 10 : 0), badgeY + 22);

    // Audio Equalizer bars inside badge jumping to real sound volume
    if (isSpeaking) {
      const eqX = badgeX + badgeW - 20;
      for (let b = 0; b < 3; b++) {
        const barH = 3 + (liveVol * 14) + Math.abs(Math.sin(sceneLocalTime * 14 + b * 2)) * 4;
        ctx.fillStyle = theme.rim;
        ctx.fillRect(eqX + b * 5, badgeY + badgeH / 2 - barH / 2, 2.5, barH);
      }
    }
    ctx.restore();
  }
}

function renderCaptionsOnCanvas({
  ctx,
  scene,
  sceneLocalTime,
  captionConfig,
  width,
  height,
  isVertical,
}: {
  ctx: CanvasRenderingContext2D;
  scene: Scene;
  sceneLocalTime: number;
  captionConfig: CaptionConfig;
  width: number;
  height: number;
  isVertical: boolean;
}) {
  const timedWords = calculateSceneWordTimings(scene);
  if (timedWords.length === 0) return;

  const phrases = groupIntoPhrases(timedWords, isVertical ? 3 : 5);
  // Find current active phrase
  const activePhrase = phrases.find(
    (p) => sceneLocalTime >= p.start && sceneLocalTime <= p.end
  ) || phrases[phrases.length - 1];

  if (!activePhrase) return;

  const baseFontSize = isVertical ? Math.round(width * 0.058) : Math.round(height * 0.06);
  ctx.font = `800 ${baseFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Determine Y position
  let yPos = height * 0.82; // bottom
  if (captionConfig.position === 'center') {
    yPos = height * 0.52;
  } else if (captionConfig.position === 'top') {
    yPos = height * 0.22;
  }

  // Measure word positions
  const wordWidths = activePhrase.words.map((w) => ctx.measureText(w.word).width);
  const spaceWidth = ctx.measureText(' ').width;
  const totalPhraseWidth =
    wordWidths.reduce((acc, w) => acc + w, 0) + (activePhrase.words.length - 1) * spaceWidth;

  let currentX = width / 2 - totalPhraseWidth / 2;

  // Background Box for Cinema Box style
  if (captionConfig.style === 'cinema_box') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect?.(
      currentX - 20,
      yPos - baseFontSize * 0.8,
      totalPhraseWidth + 40,
      baseFontSize * 1.6,
      12
    );
    ctx.fill();
  }

  // Render each word with pop/glow highlight if active
  activePhrase.words.forEach((timedWord, i) => {
    const isCurrentlySpoken =
      sceneLocalTime >= timedWord.start && sceneLocalTime <= timedWord.end;
    const wWidth = wordWidths[i];
    const wordCenterX = currentX + wWidth / 2;

    ctx.save();

    if (isCurrentlySpoken) {
      // Dynamic Pop animation
      ctx.translate(wordCenterX, yPos);
      ctx.scale(1.12, 1.12);
      ctx.translate(-wordCenterX, -yPos);

      if (captionConfig.style === 'tiktok_pop') {
        // High-contrast yellow/neon highlight box behind current word
        ctx.fillStyle = captionConfig.highlightColor || '#FACC15';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.roundRect?.(
          currentX - 6,
          yPos - baseFontSize * 0.65,
          wWidth + 12,
          baseFontSize * 1.3,
          8
        );
        ctx.fill();
        ctx.fillStyle = '#0f172a'; // black text on yellow pill
      } else if (captionConfig.style === 'neon_glow') {
        ctx.shadowColor = captionConfig.highlightColor || '#38bdf8';
        ctx.shadowBlur = 24;
        ctx.fillStyle = captionConfig.highlightColor || '#38bdf8';
      } else {
        ctx.fillStyle = captionConfig.highlightColor || '#FACC15';
      }
    } else {
      ctx.fillStyle = captionConfig.textColor || '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
    }

    // Heavy outline stroke for readability
    if (captionConfig.style !== 'tiktok_pop' || !isCurrentlySpoken) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(3, baseFontSize * 0.12);
      ctx.strokeText(timedWord.word, wordCenterX, yPos);
    }

    ctx.fillText(timedWord.word, wordCenterX, yPos);
    ctx.restore();

    currentX += wWidth + spaceWidth;
  });
}
