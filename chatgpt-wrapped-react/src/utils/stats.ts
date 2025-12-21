import type { Conversation, Stats, Personality, Politeness, Roast, Themes, BiggestMonth } from '../types';
import { formatNumber, formatHour, formatDate, formatDateShort, formatLocalDateKey, parseDateKey, getDaysInYear } from './helpers';

export function computeStats(conversations: Conversation[], targetYear?: number): Stats {
  // Filter valid conversations with timestamps
  const validConvos = conversations.filter((c) => c.create_time);

  // Sort by time
  validConvos.sort((a, b) => a.create_time - b.create_time);

  const resolvedYear = targetYear || getLatestYear(validConvos);
  const yearToAnalyze = resolvedYear || new Date().getFullYear();

  // Get conversations by year
  const convosByYear = groupByYear(validConvos);
  const targetYearConvos = convosByYear[yearToAnalyze] || [];
  const previousYearConvos = convosByYear[yearToAnalyze - 1] || [];

  // First conversation
  const firstConvo = validConvos[0];
  const firstDate = firstConvo ? new Date(firstConvo.create_time * 1000) : null;
  const daysSinceFirst = firstDate ? Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Message counts
  const messageCounts = countMessages(targetYearConvos);

  // Word counts
  const wordCounts = countWords(targetYearConvos);

  // Extract themes
  const themes = extractThemes(targetYearConvos);

  // Year over year growth
  const yoyGrowth = previousYearConvos.length > 0 ? targetYearConvos.length / previousYearConvos.length : null;

  // Daily activity
  const dailyActivity = getDailyActivity(targetYearConvos, yearToAnalyze);
  const dailyActivityAllTime = getDailyActivity(validConvos);
  const activeDays = Object.keys(dailyActivity).length;
  const totalDaysInYear = getDaysInYear(yearToAnalyze);
  const activeDaysPct = Math.round((activeDays / totalDaysInYear) * 100);
  const lastActiveDateKey = getLastActiveDateKey(dailyActivityAllTime);

  // Longest streak
  const streakData = calculateStreak(dailyActivity);
  const longestStreak = streakData.length;
  const longestStreakRange =
    longestStreak > 0 && streakData.startKey && streakData.endKey
      ? {
          startKey: streakData.startKey,
          endKey: streakData.endKey,
          start: formatDate(parseDateKey(streakData.startKey)),
          end: formatDate(parseDateKey(streakData.endKey)),
          startShort: formatDateShort(parseDateKey(streakData.startKey)),
          endShort: formatDateShort(parseDateKey(streakData.endKey)),
        }
      : null;

  // Peak hour and day
  const peakHourRaw = getPeakHour(targetYearConvos);
  const peakDayData = getPeakDay(targetYearConvos);

  // Model usage
  const topModel = getTopModel(targetYearConvos);

  // Talk ratio
  const talkRatio = wordCounts.user > 0 ? Math.round(wordCounts.assistant / wordCounts.user) : 0;

  // Personality
  const personality = classifyPersonality({
    totalConvos: targetYearConvos.length,
    activeDays,
    activeDaysPct,
    longestStreak,
    peakHour: peakHourRaw,
    wordCounts,
    themes,
    talkRatio,
  });

  // Politeness
  const politeness = calculatePoliteness(targetYearConvos);

  // Time estimates
  const estimatedMinutes = estimateTimeFromWords(wordCounts);
  const totalHours = Math.round((estimatedMinutes / 60) * 10) / 10;

  // Fun stats
  const coffees = Math.floor(totalHours / 0.5);
  const booksRead = Math.floor(totalHours / 8);
  const booksWritten = Math.floor(wordCounts.user / 50000);
  const tweetsEquivalent = Math.floor(wordCounts.user / 40);

  // First conversation of year
  const firstConvoOfYear = targetYearConvos[0];
  const firstConvoDate = firstConvoOfYear ? new Date(firstConvoOfYear.create_time * 1000) : null;
  const firstConvoTitle = firstConvoOfYear ? getConversationTitle(firstConvoOfYear) : 'Untitled';

  // Biggest month
  const monthlyActivity = getMonthlyActivity(targetYearConvos, yearToAnalyze);
  const biggestMonth = getBiggestMonth(monthlyActivity);

  // Longest conversation
  const longestConvo = getLongestConversation(targetYearConvos);

  // Roast
  const roast = generateRoast({
    hours: totalHours,
    politeness: politeness.score,
    peakHour: peakHourRaw,
    activeDaysPct,
    longestStreak,
    wordsTyped: wordCounts.user,
    conversations: targetYearConvos.length,
    talkRatio,
  });

  return {
    allTime: {
      totalConversations: validConvos.length,
      firstDate: firstDate ? formatDate(firstDate) : null,
      firstDateShort: firstDate ? formatDateShort(firstDate) : null,
      firstYear: firstDate ? firstDate.getFullYear() : null,
      firstConvoTitle: firstConvo ? getConversationTitle(firstConvo) : 'Untitled',
      daysSinceFirst,
      byYear: Object.fromEntries(Object.entries(convosByYear).map(([year, convos]) => [year, convos.length])),
    },
    year: yearToAnalyze,
    conversations: targetYearConvos.length,
    conversationsPerDay: (targetYearConvos.length / totalDaysInYear).toFixed(1),
    yoyGrowth: yoyGrowth ? Math.round(yoyGrowth * 10) / 10 : null,
    previousYearConversations: previousYearConvos.length,
    wordsTyped: wordCounts.user,
    wordsTypedFormatted: formatNumber(wordCounts.user),
    wordsReceived: wordCounts.assistant,
    novelsEquivalent: Math.floor(wordCounts.user / 80000),
    talkRatio,
    activeDays,
    activeDaysPct,
    dailyActivity,
    dailyActivityAllTime,
    lastActiveDateKey,
    longestStreak,
    longestStreakRange,
    peakHour: formatHour(peakHourRaw),
    peakHourRaw,
    peakDay: peakDayData.day,
    peakDayDistribution: peakDayData.distribution,
    topModel,
    personality,
    politeness,
    totalHours,
    roast,
    userMessages: messageCounts.user,
    assistantMessages: messageCounts.assistant,
    coffees,
    booksRead,
    booksWritten,
    tweetsEquivalent,
    firstConvoDate: firstConvoDate ? formatDate(firstConvoDate) : null,
    firstConvoDateShort: firstConvoDate ? formatDateShort(firstConvoDate) : null,
    firstConvoTitle,
    biggestMonth,
    monthlyActivity,
    longestConvo: longestConvo
      ? {
          title: getConversationTitle(longestConvo.convo),
          messageCount: longestConvo.messageCount,
          wordCount: longestConvo.wordCount,
        }
      : null,
    themes,
  };
}

