export interface StockMediaAsset {
  id: string;
  title: string;
  category: 'tech' | 'science' | 'finance' | 'nature' | 'urban' | 'abstract' | 'people';
  type: 'image' | 'video' | 'generative';
  url: string;
  source: 'Unsplash Commercial' | 'Pexels CC0' | 'Pixabay Safe' | 'Procedural Motion';
  license: 'CC0 / Royalty-Free Commercial Safe';
  tags: string[];
}

export const STOCK_MEDIA_LIBRARY: StockMediaAsset[] = [
  // Tech & AI
  {
    id: 'tech_neural_1',
    title: 'Neural Matrix Data Flow',
    category: 'tech',
    type: 'generative',
    url: 'gen:neural',
    source: 'Procedural Motion',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['ai', 'future', 'robotics', 'technology', 'code', 'data', 'algorithm']
  },
  {
    id: 'tech_server_room',
    title: 'Datacenter Server Racks Glowing',
    category: 'tech',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash Commercial',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['cloud', 'servers', 'hardware', 'cybersecurity', 'internet']
  },
  {
    id: 'tech_digital_brain',
    title: 'Cognitive Synapse Flow',
    category: 'tech',
    type: 'generative',
    url: 'gen:synapse',
    source: 'Procedural Motion',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['brain', 'neuroscience', 'thinking', 'psychology', 'deep learning']
  },

  // Finance & Business
  {
    id: 'finance_growth_chart',
    title: 'Candlestick Market High Tide',
    category: 'finance',
    type: 'generative',
    url: 'gen:candlestick',
    source: 'Procedural Motion',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['finance', 'stocks', 'crypto', 'investing', 'wealth', 'economy', 'money']
  },
  {
    id: 'finance_boardroom',
    title: 'Skyscraper Financial District',
    category: 'finance',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash Commercial',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['business', 'real estate', 'corporation', 'strategy', 'success']
  },

  // Science & Space
  {
    id: 'science_deep_cosmos',
    title: 'Stellar Nebula Starfield',
    category: 'science',
    type: 'generative',
    url: 'gen:nebula',
    source: 'Procedural Motion',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['space', 'universe', 'astronomy', 'stars', 'physics', 'galaxy']
  },
  {
    id: 'science_quantum_lattice',
    title: 'Atomic Lattice Energy',
    category: 'science',
    type: 'generative',
    url: 'gen:quantum',
    source: 'Procedural Motion',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['quantum', 'chemistry', 'biology', 'medicine', 'molecules']
  },

  // Nature & Earth
  {
    id: 'nature_mountain_dawn',
    title: 'Alpine Peak Golden Sunrise',
    category: 'nature',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash Commercial',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['mountain', 'sunrise', 'travel', 'earth', 'climate', 'adventure', 'peace']
  },
  {
    id: 'nature_ocean_waves',
    title: 'Deep Pacific Turquoise Swell',
    category: 'nature',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash Commercial',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['ocean', 'water', 'environment', 'blue', 'summer']
  },

  // Urban & Lifestyle
  {
    id: 'urban_tokyo_night',
    title: 'Cyberpunk Metropolis Neon Reflections',
    category: 'urban',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash Commercial',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['city', 'neon', 'night', 'tokyo', 'lifestyle', 'travel']
  },

  // Abstract & Focus
  {
    id: 'abstract_aurora_gradient',
    title: 'Kinetic Aurora Pulse',
    category: 'abstract',
    type: 'generative',
    url: 'gen:aurora',
    source: 'Procedural Motion',
    license: 'CC0 / Royalty-Free Commercial Safe',
    tags: ['creative', 'minimalist', 'inspiration', 'focus', 'motivational', 'art']
  }
];

export interface MusicTrackOption {
  id: string;
  title: string;
  genre: string;
  mood: string;
  bpm: number;
  license: string;
  description: string;
}

export const ROYALTY_FREE_MUSIC_TRACKS: MusicTrackOption[] = [
  {
    id: 'track_lofi_focus',
    title: 'Midnight Chillhop Waves',
    genre: 'Lo-Fi Hip Hop',
    mood: 'Relaxed, Educational, Thoughtful',
    bpm: 82,
    license: 'Creative Commons 0 (Commercial Safe)',
    description: 'Smooth mellow Rhodes keys and warm subdued beats. Perfect for explainers and study videos.'
  },
  {
    id: 'track_synth_momentum',
    title: 'Hyperdrive Cyber Beat',
    genre: 'Synthwave / Electronic',
    mood: 'High Energy, Futuristic, Tech',
    bpm: 124,
    license: 'Royalty-Free Open License (Commercial Safe)',
    description: 'Driving synth bass and crisp electronic pulse. Ideal for YouTube Shorts, tech breakdowns, and TikTok.'
  },
  {
    id: 'track_cinematic_inspire',
    title: 'Ascending Horizons',
    genre: 'Cinematic Orchestral',
    mood: 'Inspirational, Epic, Storytelling',
    bpm: 96,
    license: 'Royalty-Free Open License (Commercial Safe)',
    description: 'Stirring strings, warm piano crescendo, and subtle percussion for documentary and storytelling.'
  },
  {
    id: 'track_corporate_clarity',
    title: 'Clean Minimalist Pulse',
    genre: 'Acoustic Minimal',
    mood: 'Professional, Trustworthy, Corporate',
    bpm: 110,
    license: 'Royalty-Free Open License (Commercial Safe)',
    description: 'Subtle acoustic rhythm and unobtrusive marimba. Great for business tips, finance, and news style.'
  },
  {
    id: 'track_none',
    title: 'No Background Music',
    genre: 'Silent',
    mood: 'Pure Voice Only',
    bpm: 0,
    license: 'N/A',
    description: 'Narration voiceover only without music track.'
  }
];
