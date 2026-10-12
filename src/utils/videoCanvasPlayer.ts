import { VideoProject, Scene, CaptionConfig } from '../types/video';
import { calculateSceneWordTimings, groupIntoPhrases, TimedPhrase } from './captionGenerator';

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
    // Ken Burns smooth scale effect
    const sceneProgress = Math.min(1, sceneLocalTime / (currentScene.durationSeconds || 5));
    const zoomScale = 1.0 + sceneProgress * 0.08;

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

    const offsetX = (width - drawW) / 2;
    const offsetY = (height - drawH) / 2;

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
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

  // 4. Word-by-Word Synchronized Animated Captions
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