function getLatestYear(conversations: Conversation[]): number {
  if (!conversations || conversations.length === 0) return new Date().getFullYear();
  let latest = new Date(conversations[0].create_time * 1000).getFullYear();
  for (const convo of conversations) {
    const year = new Date(convo.create_time * 1000).getFullYear();
    if (year > latest) latest = year;
  }
  return latest;
}

function groupByYear(conversations: Conversation[]): Record<number, Conversation[]> {
  const byYear: Record<number, Conversation[]> = {};
  for (const convo of conversations) {
    const year = new Date(convo.create_time * 1000).getFullYear();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(convo);
  }
  return byYear;
}

function countMessages(conversations: Conversation[]): { user: number; assistant: number } {
  let user = 0;
  let assistant = 0;
  for (const convo of conversations) {
    const mapping = convo.mapping || {};
    for (const msgData of Object.values(mapping)) {
      const msg = msgData.message;
      if (!msg) continue;
      const role = msg.author?.role;
      const isHidden = msg.metadata?.is_visually_hidden_from_conversation;
      if (isHidden) continue;
      if (role === 'user') user++;
      else if (role === 'assistant') assistant++;
    }
  }
  return { user, assistant };
}

function countWords(conversations: Conversation[]): { user: number; assistant: number } {
  let user = 0;
  let assistant = 0;
  for (const convo of conversations) {
    const mapping = convo.mapping || {};
    for (const msgData of Object.values(mapping)) {
      const msg = msgData.message;
      if (!msg) continue;
      const role = msg.author?.role;
      const isHidden = msg.metadata?.is_visually_hidden_from_conversation;
      const contentType = msg.content?.content_type;
      if (isHidden) continue;
      if (contentType === 'user_editable_context') continue;
      const parts = msg.content?.parts || [];
      let text = '';
      for (const part of parts) {
        if (typeof part === 'string') text += part + ' ';
      }
      const wordCount = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
      if (role === 'user') user += wordCount;
      else if (role === 'assistant') assistant += wordCount;
    }
  }
  return { user, assistant };
}

