export interface TrendingTopicItem {
  id: string;
  topic: string;
  category: 'Tech & AI' | 'Finance & Money' | 'Science & Nature' | 'Productivity & Mind' | 'Curious Facts';
  recommendedDuration: '30s' | '60s' | '3 min';
  platform: 'YouTube Shorts' | 'TikTok' | 'YouTube long-form' | 'Instagram Reels' | 'Facebook';
  tone: 'educational' | 'storytelling' | 'motivational' | 'news-style';
  trendVelocity: string;
  estimatedHook: string;
}

export const TRENDING_TOPICS: TrendingTopicItem[] = [
  {
    id: 'trend_1',
    topic: 'How Generative AI Actually Thinks (In 60 Seconds)',
    category: 'Tech & AI',
    recommendedDuration: '60s',
    platform: 'YouTube Shorts',
    tone: 'educational',
    trendVelocity: '+280% this week',
    estimatedHook: 'AI doesn’t actually think like a human—it’s doing something much weirder.'
  },
  {
    id: 'trend_2',
    topic: 'The 2-Minute Dopamine Rule to Stop Procrastinating',
    category: 'Productivity & Mind',
    recommendedDuration: '60s',
    platform: 'TikTok',
    tone: 'motivational',
    trendVelocity: '+195% this week',
    estimatedHook: 'If you struggle with task paralysis, this 120-second psychological hack rewires your focus instantly.'
  },
  {
    id: 'trend_3',
    topic: 'Why Commercial Plane Windows Are Never Square',
    category: 'Curious Facts',
    recommendedDuration: '30s',
    platform: 'YouTube Shorts',
    tone: 'educational',
    trendVelocity: '+150% this week',
    estimatedHook: 'In 1954, square windows caused two jet airliners to literally shatter mid-air.'
  },
  {
    id: 'trend_4',
    topic: 'How Index Funds Beat 92% of Wall Street Pros',
    category: 'Finance & Money',
    recommendedDuration: '3 min',
    platform: 'YouTube long-form',
    tone: 'news-style',
    trendVelocity: '+135% this week',
    estimatedHook: 'A billionaire bet hedge fund managers $1 million they couldn’t beat simple index funds. Here’s what happened.'
  },
  {
    id: 'trend_5',
    topic: 'The Mysterious Biology of the Immortal Jellyfish',
    category: 'Science & Nature',
    recommendedDuration: '60s',
    platform: 'Instagram Reels',
    tone: 'storytelling',
    trendVelocity: '+210% this week',
    estimatedHook: 'There is a creature on Earth that can reverse its biological age back to infancy when injured.'
  },
  {
    id: 'trend_6',
    topic: 'How Tokyo Skyscrapers Survive 8.0 Magnitude Earthquakes',
    category: 'Science & Nature',
    recommendedDuration: '3 min',
    platform: 'YouTube long-form',
    tone: 'educational',
    trendVelocity: '+175% this week',
    estimatedHook: 'Inside Tokyo’s tallest tower sits a 660-ton pendulum designed to defy physics.'
  }
];
