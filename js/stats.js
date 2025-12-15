/**
 * ChatGPT Wrapped - Stats Computation
 * Calculates all metrics from conversations data
 */

const Stats = {
  /**
   * Compute all stats from conversations
   * @param {Array} conversations - Array of conversation objects
   * @param {number} targetYear - The year to focus on (default: 2025)
   * @returns {Object} - Computed statistics
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
    const targetYearMessageCounts = this.countMessages(targetYearConvos);
    
    // Word counts
    const wordCounts = this.countWords(validConvos);
    
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
    const peakDay = this.getPeakDay(targetYearConvos);
    
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
      wordCounts
    });
    
    return {
      // All time
      allTime: {
        totalConversations: validConvos.length,
        firstDate: firstDate ? this.formatDate(firstDate) : null,
        daysSinceFirst,
        byYear: Object.fromEntries(
          Object.entries(convosByYear).map(([year, convos]) => [year, convos.length])
        )
      },
      
      // Target year
      year: targetYear,
      conversations: targetYearConvos.length,
      conversationsPerDay: (targetYearConvos.length / totalDaysInYear).toFixed(1),
      
      // Growth
      yoyGrowth: yoyGrowth ? Math.round(yoyGrowth * 10) / 10 : null,
      previousYearConversations: previousYearConvos.length,
      
      // Words
      wordsTyped: wordCounts.user,
      wordsTypedFormatted: this.formatNumber(wordCounts.user),
      wordsReceived: wordCounts.assistant,
      novelsEquivalent: Math.floor(wordCounts.user / 80000),
      talkRatio,
      
      // Activity
      activeDays,
      activeDaysPct,
      dailyActivity,
      longestStreak,
      
      // Time patterns
      peakHour: this.formatHour(peakHour),
      peakHourRaw: peakHour,
      peakDay,
      
      // Model
      topModel,
      
      // Personality
      personality,
      
      // Messages
      userMessages: messageCounts.user,
      assistantMessages: messageCounts.assistant
    };
  },

  /**
   * Group conversations by year
   */
  groupByYear(conversations) {
    const byYear = {};
    for (const convo of conversations) {
      const year = new Date(convo.create_time * 1000).getFullYear();
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(convo);
    }
    return byYear;
  },

  /**
   * Count user and assistant messages
   */
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

  /**
   * Count words in messages
   */
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

  /**
   * Get daily activity counts for a year
   */
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

  /**
   * Calculate longest streak of consecutive days
   */
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

  /**
   * Get peak hour of activity
   */
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

  /**
   * Get peak day of week
   */
  getPeakDay(conversations) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = {};
    
    for (const convo of conversations) {
      const dayIndex = new Date(convo.create_time * 1000).getDay();
      const dayName = days[dayIndex];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    }
    
    let maxDay = 'Monday';
    let maxCount = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    }
    
    return maxDay;
  },

  /**
   * Get most used model
   */
  getTopModel(conversations) {
    const models = {};
    
    for (const convo of conversations) {
      const model = convo.default_model_slug;
      if (model && model !== 'auto') {
        // Normalize model names
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

  /**
   * Normalize model slug to display name
   */
  normalizeModelName(slug) {
    if (!slug) return 'GPT-4';
    
    const lower = slug.toLowerCase();
    
    // GPT-5 family
    if (lower.includes('gpt-5')) return 'GPT-5';
    
    // O-series (reasoning)
    if (lower.startsWith('o3')) return 'o3';
    if (lower.startsWith('o4')) return 'o4';
    if (lower.startsWith('o1')) return 'o1';
    
    // GPT-4 family
    if (lower.includes('gpt-4o')) return 'GPT-4o';
    if (lower.includes('gpt-4')) return 'GPT-4';
    
    // GPT-3.5
    if (lower.includes('gpt-3') || lower.includes('davinci')) return 'GPT-3.5';
    
    return slug.toUpperCase();
  },

  /**
   * Classify user personality based on usage patterns
   */
  classifyPersonality(data) {
    const { totalConvos, activeDays, activeDaysPct, longestStreak, peakHour } = data;
    
    // Night owl: peak usage between midnight and 5am
    if (peakHour >= 0 && peakHour < 5) {
      return {
        type: 'THE NIGHT OWL',
        description: 'While the world sleeps, you\'re deep in conversation with AI. Your best ideas come after midnight.'
      };
    }
    
    // Power user: high volume AND consistent
    if (totalConvos > 500 && activeDaysPct > 60) {
      return {
        type: 'THE POWER USER',
        description: 'ChatGPT isn\'t just a tool for you. It\'s part of how you think, work, and create.'
      };
    }
    
    // Streak master: long streaks
    if (longestStreak >= 30) {
      return {
        type: 'THE STREAK MASTER',
        description: 'Consistency is your superpower. You showed up day after day, building a habit that stuck.'
      };
    }
    
    // Heavy user
    if (totalConvos > 300) {
      return {
        type: 'THE ENTHUSIAST',
        description: 'You\'ve fully embraced AI as part of your workflow. Every question deserves an answer.'
      };
    }
    
    // Regular user
    if (activeDaysPct > 40) {
      return {
        type: 'THE REGULAR',
        description: 'ChatGPT has become a reliable part of your routine. Steady and consistent.'
      };
    }
    
    // Explorer
    if (totalConvos > 100) {
      return {
        type: 'THE EXPLORER',
        description: 'You use AI when inspiration strikes. Quality over quantity, always curious.'
      };
    }
    
    // Default
    return {
      type: 'THE CURIOUS',
      description: 'You\'ve dipped your toes into the AI waters. Every journey starts somewhere.'
    };
  },

  /**
   * Format helpers
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
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