function estimateTimeFromWords(wordCounts: { user: number; assistant: number }): number {
  const typingWpm = 38;
  const readingWpm = 200;
  const userWords = Math.max(0, wordCounts?.user || 0);
  const assistantWords = Math.max(0, wordCounts?.assistant || 0);
  const typingMinutes = userWords / typingWpm;
  const readingMinutes = assistantWords / readingWpm;
  return typingMinutes + readingMinutes;
}

function getDailyActivity(conversations: Conversation[], year?: number): Record<string, number> {
  const daily: Record<string, number> = {};
  for (const convo of conversations) {
    const date = new Date(convo.create_time * 1000);
    if (typeof year === 'number' && date.getFullYear() !== year) continue;
    const dateStr = formatLocalDateKey(date);
    daily[dateStr] = (daily[dateStr] || 0) + 1;
  }
  return daily;
}

function getLastActiveDateKey(dailyActivity: Record<string, number>): string | null {
  const dates = Object.keys(dailyActivity).sort();
  return dates.length > 0 ? dates[dates.length - 1] : null;
}

function calculateStreak(dailyActivity: Record<string, number>): { length: number; startKey: string | null; endKey: string | null } {
  const dates = Object.keys(dailyActivity).sort();
  if (dates.length === 0) return { length: 0, startKey: null, endKey: null };
  let maxStreak = 1;
  let currentStreak = 1;
  let currentStart = dates[0];
  let bestStart = dates[0];
  let bestEnd = dates[0];
  for (let i = 1; i < dates.length; i++) {
    const prevDate = parseDateKey(dates[i - 1]);
    const currDate = parseDateKey(dates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        bestStart = currentStart;
        bestEnd = dates[i];
      }
    } else {
      currentStreak = 1;
      currentStart = dates[i];
    }
  }
  return { length: maxStreak, startKey: bestStart, endKey: bestEnd };
}

function getPeakHour(conversations: Conversation[]): number {
  const hours: Record<number, number> = {};
  for (const convo of conversations) {
    const hour = new Date(convo.create_time * 1000).getHours();
    hours[hour] = (hours[hour] || 0) + 1;
  }
  let maxHour = 12;
  let maxCount = 0;
  for (const [hour, count] of Object.entries(hours)) {
    if (count > maxCount) {
      maxCount = count;
      maxHour = parseInt(hour);
    }
  }
  return maxHour;
}

function getPeakDay(conversations: Conversation[]): { day: string; distribution: Record<string, number> } {
  const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  const dayCounts: Record<string, number> = {};
  days.forEach((day) => (dayCounts[day] = 0));

  for (const convo of conversations) {
    const dayIndex = new Date(convo.create_time * 1000).getDay();
    const dayName = days[dayIndex];
    dayCounts[dayName]++;
  }

  let maxDay = 'Mondays';
  let maxCount = 0;
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxDay = day;
    }
  }

  return { day: maxDay, distribution: dayCounts };
}

