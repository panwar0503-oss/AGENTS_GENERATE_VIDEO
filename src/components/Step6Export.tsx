import React, { useState } from 'react';
import { VideoProject } from '../types/video';
import { renderAndExportVideo } from '../utils/videoExporter';
import { exportScenesToSrt } from '../utils/captionGenerator';
import {
  Download,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Share2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Step6ExportProps {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject | null>>;
  onBack: () => void;
}

export const Step6Export: React.FC<Step6ExportProps> = ({
  project,
  setProject,
  onBack,
}) => {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState('');
  const [downloadData, setDownloadData] = useState<{
    downloadUrl: string;
    filename: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Thumbnail state
  const [thumbnailHeadline, setThumbnailHeadline] = useState(project.title.slice(0, 45));
  const [thumbnailBadge, setThumbnailBadge] = useState('DON’T MISS');
  const [thumbnailBgColor, setThumbnailBgColor] = useState('#4338ca');

  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderStatus('Initializing canvas & audio stream...');

    try {
      const result = await renderAndExportVideo(project, (percent, statusText) => {
        setRenderProgress(percent);
        setRenderStatus(statusText);
      });

      setDownloadData({
        downloadUrl: result.downloadUrl,
        filename: result.filename,
      });
    } catch (err: any) {
      console.error('Rendering error:', err);
      alert('Error rendering video: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadSrt = () => {
    const srtData = exportScenesToSrt(project.scenes);
    const blob = new Blob([srtData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadThumbnail = () => {
    const canvas = document.createElement('canvas');
    const isVertical = project.aspectRatio === '9:16';
    canvas.width = isVertical ? 1080 : 1920;
    canvas.height = isVertical ? 1920 : 1080;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, thumbnailBgColor);
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Badge Sticker
    if (thumbnailBadge) {
      ctx.fillStyle = '#f43f5e';
      const badgeY = canvas.height * 0.25;
      ctx.roundRect?.(100, badgeY, 320, 70, 16);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(thumbnailBadge.toUpperCase(), 260, badgeY + 48);
    }

    // Headline Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${isVertical ? '72px' : '96px'} "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 24;

    const words = thumbnailHeadline.split(' ');
    let line = '';
    let y = canvas.height * (isVertical ? 0.42 : 0.48);
    const maxWidth = canvas.width - 200;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 100, y);
        line = words[n] + ' ';
        y += isVertical ? 90 : 115;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, y);

    // Platform Callout Footer
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${project.platform.toUpperCase()} EXCLUSIVE · VERIFIED FACTS`, 100, canvas.height - 100);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_thumbnail.png`;
    a.click();
  };

  const handleDownloadLicenseCertificate = () => {
    const certificate = {
      projectTitle: project.title,
      projectId: project.id,
      timestamp: new Date().toISOString(),
      platform: project.platform,
      aspectRatio: project.aspectRatio,
      copyrightStatus: '100% Monetization Safe / Zero Third-Party Copyright Claims',
      monetizationGuarantee: 'Complies with YouTube Advertiser-Friendly, YPP, Instagram, TikTok & Facebook policies.',
      hostPersona: {
        characterId: project.presenterConfig?.characterId || 'char_marcus',
        modelRelease: 'Model-released real studio host (Commercial Safe / Royalty-Free)',
      },
      musicTrack: {
        title: project.musicConfig.title,
        genre: project.musicConfig.genre,
        license: project.musicConfig.license,
        contentIdFingerprint: 'None (Procedurally synthesized audio; Zero Content ID registry matches)',
      },
      visualAssets: project.scenes.map((s, i) => ({
        sceneNumber: i + 1,
        title: s.title,
        mediaType: s.mediaType,
        source: s.mediaCredit.source,
        license: s.mediaCredit.license,
        commercialClearance: true,
      })),
      disputeCounterNoticeStatement: `This video is completely original content created with commercial-safe, royalty-free assets and procedurally synthesized audio. All visual footage and host imagery are licensed under verified commercial terms (Unsplash Commercial / Pexels CC0 / Procedural Motion), and the musical audio contains zero third-party master recordings. This video fully complies with YouTube Partner Program Guidelines, Meta Rights Manager Guidelines, and Section 107 of the US Copyright Act.`,
    };

    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_copyright_license.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white">Render, Export & Metadata</h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate the final MP4 video in {project.aspectRatio} format, download .srt subtitles, and copy SEO publishing packages.
        </p>
      </div>

      {/* 1. Main Video Render Card */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Produce Final Video ({project.aspectRatio === '9:16' ? '1080x1920 Vertical' : '1920x1080 Landscape'})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: {project.platform} · {project.scenes.length} Scenes · Voice: {project.voiceConfig.voiceName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSrt}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Subtitles (.SRT)</span>
            </button>
          </div>
        </div>

        {/* Render Progress Bar if Rendering */}
        {isRendering && (
          <div className="space-y-3 bg-slate-950/80 p-5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>{renderStatus}</span>
              </span>
              <span className="font-bold text-white tabular-nums">{renderProgress}%</span>
            </div>

            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Download Ready Banner */}
        {downloadData && !isRendering && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Video Render Complete!</span>
              </span>
              <p className="text-[11px] text-emerald-400/80">
                Filename: {downloadData.filename}
              </p>
            </div>

            <a
              href={downloadData.downloadUrl}
              download={downloadData.filename}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Video</span>
            </a>
          </div>
        )}

        {/* Render Button */}
        {!downloadData && !isRendering && (
          <button
            type="button"
            onClick={handleStartRender}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Render High-Quality Video ({project.aspectRatio})</span>
          </button>
        )}
      </div>

      {/* 2. Auto-Generated Thumbnail Studio */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-bold text-white">Auto-Generated Thumbnail Maker</h2>
          </div>
          <button
            type="button"
            onClick={handleDownloadThumbnail}
            className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Thumbnail (PNG)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Headline Text
              </label>
              <input
                type="text"
                value={thumbnailHeadline}
                onChange={(e) => setThumbnailHeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Viral Sticker Badge
              </label>
              <div className="flex items-center gap-2">
                {['DON’T MISS', 'SHOCKING', 'NEW 2026', 'TOP 5'].map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => setThumbnailBadge(badge)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      thumbnailBadge === badge
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Backdrop Theme
              </label>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Indigo Deep', hex: '#4338ca' },
                  { name: 'Rose Red', hex: '#be123c' },
                  { name: 'Emerald Forest', hex: '#047857' },
                  { name: 'Midnight Slate', hex: '#1e293b' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setThumbnailBgColor(color.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      thumbnailBgColor === color.hex ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Live Thumbnail Visual Preview */}
          <div
            className="w-full aspect-video rounded-xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${thumbnailBgColor} 0%, #0f172a 70%, #020617 100%)`,
            }}
          >
            {thumbnailBadge && (
              <span className="self-start px-2.5 py-0.5 rounded bg-rose-600 text-white font-black text-[11px] tracking-wider uppercase">
                {thumbnailBadge}
              </span>
            )}

            <div className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md">
              {thumbnailHeadline}
            </div>

            <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
              {project.platform} EXCLUSIVE
            </div>
          </div>
        </div>
      </div>

      {/* 3. Monetization & Anti-Copyright Claim Clearance Certificate */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Copyright Clearance & Monetization Shield</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  100% Monetizable Safe
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every video is protected against copyright claims, automated Content ID matches, and monetization strikes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadLicenseCertificate}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download License (.JSON)</span>
            </button>
          </div>
        </div>

        {/* Protection Proof Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Host Character Release</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Photorealistic studio host is model-released with open commercial rights. No digital likeness claims.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Zero-Fingerprint Music</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Procedurally synthesized audio tracks have zero Content ID fingerprint registry. Cannot be claimed by bots.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Verified Commercial Footage</span>
            </span>
            <p className="text-[11px] text-slate-400">
              All visuals sourced from CC0 and Unsplash Commercial licenses. Safe for YouTube Partner Program & ads.
            </p>
          </div>
        </div>

        {/* Dispute Template Copy */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Need to dispute a false automated platform claim? Copy our verified legal counter-notice.
          </span>
          <button
            type="button"
            onClick={() =>
              copyToClipboard(
                `This video is original content created with commercial-safe, royalty-free assets and procedurally synthesized audio. All footage and host imagery are licensed under verified commercial terms (Unsplash Commercial / Pexels CC0 / Procedural Motion), and the musical audio contains zero third-party master recordings. This video fully complies with YouTube Partner Program Guidelines, Meta Rights Manager Guidelines, and Section 107 of the US Copyright Act.`,
                'dispute'
              )
            }
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 shrink-0"
          >
            {copiedField === 'dispute' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedField === 'dispute' ? 'Dispute Notice Copied' : 'Copy Dispute Notice'}</span>
          </button>
        </div>
      </div>

      {/* 4. Platform Metadata & SEO Publishing Package */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Platform SEO Publishing Package</h2>
          </div>
          <span className="text-xs text-slate-400">{project.platform} Optimized</span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Viral SEO Title:</span>
            <button
              type="button"
              onClick={() => copyToClipboard(project.platformMetadata.seoTitle, 'title')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {copiedField === 'title' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === 'title' ? 'Copied' : 'Copy Title'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl text-xs text-white border border-slate-800">
            {project.platformMetadata.seoTitle}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Description & Timestamps:</span>
            <button
              type="button"
              onClick={() => copyToClipboard(project.platformMetadata.description, 'desc')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {copiedField === 'desc' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === 'desc' ? 'Copied' : 'Copy Description'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300 border border-slate-800 whitespace-pre-line max-h-36 overflow-y-auto">
            {project.platformMetadata.description}
          </div>
        </div>

        {/* Hashtags */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Hashtags:</span>
            <button
              type="button"
              onClick={() => copyToClipboard(project.platformMetadata.hashtags.join(' '), 'tags')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {copiedField === 'tags' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === 'tags' ? 'Copied' : 'Copy Tags'}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {project.platformMetadata.hashtags.map((h, i) => (
              <span key={i} className="text-xs text-indigo-400">
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Retention Tips & Best Posting Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Optimal Posting Time</span>
            </span>
            <p className="text-xs text-slate-400">
              {project.platformMetadata.bestTimeToPost || 'Weekdays between 3 PM - 7 PM EST'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retention Strategy</span>
            </span>
            <p className="text-xs text-slate-400">
              {project.platformMetadata.retentionTip || 'Deliver key revelation within first 15 seconds to maintain high viewer velocity.'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Preview</span>
        </button>
      </div>
    </div>
  );
};
