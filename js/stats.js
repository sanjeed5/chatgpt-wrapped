/**
 * ChatGPT Wrapped - Stats Computation
 * Calculates all metrics from conversations data
 */

const Stats = {
  /**
   * Compute all stats from conversations
   */
  compute(conversations, targetYear) {
    // Filter valid conversations with timestamps
    const validConvos = conversations.filter(c => c.create_time);
    
    // Sort by time
    validConvos.sort((a, b) => a.create_time - b.create_time);

    const resolvedYear = targetYear || this.getLatestYear(validConvos);
    const yearToAnalyze = resolvedYear || new Date().getFullYear();
    
    // Get conversations by year
    const convosByYear = this.groupByYear(validConvos);
    const targetYearConvos = convosByYear[yearToAnalyze] || [];
    const previousYearConvos = convosByYear[yearToAnalyze - 1] || [];
    
    // First conversation
    const firstConvo = validConvos[0];
    const firstDate = firstConvo ? new Date(firstConvo.create_time * 1000) : null;
    const daysSinceFirst = firstDate 
      ? Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Message counts
    const messageCounts = this.countMessages(targetYearConvos);
    const previousYearMessageCounts = this.countMessages(previousYearConvos);
    
    // Word counts
    const wordCounts = this.countWords(targetYearConvos);
    
    // Extract themes from conversations
    const themes = this.extractThemes(targetYearConvos);
    
    // Year over year growth (based on messages)
    const yoyGrowth = previousYearConvos.length > 0 
      ? (targetYearConvos.length / previousYearConvos.length)
      : null;
    const yoyMessageGrowth = previousYearMessageCounts.user > 0
      ? (messageCounts.user / previousYearMessageCounts.user)
      : null;
    
    // Daily activity for target year
    const dailyActivity = this.getDailyActivity(targetYearConvos, yearToAnalyze);
    const dailyActivityAllTime = this.getDailyActivity(validConvos);
    const activeDays = Object.keys(dailyActivity).length;
    const totalDaysInYear = this.getDaysInYear(yearToAnalyze);
    const activeDaysPct = Math.round((activeDays / totalDaysInYear) * 100);
    const lastActiveDateKey = this.getLastActiveDateKey(dailyActivityAllTime);
    
    // Longest streak
    const streakData = this.calculateStreak(dailyActivity, yearToAnalyze);
    const longestStreak = streakData.length;
    const longestStreakRange = longestStreak > 0 && streakData.startKey && streakData.endKey
      ? {
          startKey: streakData.startKey,
          endKey: streakData.endKey,
          start: this.formatDate(this.parseDateKey(streakData.startKey)),
          end: this.formatDate(this.parseDateKey(streakData.endKey)),
          startShort: this.formatDateShort(this.parseDateKey(streakData.startKey)),
          endShort: this.formatDateShort(this.parseDateKey(streakData.endKey))
        }
      : null;
    
    // Peak hour and day
    const peakHour = this.getPeakHour(targetYearConvos);
    const peakDayData = this.getPeakDay(targetYearConvos);
    const peakDay = peakDayData.day;
    
    // Model usage
    const topModel = this.getTopModel(targetYearConvos);
    const topModels = this.getTopModels(targetYearConvos, 3);
    
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
      themes,
      talkRatio
    });

    // Fun Stats
    const politeness = this.calculatePoliteness(targetYearConvos);
    const booksWritten = Math.floor(wordCounts.user / 50000); // 50k words per book
    
    // First conversation of the year
    const firstConvoOfYear = targetYearConvos[0];
    const firstConvoDate = firstConvoOfYear 
      ? new Date(firstConvoOfYear.create_time * 1000) 
      : null;
    const firstConvoTitle = firstConvoOfYear ? this.getConversationTitle(firstConvoOfYear) : 'Untitled';
    
    // Biggest month (by messages)
    const monthlyActivity = this.getMonthlyActivity(targetYearConvos, yearToAnalyze);
    const monthlyMessageActivity = this.getMonthlyMessageActivity(targetYearConvos, yearToAnalyze);
    const biggestMonth = this.getBiggestMonth(monthlyMessageActivity);
    
    // Longest conversation
    const longestConvo = this.getLongestConversation(targetYearConvos);
    
    return {
      allTime: {
        totalConversations: validConvos.length,
        firstDate: firstDate ? this.formatDate(firstDate) : null,
        firstDateShort: firstDate ? this.formatDateShort(firstDate) : null,
        firstYear: firstDate ? firstDate.getFullYear() : null,
        firstConvoTitle: firstConvo ? this.getConversationTitle(firstConvo) : 'Untitled',
        daysSinceFirst,
        byYear: Object.fromEntries(
          Object.entries(convosByYear).map(([year, convos]) => [year, convos.length])
        )
      },
      year: yearToAnalyze,
      conversations: targetYearConvos.length,
      conversationsPerDay: (targetYearConvos.length / totalDaysInYear).toFixed(1),
      yoyGrowth: yoyGrowth ? Math.round(yoyGrowth * 10) / 10 : null,
      yoyMessageGrowth: yoyMessageGrowth ? Math.round(yoyMessageGrowth * 10) / 10 : null,
      previousYearConversations: previousYearConvos.length,
      previousYearUserMessages: previousYearMessageCounts.user,
      wordsTyped: wordCounts.user,
      wordsTypedFormatted: this.formatNumber(wordCounts.user),
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
      peakHour: this.formatHour(peakHour),
      peakHourRaw: peakHour,
      peakDay,
      peakDayDistribution: peakDayData.distribution,
      topModel,
      topModels,
      personality,
      politeness,
      userMessages: messageCounts.user,
      assistantMessages: messageCounts.assistant,
      booksWritten,
      firstConvoDate: firstConvoDate ? this.formatDate(firstConvoDate) : null,
      firstConvoDateShort: firstConvoDate ? this.formatDateShort(firstConvoDate) : null,
      firstConvoTitle: firstConvoTitle,
      biggestMonth,
      monthlyActivity,
      longestConvo: longestConvo ? {
        title: this.getConversationTitle(longestConvo),
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
      if (typeof year === 'number' && date.getFullYear() !== year) continue;
      const dateStr = this.formatLocalDateKey(date);
      daily[dateStr] = (daily[dateStr] || 0) + 1;
    }
    return daily;
  },

  getLastActiveDateKey(dailyActivity) {
    const dates = Object.keys(dailyActivity).sort();
    return dates.length > 0 ? dates[dates.length - 1] : null;
  },

  calculateStreak(dailyActivity, year) {
    const dates = Object.keys(dailyActivity).sort();
    if (dates.length === 0) return { length: 0, startKey: null, endKey: null };
    let maxStreak = 1;
    let currentStreak = 1;
    let currentStart = dates[0];
    let bestStart = dates[0];
    let bestEnd = dates[0];
    for (let i = 1; i < dates.length; i++) {
      const prevDate = this.parseDateKey(dates[i - 1]);
      const currDate = this.parseDateKey(dates[i]);
      const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
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
    const models = this.countModelsByMessage(conversations);
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

  getTopModels(conversations, limit = 3) {
    const models = this.countModelsByMessage(conversations);
    return Object.entries(models)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([model, count]) => ({ model, count }));
  },

  countModelsByMessage(conversations) {
    const models = {};
    for (const convo of conversations) {
      const mapping = convo.mapping || {};
      for (const msgData of Object.values(mapping)) {
        const msg = msgData.message;
        if (!msg) continue;
        
        // Only count assistant messages (the model's responses)
        if (msg.author?.role !== 'assistant') continue;
        
        // Skip hidden messages
        if (msg.metadata?.is_visually_hidden_from_conversation) continue;
        
        // Get model from message metadata, fall back to conversation default
        const model = msg.metadata?.model_slug || convo.default_model_slug;
        if (model && model !== 'auto') {
          const normalized = this.normalizeModelName(model);
          models[normalized] = (models[normalized] || 0) + 1;
        }
      }
    }
    return models;
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
    const { totalConvos, activeDays, activeDaysPct, longestStreak, peakHour, wordCounts, themes, talkRatio } = data;
    
    // Calculate metrics
    const avgWordsPerConvo = totalConvos > 0 ? Math.round(wordCounts.user / totalConvos) : 0;
    const intensity = totalConvos / (activeDays || 1); // Convos per active day

    // Priority-based classification (check most specific first)
    
    // 1. Time-based archetypes (strongest signal)
    if (peakHour >= 0 && peakHour < 5) {
      return { 
        type: '🦉 THE NIGHT OWL', 
        description: 'While the world sleeps, you\'re deep in conversation with AI. Your best ideas come after midnight.',
        reason: 'Peak activity in the dead of night—late night is your creative window.',
        emoji: '🦉',
        archetype: 'Night Owl'
      };
    }
    
    if (peakHour >= 5 && peakHour < 7) {
      return { 
        type: '🌅 THE EARLY BIRD', 
        description: 'You start the day with AI by your side. First light, first question, first answer.',
        reason: 'Most active before 7 AM—you open the day with ChatGPT.',
        emoji: '🌅',
        archetype: 'Early Bird'
      };
    }
    
    // 2. Intensity-based archetypes
    if (totalConvos > 500 && activeDaysPct > 60) {
      return { 
        type: '⚡ THE POWER USER', 
        description: 'ChatGPT isn\'t just a tool for you. It\'s part of how you think, work, and create.',
        reason: 'Active most of the year with consistent high usage—this is true integration.',
        emoji: '⚡',
        archetype: 'Power User'
      };
    }
    
    // 3. Behavior-based archetypes
    if (longestStreak >= 30) {
      return { 
        type: '🔥 THE STREAK MASTER', 
        description: 'Consistency is your superpower. You showed up day after day, building a habit that stuck.',
        reason: 'A long streak that rivals New Year resolutions—you built a lasting habit.',
        emoji: '🔥',
        archetype: 'Streak Master'
      };
    }
    
    if (avgWordsPerConvo > 200 && totalConvos > 50) {
      return { 
        type: '📝 THE DEEP THINKER', 
        description: 'You don\'t do small talk. Every conversation is detailed, thorough, and thoughtful.',
        reason: 'You write essays, not prompts—every conversation is well-considered.',
        emoji: '📝',
        archetype: 'Deep Thinker'
      };
    }
    
    // 4. Theme-based archetypes
    const primaryTheme = themes?.categories?.primary || 'general';
    
    if (primaryTheme === 'coding' && totalConvos > 100) {
      return { 
        type: '💻 THE DEVELOPER', 
        description: 'Code is your language, AI is your pair programmer.',
        reason: 'Your conversations are dominated by code and technical problem solving.',
        emoji: '💻',
        archetype: 'Developer'
      };
    }
    
    // 5. Volume-based archetypes
    if (activeDaysPct > 40) {
      return { 
        type: '📅 THE REGULAR', 
        description: 'ChatGPT has become a reliable part of your routine.',
        reason: 'You used ChatGPT frequently throughout the year—a true habit.',
        emoji: '📅',
        archetype: 'Regular'
      };
    }
    
    // 6. Default archetype
    return { 
      type: '✨ THE EXPLORER', 
      description: 'You use AI when inspiration strikes. Quality over quantity.',
      reason: 'You\'re just starting your journey with AI—welcome aboard.',
      emoji: '✨',
      archetype: 'Explorer'
    };
  },

  calculatePoliteness(conversations) {
    let politeCount = 0;
    let userMessageCount = 0;
    
    // Word boundary regex for short terms (to avoid false positives like "ty" in "party")
    const shortTermRegex = /\b(pls|plz|thx|ty|tysm)\b/gi;
    
    for (const convo of conversations) {
      const mapping = convo.mapping || {};
      for (const msgData of Object.values(mapping)) {
        const msg = msgData.message;
        if (msg && msg.author?.role === 'user' && msg.content?.parts) {
          userMessageCount++;
          const text = msg.content.parts.join(' ').toLowerCase();
          
          // Long terms - simple includes is fine (no false positive risk)
          if (text.includes('please')) politeCount++;
          if (text.includes('thank')) politeCount++;  // catches thanks, thank you, thankful
          if (text.includes('appreciate')) politeCount++;  // catches appreciated, appreciation
          if (text.includes('grateful')) politeCount++;
          if (text.includes('kindly')) politeCount++;
          
          // Short terms - need word boundaries to avoid false positives
          const shortMatches = text.match(shortTermRegex);
          if (shortMatches) politeCount += shortMatches.length;
        }
      }
    }
    
    const total = politeCount;
    const percentage = userMessageCount > 0 ? Math.round((total / userMessageCount) * 100) : 0;
    const score = total / (conversations.length || 1);
    
    let title, icon, description;
    
    if (total === 0) {
      title = 'Straight to Business';
      icon = '😤';
      description = `You said "please" or "thanks" exactly 0 times. All business, no pleasantries.`;
    }
    else if (score > 1.5) { 
      title = 'The Polite One'; 
      icon = '😇'; 
      description = `You said "please" or "thanks" ${total} times. It shows.`;
    }
    else if (score > 0.8) { 
      title = 'Occasionally Polite'; 
      icon = '🙂'; 
      description = `You said "please" or "thanks" ${total} times. A solid amount of kindness.`;
    }
    else if (score > 0.3) { 
      title = 'Mostly Direct'; 
      icon = '🤷'; 
      description = `You said "please" or "thanks" ${total} times. Mostly direct, still polite.`;
    }
    else { 
      title = 'No Nonsense'; 
      icon = '💬'; 
      description = `You said "please" or "thanks" ${total} times. You keep it direct and move on.`;
    }
    
    return { score, title, icon, count: total, percentage, description, userMessageCount };
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

  getMonthlyMessageActivity(conversations, year) {
    const months = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months to 0
    monthNames.forEach(m => months[m] = 0);
    
    for (const convo of conversations) {
      const date = new Date(convo.create_time * 1000);
      if (date.getFullYear() !== year) continue;
      const monthName = monthNames[date.getMonth()];
      
      // Count user messages in this conversation
      const mapping = convo.mapping || {};
      for (const msgData of Object.values(mapping)) {
        const msg = msgData.message;
        if (!msg) continue;
        const role = msg.author?.role;
        const isHidden = msg.metadata?.is_visually_hidden_from_conversation;
        if (isHidden) continue;
        if (role === 'user') months[monthName]++;
      }
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

  /**
   * Extract first user message from a conversation
   */
  getFirstUserMessage(conversation) {
    if (!conversation || !conversation.mapping) return null;
    
    const mapping = conversation.mapping;
    
    // Try to find messages in order
    for (const msgData of Object.values(mapping)) {
      const msg = msgData.message;
      if (!msg) continue;
      
      // Look for user messages
      if (msg.author?.role === 'user' && msg.content?.parts) {
        const text = msg.content.parts
          .filter(part => typeof part === 'string')
          .join(' ')
          .trim();
        
        if (text.length > 0) {
          return text;
        }
      }
    }
    
    return null;
  },

  /**
   * Get a display title for a conversation
   * Falls back to first user message if title is generic/empty
   */
  getConversationTitle(conversation, maxLength = 60) {
    const title = conversation?.title;
    
    // Check if title is empty or generic
    const isGeneric = !title || 
                     typeof title !== 'string' || 
                     title.trim() === '' || 
                     title.toLowerCase() === 'new chat' || 
                     title.toLowerCase() === 'untitled';
    
    if (isGeneric) {
      // Try to get first user message
      const firstMessage = this.getFirstUserMessage(conversation);
      if (firstMessage) {
        // Truncate if needed
        if (firstMessage.length > maxLength) {
          return firstMessage.substring(0, maxLength - 3) + '...';
        }
        return firstMessage;
      }
      // Final fallback
      return 'A conversation with ChatGPT';
    }
    
    // Use actual title, truncated if needed
    const trimmed = title.trim();
    if (trimmed.length > maxLength) {
      return trimmed.substring(0, maxLength - 3) + '...';
    }
    return trimmed;
  },

  truncateTitle(title, maxLength = 60) {
    // Legacy function - now just handles raw title strings
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return 'A conversation with ChatGPT';
    }
    const trimmed = title.trim();
    if (trimmed.length > maxLength) return trimmed.substring(0, maxLength - 3) + '...';
    return trimmed;
  },

  formatDateShort(date) {
    // Returns "Jan 2" style explicitly
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
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
    // Use end of Dec 31 (23:59:59.999) to include the full last day
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    const referenceDate = now < endOfYear ? now : endOfYear;
    const startOfYear = new Date(year, 0, 1);
    // Add 1 to include the start day in the count
    return Math.floor((referenceDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  },

  getLatestYear(conversations) {
    if (!conversations || conversations.length === 0) return new Date().getFullYear();
    let latest = new Date(conversations[0].create_time * 1000).getFullYear();
    for (const convo of conversations) {
      const year = new Date(convo.create_time * 1000).getFullYear();
      if (year > latest) latest = year;
    }
    return latest;
  },

  formatLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  parseDateKey(key) {
    const parts = key.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(key);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
};