function getTopModel(conversations: Conversation[]): string {
  const models: Record<string, number> = {};
  for (const convo of conversations) {
    const model = convo.default_model_slug;
    if (model && model !== 'auto') {
      const normalized = normalizeModelName(model);
      models[normalized] = (models[normalized] || 0) + 1;
    }
  }
  let topModel = 'GPT-4';
  let maxCount = 0;
  for (const [model, count] of Object.entries(models)) {
    if (count > maxCount) {
      maxCount = count;
      topModel = model;
    }
  }
  return topModel;
}

function normalizeModelName(slug: string): string {
  if (!slug) return 'GPT-4';
  const lower = slug.toLowerCase();
  if (lower.includes('gpt-5')) return 'GPT-5';
  if (lower.startsWith('o3')) return 'o3';
  if (lower.startsWith('o4')) return 'o4';
  if (lower.startsWith('o1')) return 'o1';
  if (lower.includes('gpt-4o')) return 'GPT-4o';
  if (lower.includes('gpt-4')) return 'GPT-4';
  if (lower.includes('gpt-3') || lower.includes('davinci')) return 'GPT-3.5';
  return slug.toUpperCase();
}

function extractThemes(conversations: Conversation[]): Themes {
  const stopWords = new Set([
    'help', 'can', 'you', 'please', 'thanks', 'thank', 'would', 'could', 'the', 'a', 'an',
    'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as',
    'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'i', 'me', 'my',
    'we', 'us', 'our', 'this', 'that', 'these', 'those', 'it', 'its', 'about', 'how',
    'what', 'when', 'where', 'which', 'who', 'why', 'need', 'want', 'get', 'make', 'im',
    'ive', 'youre', 'like', 'just', 'some', 'any', 'all', 'new', 'best', 'using',
    'understanding', 'write', 'create', 'explain', 'trying', 'chatgpt', 'gpt',
  ]);

  const wordFreq: Record<string, number> = {};

  for (const convo of conversations) {
    const title = (convo.title || '').toLowerCase();
    if (!title || title === 'new chat' || title === 'untitled') continue;

    const words = title.split(/[\s\-_,\.\/\\]+/).filter((w) => w.length > 3 && !stopWords.has(w) && /^[a-z]+$/.test(w));

    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 3;
    });
  }

  for (const convo of conversations) {
    const mapping = convo.mapping || {};
    let foundFirst = false;

    for (const msgData of Object.values(mapping)) {
      const msg = msgData.message;
      if (foundFirst) break;

      if (msg && msg.author?.role === 'user' && msg.content?.parts) {
        foundFirst = true;
        const parts = msg.content.parts.filter((p): p is string => typeof p === 'string');
        const text = parts.join(' ').toLowerCase();
        const words = text.split(/[\s\-_,\.\/\\]+/).filter((w) => w.length > 4 && !stopWords.has(w) && /^[a-z]+$/.test(w));

        words.slice(0, 15).forEach((word) => {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
      }
    }
  }

  const sortedThemes = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const categories = categorizeThemes(sortedThemes.map((t) => t[0]));

  return {
    topThemes: sortedThemes.map(([word, count]) => ({ word, count })),
    primaryTheme: sortedThemes[0] ? sortedThemes[0][0] : 'chatting',
    categories,
  };
}

function categorizeThemes(themes: string[]): { primary: string; distribution: Record<string, number> } {
  const categories: Record<string, string[]> = {
    coding: ['code', 'programming', 'python', 'javascript', 'react', 'api', 'function', 'error', 'debug', 'typescript', 'node', 'java', 'css', 'html', 'database', 'sql', 'git', 'docker', 'algorithm', 'data'],
    work: ['project', 'business', 'meeting', 'email', 'report', 'presentation', 'career', 'interview', 'resume', 'professional', 'team', 'management', 'strategy', 'marketing', 'sales'],
    learning: ['learn', 'study', 'tutorial', 'course', 'lesson', 'education', 'research', 'understand', 'explain', 'teach', 'knowledge', 'information'],
    creative: ['writing', 'story', 'design', 'creative', 'ideas', 'brainstorm', 'content', 'blog', 'article', 'draft', 'editing'],
    personal: ['health', 'fitness', 'cooking', 'recipe', 'travel', 'hobby', 'lifestyle', 'wellness', 'meditation', 'routine'],
    advice: ['advice', 'tips', 'recommendations', 'suggestions', 'guidance', 'decision', 'opinion', 'feedback'],
  };

  const counts: Record<string, number> = {};

  for (const theme of themes) {
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.includes(theme)) {
        counts[category] = (counts[category] || 0) + 1;
      }
    }
  }

  const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return {
    primary: topCategory ? topCategory[0] : 'general',
    distribution: counts,
  };
}

