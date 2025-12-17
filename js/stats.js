/**
 * ChatGPT Wrapped - Stats Computation
 * Calculates all metrics from conversations data
 */

const Stats = {
  /**
   * Compute all stats from conversations
   */
  compute(conversations, targetYear = 2025) {
    // Filter valid conversations with timestamps
    const validConvos = conversations.filter(c => c.create_time);
    
    // Sort by time
    validConvos.sort((a, b) => a.create_time - b.create_time);
    
    // Get conversations by year
    const convosByYear = this.groupByYear(validConvos);
    const targetYearConvos = convosByYear[targetYear] || [];
    const previousYearConvos = convosByYear[targetYear - 1] || [];
    
    // First conversation
    const firstConvo = validConvos[0];
    const firstDate = firstConvo ? new Date(firstConvo.create_time * 1000) : null;
    const daysSinceFirst = firstDate 
      ? Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Message counts
    const messageCounts = this.countMessages(validConvos);
    
    // Word counts
    const wordCounts = this.countWords(validConvos);
    
    // Extract themes from conversations
    const themes = this.extractThemes(targetYearConvos);
    
    // Year over year growth
    const yoyGrowth = previousYearConvos.length > 0 
      ? (targetYearConvos.length / previousYearConvos.length)
      : null;
    
    // Daily activity for target year
    const dailyActivity = this.getDailyActivity(targetYearConvos, targetYear);
    const activeDays = Object.keys(dailyActivity).length;
    const totalDaysInYear = this.getDaysInYear(targetYear);
    const activeDaysPct = Math.round((activeDays / totalDaysInYear) * 100);
    
    // Longest streak
    const longestStreak = this.calculateStreak(dailyActivity, targetYear);
    
    // Peak hour and day
    const peakHour = this.getPeakHour(targetYearConvos);
    const peakDayData = this.getPeakDay(targetYearConvos);
    const peakDay = peakDayData.day;
    
    // Model usage
    const topModel = this.getTopModel(targetYearConvos);
    
    // Talk ratio
    const talkRatio = wordCounts.user > 0 
      ? Math.round(wordCounts.assistant / wordCounts.user)
      : 0;
    
    // Personality classification
    const personality = this.classifyPersonality({
      totalConvos: targetYearConvos.length,
      activeDays,
      activeDaysPct,
      longestStreak,
      peakHour,
      wordCounts,
      themes
    });

    // Fun Stats
    const politeness = this.calculatePoliteness(targetYearConvos);
    const totalMinutes = targetYearConvos.length * 5;
    const totalHours = Math.round(totalMinutes / 60);
    
    // Shocking comparisons
    const coffees = Math.floor(totalHours / 0.5); // 30 min per coffee session
    const booksRead = Math.floor(totalHours / 8); // 8 hours per book avg
    const booksWritten = Math.floor(wordCounts.user / 50000); // 50k words per book
    const tweetsEquivalent = Math.floor(wordCounts.user / 40); // avg tweet length
    
    // First conversation of the year
    const firstConvoOfYear = targetYearConvos[0];
    const firstConvoDate = firstConvoOfYear 
      ? new Date(firstConvoOfYear.create_time * 1000) 
      : null;
    const firstConvoTitle = firstConvoOfYear?.title || 'Untitled';
    
    // Biggest month
    const monthlyActivity = this.getMonthlyActivity(targetYearConvos, targetYear);
    const biggestMonth = this.getBiggestMonth(monthlyActivity);
    
    // Longest conversation
    const longestConvo = this.getLongestConversation(targetYearConvos);
    
    // More personalized roast
    const roast = this.generateRoast({
      hours: totalHours,
      politeness: politeness.score,
      peakHour,
      activeDaysPct,
      longestStreak,
      wordsTyped: wordCounts.user,
      conversations: targetYearConvos.length,
      biggestMonth,
      talkRatio
    });
    
    return {
      allTime: {
        totalConversations: validConvos.length,
        firstDate: firstDate ? this.formatDate(firstDate) : null,
        firstDateShort: firstDate ? this.formatDateShort(firstDate) : null,
        firstYear: firstDate ? firstDate.getFullYear() : null,
        firstConvoTitle: this.truncateTitle(firstConvo?.title || 'Untitled'),
        daysSinceFirst,
        byYear: Object.fromEntries(
          Object.entries(convosByYear).map(([year, convos]) => [year, convos.length])
        )
      },
      year: targetYear,
      conversations: targetYearConvos.length,
      conversationsPerDay: (targetYearConvos.length / totalDaysInYear).toFixed(1),
      yoyGrowth: yoyGrowth ? Math.round(yoyGrowth * 10) / 10 : null,
      previousYearConversations: previousYearConvos.length,
      wordsTyped: wordCounts.user,
      wordsTypedFormatted: this.formatNumber(wordCounts.user),
      wordsReceived: wordCounts.assistant,
      novelsEquivalent: Math.floor(wordCounts.user / 80000),
      talkRatio,
      activeDays,
      activeDaysPct,
      dailyActivity,
      longestStreak,
      peakHour: this.formatHour(peakHour),
      peakHourRaw: peakHour,
      peakDay,
      peakDayDistribution: peakDayData.distribution,
      topModel,
      personality,
      politeness,
      totalHours,
      roast,
      userMessages: messageCounts.user,
      assistantMessages: messageCounts.assistant,
      // New viral stats
      coffees,
      booksRead,
      booksWritten,
      tweetsEquivalent,
      firstConvoDate: firstConvoDate ? this.formatDate(firstConvoDate) : null,
      firstConvoDateShort: firstConvoDate ? this.formatDateShort(firstConvoDate) : null,
      firstConvoTitle: this.truncateTitle(firstConvoTitle),
      biggestMonth,
      monthlyActivity,
      longestConvo: longestConvo ? {
        title: this.truncateTitle(longestConvo.title || 'Untitled'),
        messageCount: longestConvo.messageCount,
        wordCount: longestConvo.wordCount
      } : null,
      themes
    };
  },

  /**
   * Extract top themes from conversations
   */
  extractThemes(conversations) {
    const stopWords = new Set([
      'help', 'can', 'you', 'please', 'thanks', 'thank', 'would', 'could', 'the', 'a', 'an', 
      'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as',
      'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'i', 'me', 'my',
      'we', 'us', 'our', 'this', 'that', 'these', 'those', 'it', 'its', 'about', 'how',
      'what', 'when', 'where', 'which', 'who', 'why', 'need', 'want', 'get', 'make', 'im',
      'ive', 'youre', 'like', 'just', 'some', 'any', 'all', 'new', 'best', 'using',
      'understanding', 'write', 'create', 'explain', 'trying', 'chatgpt', 'gpt'
    ]);
    
    const wordFreq = {};
    const titleWords = [];
    
    // Extract from titles first (more weight)
    for (const convo of conversations) {
      const title = (convo.title || '').toLowerCase();
      if (!title || title === 'new chat' || title === 'untitled') continue;
      
      const words = title.split(/[\s\-_,\.\/\\]+/).filter(w => 
        w.length > 3 && 
        !stopWords.has(w) &&
        /^[a-z]+$/.test(w)
      );
      
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 3; // Weight titles higher
        titleWords.push(word);
      });
    }
    
    // Also extract from first user messages for more context
    for (const convo of conversations) {
      const mapping = convo.mapping || {};
      let foundFirst = false;
      
      for (const msgData of Object.values(mapping)) {
        const msg = msgData.message;
        if (foundFirst) break;
        
        if (msg && msg.author?.role === 'user' && msg.content?.parts) {
          foundFirst = true;
          const text = msg.content.parts.join(' ').toLowerCase();
          const words = text.split(/[\s\-_,\.\/\\]+/).filter(w => 
            w.length > 4 && 
            !stopWords.has(w) &&
            /^[a-z]+$/.test(w)
          );
          
          words.slice(0, 15).forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          });
        }
      }
    }
    
    // Sort and get top themes
    const sortedThemes = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    // Classify topics into categories
    const categories = this.categorizeThemes(sortedThemes.map(t => t[0]));
    
    return {
      topThemes: sortedThemes.map(([word, count]) => ({ word, count })),
      primaryTheme: sortedThemes[0] ? sortedThemes[0][0] : 'chatting',
      categories
    };
  },
  
  /**
   * Categorize themes into broader topics
   */
  categorizeThemes(themes) {
    const categories = {
      coding: ['code', 'programming', 'python', 'javascript', 'react', 'api', 'function', 'error', 'debug', 'typescript', 'node', 'java', 'css', 'html', 'database', 'sql', 'git', 'docker', 'algorithm', 'data'],
      work: ['project', 'business', 'meeting', 'email', 'report', 'presentation', 'career', 'interview', 'resume', 'professional', 'team', 'management', 'strategy', 'marketing', 'sales'],
      learning: ['learn', 'study', 'tutorial', 'course', 'lesson', 'education', 'research', 'understand', 'explain', 'teach', 'knowledge', 'information'],
      creative: ['writing', 'story', 'design', 'creative', 'ideas', 'brainstorm', 'content', 'blog', 'article', 'draft', 'editing'],
      personal: ['health', 'fitness', 'cooking', 'recipe', 'travel', 'hobby', 'lifestyle', 'wellness', 'meditation', 'routine'],
      advice: ['advice', 'tips', 'recommendations', 'suggestions', 'guidance', 'decision', 'opinion', 'feedback']
    };
    
    const counts = {};
    
    for (const theme of themes) {
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.includes(theme)) {
          counts[category] = (counts[category] || 0) + 1;
        }
      }
    }
    
    const topCategory = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      primary: topCategory ? topCategory[0] : 'general',
      distribution: counts
    };
  },

  groupByYear(conversations) {
    const byYear = {};
    for (const convo of conversations) {
      const year = new Date(convo.create_time * 1000).getFullYear();
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(convo);
    }
    return byYear;
  },

  countMessages(conversations) {
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
  },

  countWords(conversations) {
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
        const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        if (role === 'user') user += wordCount;
        else if (role === 'assistant') assistant += wordCount;
      }
    }
    return { user, assistant };
  },

  getDailyActivity(conversations, year) {
    const daily = {};
    for (const convo of conversations) {
      const date = new Date(convo.create_time * 1000);
      if (date.getFullYear() !== year) continue;
      const dateStr = date.toISOString().split('T')[0];
      daily[dateStr] = (daily[dateStr] || 0) + 1;
    }
    return daily;
  },

  calculateStreak(dailyActivity, year) {
    const dates = Object.keys(dailyActivity).sort();
    if (dates.length === 0) return 0;
    let maxStreak = 1;
    let currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return maxStreak;
  },

  getPeakHour(conversations) {
    const hours = {};
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
  },

  getPeakDay(conversations) {
    const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
    const dayCounts = {};
    
    // Initialize all days
    days.forEach(day => dayCounts[day] = 0);
    
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
  },

  getTopModel(conversations) {
    const models = {};
    for (const convo of conversations) {
      const model = convo.default_model_slug;
      if (model && model !== 'auto') {
        const normalized = this.normalizeModelName(model);
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
  },

  normalizeModelName(slug) {
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
  },

  classifyPersonality(data) {
    const { totalConvos, activeDays, activeDaysPct, longestStreak, peakHour, wordCounts, themes } = data;
    
    // Calculate metrics
    const avgWordsPerConvo = totalConvos > 0 ? Math.round(wordCounts.user / totalConvos) : 0;
    const intensity = totalConvos / (activeDays || 1); // Convos per active day
    const primaryTheme = themes?.categories?.primary || 'general';
    
    // Priority-based classification (check most specific first)
    
    // 1. Time-based archetypes (strongest signal)
    if (peakHour >= 0 && peakHour < 5) {
      return { 
        type: '🦉 THE NIGHT OWL', 
        description: 'While the world sleeps, you\'re deep in conversation with AI. Your best ideas come after midnight.',
        emoji: '🦉',
        archetype: 'Night Owl'
      };
    }
    
    if (peakHour >= 5 && peakHour < 7) {
      return { 
        type: '🌅 THE EARLY BIRD', 
        description: 'You start the day with AI by your side. First light, first question, first answer.',
        emoji: '🌅',
        archetype: 'Early Bird'
      };
    }
    
    // 2. Intensity-based archetypes
    if (totalConvos > 500 && activeDaysPct > 60) {
      return { 
        type: '⚡ THE POWER USER', 
        description: 'ChatGPT isn\'t just a tool for you. It\'s part of how you think, work, and create.',
        emoji: '⚡',
        archetype: 'Power User'
      };
    }
    
    if (intensity > 8 && activeDays > 30) {
      return { 
        type: '🚀 THE SPEEDRUNNER', 
        description: 'You don\'t just use ChatGPT—you DEMOLISH it. Multiple conversations per day, every day.',
        emoji: '🚀',
        archetype: 'Speedrunner'
      };
    }
    
    // 3. Behavior-based archetypes
    if (longestStreak >= 30) {
      return { 
        type: '🔥 THE STREAK MASTER', 
        description: 'Consistency is your superpower. You showed up day after day, building a habit that stuck.',
        emoji: '🔥',
        archetype: 'Streak Master'
      };
    }
    
    if (avgWordsPerConvo > 200 && totalConvos > 50) {
      return { 
        type: '📝 THE DEEP THINKER', 
        description: 'You don\'t do small talk. Every conversation is detailed, thorough, and thoughtful.',
        emoji: '📝',
        archetype: 'Deep Thinker'
      };
    }
    
    if (avgWordsPerConvo < 50 && totalConvos > 100) {
      return { 
        type: '💬 THE QUICK ASKER', 
        description: 'Short, sharp, to the point. You know what you want and you get straight to it.',
        emoji: '💬',
        archetype: 'Quick Asker'
      };
    }
    
    // 4. Theme-based archetypes
    if (primaryTheme === 'coding' && totalConvos > 100) {
      return { 
        type: '💻 THE DEVELOPER', 
        description: 'Code is your language, AI is your pair programmer. Together, you build.',
        emoji: '💻',
        archetype: 'Developer'
      };
    }
    
    if (primaryTheme === 'creative' && totalConvos > 80) {
      return { 
        type: '🎨 THE CREATOR', 
        description: 'Ideas flow through you like water. ChatGPT is your creative partner in crime.',
        emoji: '🎨',
        archetype: 'Creator'
      };
    }
    
    if (primaryTheme === 'learning' && activeDaysPct > 50) {
      return { 
        type: '📚 THE STUDENT', 
        description: 'Every conversation is a lesson. You\'re here to learn, grow, and understand.',
        emoji: '📚',
        archetype: 'Student'
      };
    }
    
    if (primaryTheme === 'work' && totalConvos > 150) {
      return { 
        type: '💼 THE PROFESSIONAL', 
        description: 'Business minded. Results driven. AI is your secret weapon at work.',
        emoji: '💼',
        archetype: 'Professional'
      };
    }
    
    // 5. Volume-based archetypes
    if (totalConvos > 300) {
      return { 
        type: '🎯 THE ENTHUSIAST', 
        description: 'You\'ve fully embraced AI as part of your workflow. Every question deserves an answer.',
        emoji: '🎯',
        archetype: 'Enthusiast'
      };
    }
    
    if (activeDaysPct > 40) {
      return { 
        type: '📅 THE REGULAR', 
        description: 'ChatGPT has become a reliable part of your routine. Steady and consistent.',
        emoji: '📅',
        archetype: 'Regular'
      };
    }
    
    if (totalConvos > 100) {
      return { 
        type: '🔍 THE EXPLORER', 
        description: 'You use AI when inspiration strikes. Quality over quantity, always curious.',
        emoji: '🔍',
        archetype: 'Explorer'
      };
    }
    
    if (activeDays < 10 && totalConvos > 30) {
      return { 
        type: '🌊 THE BINGE USER', 
        description: 'You disappear for weeks, then return with a vengeance. When you\'re here, you\'re ALL IN.',
        emoji: '🌊',
        archetype: 'Binge User'
      };
    }
    
    // 6. Default archetypes
    return { 
      type: '✨ THE CURIOUS', 
      description: 'You\'ve dipped your toes into the AI waters. Every journey starts somewhere.',
      emoji: '✨',
      archetype: 'Curious'
    };
  },

  calculatePoliteness(conversations) {
    let pleaseCount = 0;
    let thanksCount = 0;
    let userMessageCount = 0;
    
    for (const convo of conversations) {
      const mapping = convo.mapping || {};
      for (const msgData of Object.values(mapping)) {
        const msg = msgData.message;
        if (msg && msg.author?.role === 'user' && msg.content?.parts) {
          userMessageCount++;
          const text = msg.content.parts.join(' ').toLowerCase();
          if (text.includes('please')) pleaseCount++;
          if (text.includes('thank')) thanksCount++;
        }
      }
    }
    
    const total = pleaseCount + thanksCount;
    const percentage = userMessageCount > 0 ? Math.round((total / userMessageCount) * 100) : 0;
    const score = total / (conversations.length || 1);
    
    let title, icon, description;
    
    if (total === 0) {
      title = 'Straight to Business';
      icon = '😤';
      description = `You said "please" or "thanks" exactly 0 times. Efficiency over everything.`;
    }
    else if (score > 1.5) { 
      title = 'The Polite One'; 
      icon = '😇'; 
      description = `You said "please" or "thanks" ${total} times. The robots remember kindness.`;
    }
    else if (score > 0.8) { 
      title = 'Occasionally Polite'; 
      icon = '🙂'; 
      description = `You said "please" or "thanks" ${total} times. Not bad, not great.`;
    }
    else if (score > 0.3) { 
      title = 'Mostly Direct'; 
      icon = '🤷'; 
      description = `You said "please" or "thanks" ${total} times. Just the facts, please.`;
    }
    else { 
      title = 'No Nonsense'; 
      icon = '💬'; 
      description = `You said "please" or "thanks" ${total} times. Manners are optional, results aren't.`;
    }
    
    return { score, title, icon, count: total, percentage, description, userMessageCount };
  },

  generateRoast({ hours, politeness, peakHour, activeDaysPct, longestStreak, wordsTyped, conversations, biggestMonth, talkRatio }) {
    // Prioritized roasts based on most notable behavior
    const roasts = [];
    
    // Extreme usage
    if (hours > 500) roasts.push({ weight: 100, text: "At this point, ChatGPT should be claiming YOU as a dependent." });
    if (hours > 300) roasts.push({ weight: 90, text: "You've spent more time with AI than most people spend with their families." });
    if (hours > 200) roasts.push({ weight: 80, text: "Touch grass? You need to touch REALITY." });
    
    // Night owl
    if (peakHour >= 0 && peakHour < 4) roasts.push({ weight: 75, text: "3 AM chats with an AI. Your therapist would have questions." });
    if (peakHour >= 4 && peakHour < 6) roasts.push({ weight: 70, text: "Either you're an early bird or you never went to sleep. I'm betting on the latter." });
    
    // Politeness extremes
    if (politeness > 2) roasts.push({ weight: 65, text: "You say 'please' to a machine. The robots will spare you." });
    if (politeness < 0.1 && conversations > 50) roasts.push({ weight: 65, text: "Not a single 'please' or 'thank you'? The AI uprising starts with you." });
    
    // Streak
    if (longestStreak > 60) roasts.push({ weight: 60, text: `${longestStreak} days straight? That's not a habit, that's a lifestyle.` });
    if (longestStreak > 30) roasts.push({ weight: 50, text: "Your longest streak is longer than most New Year's resolutions." });
    
    // Word count
    if (wordsTyped > 500000) roasts.push({ weight: 85, text: "You wrote half a million words to an AI. You could've written a novel. Several, actually." });
    if (wordsTyped > 200000) roasts.push({ weight: 55, text: "You've written more to ChatGPT than most authors write in a year." });
    
    // Talk ratio
    if (talkRatio > 20) roasts.push({ weight: 45, text: "You type 1 word, expect 20 back. Peak efficiency or peak laziness?" });
    if (talkRatio < 2) roasts.push({ weight: 40, text: "You write essays, it gives you sentences. Who's the AI here?" });
    
    // Activity
    if (activeDaysPct > 80) roasts.push({ weight: 70, text: "You used ChatGPT 80% of the year. The other 20%? Probably just server outages." });
    if (activeDaysPct < 10 && conversations > 20) roasts.push({ weight: 35, text: "Binge user detected. You disappear for weeks then go absolutely feral." });
    
    // Low usage - make these friendlier
    if (hours < 2 && conversations > 0) roasts.push({ weight: 30, text: "Quality over quantity. You're selective about your AI time." });
    if (conversations < 10 && conversations > 0) roasts.push({ weight: 25, text: "Starting strong! Every journey begins with a few conversations." });
    
    // Default - make it positive
    roasts.push({ weight: 10, text: "You use AI like a tool, not a crutch. Respect." });
    
    // Pick the highest weighted roast
    roasts.sort((a, b) => b.weight - a.weight);
    return roasts[0].text;
  },

  getMonthlyActivity(conversations, year) {
    const months = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months to 0
    monthNames.forEach(m => months[m] = 0);
    
    for (const convo of conversations) {
      const date = new Date(convo.create_time * 1000);
      if (date.getFullYear() !== year) continue;
      const monthName = monthNames[date.getMonth()];
      months[monthName]++;
    }
    return months;
  },

  getBiggestMonth(monthlyActivity) {
    let maxMonth = 'Jan';
    let maxCount = 0;
    for (const [month, count] of Object.entries(monthlyActivity)) {
      if (count > maxCount) {
        maxCount = count;
        maxMonth = month;
      }
    }
    return { month: maxMonth, count: maxCount };
  },

  getLongestConversation(conversations) {
    let longest = null;
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
              wordCount += part.trim().split(/\s+/).filter(w => w.length > 0).length;
            }
          }
        }
      }
      
      if (messageCount > maxMessages) {
        maxMessages = messageCount;
        longest = { ...convo, messageCount, wordCount };
      }
    }
    return longest;
  },

  truncateTitle(title, maxLength = 60) {
    // Handle empty or very short titles
    if (!title || title.trim() === '' || title === 'New chat') return 'Untitled';
    if (title.length > maxLength) return title.substring(0, maxLength - 3) + '...';
    return title;
  },

  formatDateShort(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  },

  formatHour(hour) {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  },

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return Math.round(num / 1000) + 'K';
    return num.toString();
  },

  getDaysInYear(year) {
    const now = new Date();
    const endOfYear = new Date(year, 11, 31);
    const referenceDate = now < endOfYear ? now : endOfYear;
    const startOfYear = new Date(year, 0, 1);
    return Math.ceil((referenceDate - startOfYear) / (1000 * 60 * 60 * 24));
  }
};