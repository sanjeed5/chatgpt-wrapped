// ChatGPT Export Types
export interface Message {
  id: string;
  author: {
    role: 'user' | 'assistant' | 'system' | 'tool';
  };
  content: {
    content_type: string;
    parts?: (string | object)[];
  };
  create_time?: number;
  metadata?: {
    is_visually_hidden_from_conversation?: boolean;
  };
}

export interface MessageNode {
  id: string;
  message?: Message;
  parent?: string;
  children?: string[];
}

export interface Conversation {
  id?: string;
  title?: string;
  create_time: number;
  update_time?: number;
  default_model_slug?: string;
  mapping: Record<string, MessageNode>;
}

// Stats Types
export interface AllTimeStats {
  totalConversations: number;
  firstDate: string | null;
  firstDateShort: string | null;
  firstYear: number | null;
  firstConvoTitle: string;
  daysSinceFirst: number;
  byYear: Record<string, number>;
}

export interface Personality {
  type: string;
  description: string;
  reason: string;
  emoji: string;
  archetype: string;
}

export interface Politeness {
  score: number;
  title: string;
  icon: string;
  count: number;
  percentage: number;
  description: string;
  userMessageCount: number;
}

export interface BiggestMonth {
  month: string;
  count: number;
}

export interface LongestStreakRange {
  startKey: string;
  endKey: string;
  start: string;
  end: string;
  startShort: string;
  endShort: string;
}

export interface Themes {
  topThemes: { word: string; count: number }[];
  primaryTheme: string;
  categories: {
    primary: string;
    distribution: Record<string, number>;
  };
}

export interface Roast {
  text: string;
  reason: string;
  weight: number;
}

export interface Stats {
  allTime: AllTimeStats;
  year: number;
  conversations: number;
  conversationsPerDay: string;
  yoyGrowth: number | null;
  previousYearConversations: number;
  wordsTyped: number;
  wordsTypedFormatted: string;
  wordsReceived: number;
  novelsEquivalent: number;
  talkRatio: number;
  activeDays: number;
  activeDaysPct: number;
  dailyActivity: Record<string, number>;
  dailyActivityAllTime: Record<string, number>;
  lastActiveDateKey: string | null;
  longestStreak: number;
  longestStreakRange: LongestStreakRange | null;
  peakHour: string;
  peakHourRaw: number;
  peakDay: string;
  peakDayDistribution: Record<string, number>;
  topModel: string;
  personality: Personality;
  politeness: Politeness;
  totalHours: number;
  roast: Roast;
  userMessages: number;
  assistantMessages: number;
  coffees: number;
  booksRead: number;
  booksWritten: number;
  tweetsEquivalent: number;
  firstConvoDate: string | null;
  firstConvoDateShort: string | null;
  firstConvoTitle: string;
  biggestMonth: BiggestMonth;
  monthlyActivity: Record<string, number>;
  longestConvo: {
    title: string;
    messageCount: number;
    wordCount: number;
  } | null;
  themes: Themes;
}

// App State Types
export type SlideType = 
  | 'upload'
  | 'loading'
  | 'error'
  | 'journey'
  | 'intro'
  | 'growth'
  | 'biggest-month'
  | 'streak'
  | 'peak'
  | 'model'
  | 'politeness'
  | 'persona'
  | 'words'
  | 'roast'
  | 'summary';

export interface AppState {
  currentSlide: number;
  slides: SlideType[];
  stats: Stats | null;
  isDemo: boolean;
  isPaused: boolean;
  error: string | null;
}