function classifyPersonality(data: {
  totalConvos: number;
  activeDays: number;
  activeDaysPct: number;
  longestStreak: number;
  peakHour: number;
  wordCounts: { user: number; assistant: number };
  themes: Themes;
  talkRatio: number;
}): Personality {
  const { totalConvos, activeDays, activeDaysPct, longestStreak, peakHour, wordCounts, themes } = data;

  const avgWordsPerConvo = totalConvos > 0 ? Math.round(wordCounts.user / totalConvos) : 0;
  const intensity = totalConvos / (activeDays || 1);
  const primaryTheme = themes?.categories?.primary || 'general';
  const estimatedHours = Math.max(1, Math.round((totalConvos * 5) / 60));

  if (peakHour >= 0 && peakHour < 5) {
    return {
      type: 'THE NIGHT OWL',
      description: "While the world sleeps, you're deep in conversation with AI. Your best ideas come after midnight.",
      reason: `Peak activity around ${peakHour}:00 — late night is your creative window.`,
      emoji: '🦉',
      archetype: 'Night Owl',
    };
  }

  if (peakHour >= 5 && peakHour < 7) {
    return {
      type: 'THE EARLY BIRD',
      description: 'You start the day with AI by your side. First light, first question, first answer.',
      reason: 'Most active before 7 AM — you open the day with ChatGPT.',
      emoji: '🌅',
      archetype: 'Early Bird',
    };
  }

  if (totalConvos > 500 && activeDaysPct > 60) {
    return {
      type: 'THE POWER USER',
      description: "ChatGPT isn't just a tool for you. It's part of how you think, work, and create.",
      reason: `${totalConvos} chats across ${activeDaysPct}% of the year — roughly ${estimatedHours} hours of collaboration.`,
      emoji: '⚡',
      archetype: 'Power User',
    };
  }

  if (intensity > 8 && activeDays > 30) {
    return {
      type: 'THE SPEEDRUNNER',
      description: "You don't just use ChatGPT—you DEMOLISH it. Multiple conversations per day, every day.",
      reason: `${intensity.toFixed(1)} chats per active day over ${activeDays} days — nonstop momentum.`,
      emoji: '🚀',
      archetype: 'Speedrunner',
    };
  }

  if (longestStreak >= 30) {
    return {
      type: 'THE STREAK MASTER',
      description: 'Consistency is your superpower. You showed up day after day, building a habit that stuck.',
      reason: `A ${longestStreak}-day streak that rivals New Year resolutions.`,
      emoji: '🔥',
      archetype: 'Streak Master',
    };
  }

  if (avgWordsPerConvo > 200 && totalConvos > 50) {
    return {
      type: 'THE DEEP THINKER',
      description: "You don't do small talk. Every conversation is detailed, thorough, and thoughtful.",
      reason: `Around ${avgWordsPerConvo} words per chat — you write essays, not prompts.`,
      emoji: '📝',
      archetype: 'Deep Thinker',
    };
  }

  if (avgWordsPerConvo < 50 && totalConvos > 100) {
    return {
      type: 'THE QUICK ASKER',
      description: 'Short, sharp, to the point.',
      reason: `You keep it brief with ${Math.round(avgWordsPerConvo)} words per chat on average.`,
      emoji: '💬',
      archetype: 'Quick Asker',
    };
  }

  if (primaryTheme === 'coding' && totalConvos > 100) {
    return {
      type: 'THE DEVELOPER',
      description: 'Code is your language, AI is your pair programmer.',
      reason: 'Your conversations are dominated by code and technical problem solving.',
      emoji: '💻',
      archetype: 'Developer',
    };
  }

  if (primaryTheme === 'creative' && totalConvos > 80) {
    return {
      type: 'THE CREATOR',
      description: 'Ideas flow through you like water.',
      reason: 'You use AI for brainstorming, writing, and creative exploration.',
      emoji: '🎨',
      archetype: 'Creator',
    };
  }

  if (primaryTheme === 'learning' && activeDaysPct > 50) {
    return {
      type: 'THE STUDENT',
      description: 'Every conversation is a lesson.',
      reason: 'You show up consistently to learn new things, with high daily activity.',
      emoji: '📚',
      archetype: 'Student',
    };
  }

  if (primaryTheme === 'work' && totalConvos > 150) {
    return {
      type: 'THE PROFESSIONAL',
      description: 'Business minded. Results driven.',
      reason: 'Your usage patterns align with professional productivity and work hours.',
      emoji: '💼',
      archetype: 'Professional',
    };
  }

  if (totalConvos > 300) {
    return {
      type: 'THE ENTHUSIAST',
      description: "You've fully embraced AI as part of your workflow.",
      reason: `With ${totalConvos} conversations, you're in the top tier of users.`,
      emoji: '🎯',
      archetype: 'Enthusiast',
    };
  }

  if (activeDaysPct > 40) {
    return {
      type: 'THE REGULAR',
      description: 'ChatGPT has become a reliable part of your routine.',
      reason: `You used ChatGPT on ${activeDaysPct}% of days — a true habit.`,
      emoji: '📅',
      archetype: 'Regular',
    };
  }

  if (totalConvos > 100) {
    return {
      type: 'THE EXPLORER',
      description: 'You use AI when inspiration strikes.',
      reason: `Healthy usage with ${totalConvos} chats across varied topics.`,
      emoji: '🔍',
      archetype: 'Explorer',
    };
  }

  if (activeDays < 10 && totalConvos > 30) {
    return {
      type: 'THE BINGE USER',
      description: 'You disappear for weeks, then return with a vengeance.',
      reason: 'You have intense bursts of activity followed by silence.',
      emoji: '🌊',
      archetype: 'Binge User',
    };
  }

  return {
    type: 'THE CURIOUS',
    description: "You've dipped your toes into the AI waters.",
    reason: 'You are just starting your journey with AI.',
    emoji: '✨',
    archetype: 'Curious',
  };
}

