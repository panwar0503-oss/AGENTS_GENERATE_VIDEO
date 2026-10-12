export type VideoDuration = '30s' | '60s' | '3 min' | '5 min' | '10 min';
export type VideoTone = 'educational' | 'motivational' | 'storytelling' | 'news-style';
export type TargetPlatform = 'YouTube Shorts' | 'YouTube long-form' | 'Instagram Reels' | 'TikTok' | 'Facebook';
export type AspectRatio = '9:16' | '16:9';

export type SceneEmotion = 'intrigued' | 'explaining' | 'shocked' | 'thoughtful' | 'inspiring';

export interface PresenterCharacter {
  id: string;
  name: string;
  title: string;
  role: string;
  voiceMatch: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
  avatarUrl: string;
  emotionalExpressions: {
    intrigued: string;
    explaining: string;
    shocked: string;
    thoughtful: string;
    inspiring: string;
  };
  licenseNote: string;
}

export interface PresenterConfig {
  enabled: boolean;
  characterId: string;
  mode: 'pip_corner' | 'split_screen' | 'cuts_only' | 'cinema_host';
  position: 'bottom_right' | 'bottom_left' | 'top_right';
  showSpeakingWave: boolean;
}

export type CameraMotionType =
  | 'ken_burns_zoom_in'
  | 'ken_burns_zoom_out'
  | 'pan_left'
  | 'pan_right'
  | 'tilt_up'
  | 'tilt_down'
  | 'orbital_drift';

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  narrationText: string;
  visualPrompt: string;
  searchKeywords: string;
  mediaType: 'video' | 'image' | 'canvas_art';
  mediaUrl: string;
  mediaCredit: {
    source: string;
    license: string;
    commercialSafe: boolean;
  };
  captionKeywords: string[];
  durationSeconds: number;
  factReference?: string;
  emotion?: SceneEmotion;
  motionType?: CameraMotionType;
}

export interface VoiceConfig {
  voiceName: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
  speed: number; // 0.8 to 1.5
  pitch: number;
  volume: number; // 0 to 1
  style: string;
}

export interface MusicConfig {
  trackId: string;
  title: string;
  genre: string;
  volume: number; // 0 to 1
  license: string;
  bpm: number;
}

export interface CaptionConfig {
  style: 'tiktok_pop' | 'minimal_clean' | 'neon_glow' | 'cinema_box';
  position: 'bottom' | 'center' | 'top';
  fontSize: number;
  highlightColor: string; // e.g. #FACC15
  textColor: string; // e.g. #FFFFFF
  boxBgColor?: string;
  showEmojis: boolean;
}

export interface PersonalTouch {
  introVoiceNote?: string;
  customIntroText?: string;
  creatorOpinion?: string;
  customOutroText?: string;
  avatarIcon?: string;
}

export interface SafetyCheck {
  safe: boolean;
  advertiserFriendly: boolean;
  reasoning: string;
  flaggedWords?: string[];
}

export interface PlatformMetadata {
  seoTitle: string;
  description: string;
  hashtags: string[];
  tags: string[];
  bestTimeToPost: string;
  retentionTip: string;
  aiDisclosureRequired: boolean;
}

export interface LicenseEntry {
  assetId: string;
  type: 'footage' | 'music' | 'font' | 'ai_model';
  name: string;
  source: string;
  license: string;
  commercialUsable: boolean;
  verifiedAt: string;
}

export interface ThumbnailConfig {
  headline: string;
  subheadline: string;
  badgeText: string;
  layout: 'split' | 'centered' | 'badge_heavy' | 'minimal';
  themeColor: string;
  textColor: string;
  bgGradient: string;
}

export interface VideoProject {
  id: string;
  title: string;
  topic: string;
  duration: VideoDuration;
  language: string;
  tone: VideoTone;
  platform: TargetPlatform;
  aspectRatio: AspectRatio;
  hook: string;
  callToAction: string;
  scenes: Scene[];
  voiceConfig: VoiceConfig;
  musicConfig: MusicConfig;
  captionConfig: CaptionConfig;
  presenterConfig: PresenterConfig;
  personalTouch: PersonalTouch;
  factCheckNotes: string[];
  sources: string[];
  uniquenessScore: number;
  safetyCheck: SafetyCheck;
  platformMetadata: PlatformMetadata;
  licenses: LicenseEntry[];
  thumbnail: ThumbnailConfig;
  isProUser: boolean;
  watermarkEnabled: boolean;
  createdAt: number;
}