function calculatePoliteness(conversations: Conversation[]): Politeness {
  let pleaseCount = 0;
  let thanksCount = 0;
  let userMessageCount = 0;

  for (const convo of conversations) {
    const mapping = convo.mapping || {};
    for (const msgData of Object.values(mapping)) {
      const msg = msgData.message;
      if (msg && msg.author?.role === 'user' && msg.content?.parts) {
        userMessageCount++;
        const parts = msg.content.parts.filter((p): p is string => typeof p === 'string');
        const text = parts.join(' ').toLowerCase();
        if (text.includes('please')) pleaseCount++;
        if (text.includes('thank')) thanksCount++;
      }
    }
  }

  const total = pleaseCount + thanksCount;
  const percentage = userMessageCount > 0 ? Math.round((total / userMessageCount) * 100) : 0;
  const score = total / (conversations.length || 1);

  let title: string, icon: string, description: string;

  if (total === 0) {
    title = 'Straight to Business';
    icon = '😤';
    description = `You said "please" or "thanks" exactly 0 times. All business, no pleasantries.`;
  } else if (score > 1.5) {
    title = 'The Polite One';
    icon = '😇';
    description = `You said "please" or "thanks" ${total} times. It shows.`;
  } else if (score > 0.8) {
    title = 'Occasionally Polite';
    icon = '🙂';
    description = `You said "please" or "thanks" ${total} times. A solid amount of kindness.`;
  } else if (score > 0.3) {
    title = 'Mostly Direct';
    icon = '🤷';
    description = `You said "please" or "thanks" ${total} times. Mostly direct, still polite.`;
  } else {
    title = 'No Nonsense';
    icon = '💬';
    description = `You said "please" or "thanks" ${total} times. You keep it direct and move on.`;
  }

  return { score, title, icon, count: total, percentage, description, userMessageCount };
}

function generateRoast(data: {
  hours: number;
  politeness: number;
  peakHour: number;
  activeDaysPct: number;
  longestStreak: number;
  wordsTyped: number;
  conversations: number;
  talkRatio: number;
}): Roast {
  const { hours, politeness, peakHour, activeDaysPct, longestStreak, wordsTyped, conversations, talkRatio } = data;
  const roasts: Roast[] = [];

  if (hours > 500) roasts.push({ weight: 100, text: 'At this point, ChatGPT should be claiming YOU as a dependent.', reason: 'You spent over 500 hours with AI.' });
  if (hours > 300) roasts.push({ weight: 90, text: "You logged more AI time than most folks spend on calls.", reason: 'Over 300 hours logged this year.' });
  if (hours > 200) roasts.push({ weight: 80, text: '200+ hours together. Maybe schedule a stretch break.', reason: 'Seriously, 200+ hours is a lot.' });

  if (peakHour >= 0 && peakHour < 4) roasts.push({ weight: 75, text: "3 AM chats with an AI—sleep is optional, apparently.", reason: 'Your peak activity is in the dead of night.' });
  if (peakHour >= 4 && peakHour < 6) roasts.push({ weight: 70, text: "Either you're an early bird or you never went to sleep. Either way, you were up.", reason: 'Active between 4 AM and 6 AM.' });

  if (politeness > 2) roasts.push({ weight: 65, text: "You even say 'please' to a machine. Respect.", reason: 'You are exceptionally polite to the AI.' });
  if (politeness < 0.1 && conversations > 50) roasts.push({ weight: 65, text: "Not a single 'please' or 'thank you'? Truly straight to business.", reason: 'Zero manners detected.' });

  if (longestStreak > 60) roasts.push({ weight: 60, text: `${longestStreak} days straight? That's not a habit, that's a lifestyle.`, reason: 'You maintained a 2-month streak.' });
  if (longestStreak > 30) roasts.push({ weight: 50, text: "Your longest streak is longer than most New Year's resolutions.", reason: `A ${longestStreak}-day streak is impressive.` });

  if (wordsTyped > 500000) roasts.push({ weight: 85, text: "You wrote half a million words to an AI. You could've written a novel. Several, actually.", reason: '500k+ words typed. Wow.' });
  if (wordsTyped > 200000) roasts.push({ weight: 55, text: "You've written more to ChatGPT than most authors write in a year.", reason: 'Over 200,000 words typed.' });
  if (wordsTyped > 50000 && wordsTyped <= 200000) roasts.push({ weight: 50, text: "That's a novella's worth of words. You're putting in the reps.", reason: '50k–200k words typed.' });
  if (wordsTyped > 10000 && wordsTyped <= 50000) roasts.push({ weight: 45, text: 'Tens of thousands of words. A solid body of work.', reason: '10k–50k words typed.' });
  if (wordsTyped <= 10000 && wordsTyped > 0) roasts.push({ weight: 40, text: 'Quality over quantity. You drop in when it matters.', reason: 'Under 10k words typed, still making it count.' });

  if (talkRatio > 20) roasts.push({ weight: 45, text: 'You type 1 word, expect 20 back. Efficient.', reason: 'Your input vs. output ratio is huge.' });
  if (talkRatio < 2) roasts.push({ weight: 40, text: "You write essays, it gives you sentences. Who's the AI here?", reason: 'You type more than the AI does.' });

  if (activeDaysPct > 80) roasts.push({ weight: 70, text: 'You used ChatGPT 80% of the year. The other 20%? Probably just server outages.', reason: 'You are active almost every single day.' });
  if (activeDaysPct < 10 && conversations > 20) roasts.push({ weight: 35, text: 'You go quiet, then binge in sprints.', reason: 'Sporadic but intense usage.' });

  if (hours < 2 && conversations > 0) roasts.push({ weight: 30, text: "Quality over quantity. You're selective about your AI time.", reason: 'Low total hours but consistent usage.' });
  if (conversations < 10 && conversations > 0) roasts.push({ weight: 25, text: 'Starting strong! Every journey begins with a few conversations.', reason: 'You are just getting started.' });

  roasts.push({ weight: 10, text: "You use AI like a tool, not a crutch. Respect.", reason: 'Balanced and healthy usage patterns.' });

  roasts.sort((a, b) => b.weight - a.weight);
  return roasts[0];
}

function getMonthlyActivity(conversations: Conversation[], year: number): Record<string, number> {
  const months: Record<string, number> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthNames.forEach((m) => (months[m] = 0));

  for (const convo of conversations) {
    const date = new Date(convo.create_time * 1000);
    if (date.getFullYear() !== year) continue;
    const monthName = monthNames[date.getMonth()];
    months[monthName]++;
  }
  return months;
}

function getBiggestMonth(monthlyActivity: Record<string, number>): BiggestMonth {
  let maxMonth = 'Jan';
  let maxCount = 0;
  for (const [month, count] of Object.entries(monthlyActivity)) {
    if (count > maxCount) {
      maxCount = count;
      maxMonth = month;
    }
  }
  return { month: maxMonth, count: maxCount };
}

function getLongestConversation(conversations: Conversation[]): { convo: Conversation; messageCount: number; wordCount: number } | null {
  let longest: { convo: Conversation; messageCount: number; wordCount: number } | null = null;
  let maxMessages = 0;

  for (const convo of conversations) {
    const mapping = convo.mapping || {};
    let messageCount = 0;
    let wordCount = 0;

    for (const msgData of Object.values(mapping)) {
      const msg = msgData.message;
      if (!msg || msg.metadata?.is_visually_hidden_from_conversation) continue;
      const role = msg.author?.role;
      if (role === 'user' || role === 'assistant') {
        messageCount++;
        const parts = msg.content?.parts || [];
        for (const part of parts) {
          if (typeof part === 'string') {
            wordCount += part
              .trim()
              .split(/\s+/)
              .filter((w) => w.length > 0).length;
          }
        }
      }
    }

    if (messageCount > maxMessages) {
      maxMessages = messageCount;
      longest = { convo, messageCount, wordCount };
    }
  }
  return longest;
}

function getConversationTitle(conversation: Conversation, maxLength = 60): string {
  const title = conversation?.title;

  const isGeneric = !title || typeof title !== 'string' || title.trim() === '' || title.toLowerCase() === 'new chat' || title.toLowerCase() === 'untitled';

  if (isGeneric) {
    const firstMessage = getFirstUserMessage(conversation);
    if (firstMessage) {
      if (firstMessage.length > maxLength) {
        return firstMessage.substring(0, maxLength - 3) + '...';
      }
      return firstMessage;
    }
    return 'A conversation with ChatGPT';
  }

  const trimmed = title.trim();
  if (trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength - 3) + '...';
  }
  return trimmed;
}

function getFirstUserMessage(conversation: Conversation): string | null {
  if (!conversation || !conversation.mapping) return null;

  const mapping = conversation.mapping;

  for (const msgData of Object.values(mapping)) {
    const msg = msgData.message;
    if (!msg) continue;

    if (msg.author?.role === 'user' && msg.content?.parts) {
      const parts = msg.content.parts.filter((p): p is string => typeof p === 'string');
      const text = parts.join(' ').trim();
      if (text.length > 0) {
        return text;
      }
    }
  }

  return null;
}
