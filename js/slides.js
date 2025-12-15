/**
 * ChatGPT Wrapped - Slides Generator
 * Creates slide HTML from computed stats
 */

const Slides = {
  /**
   * Generate all slides HTML
   * @param {Object} stats - Computed statistics
   * @returns {string} - HTML string for all slides
   */
  generate(stats) {
    const slides = [
      this.introSlide(stats),
      this.originSlide(stats),
      this.growthSlide(stats),
      this.conversationsSlide(stats),
      this.wordsSlide(stats),
      this.streakSlide(stats),
      this.activeDaysSlide(stats),
      this.peakTimeSlide(stats),
      this.modelSlide(stats),
      this.personalitySlide(stats),
      this.summarySlide(stats)
    ].filter(Boolean); // Remove null slides
    
    return slides.join('\n');
  },

  /**
   * Slide 1: Intro
   */
  introSlide(stats) {
    return `
      <div class="slide active" data-slide="1">
        <div class="slide-content">
          <p class="eyebrow">Your year with AI</p>
          <h1 class="slide-title">ChatGPT Wrapped</h1>
          <div class="intro-year-huge">${stats.year}</div>
          <p class="tap-hint">
            <span class="tap-hint-text">tap anywhere to continue</span>
            <span class="tap-hint-arrow">→</span>
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 2: Origin
   */
  originSlide(stats) {
    if (!stats.allTime.firstDate) return null;
    
    return `
      <div class="slide" data-slide="2">
        <div class="slide-content">
          <p class="eyebrow">Where it all began</p>
          <div class="date-display">${stats.allTime.firstDate}</div>
          <p class="subtitle">Your first conversation with ChatGPT</p>
          <div class="big-number white" style="font-size: clamp(60px, 16vw, 130px);">${stats.allTime.daysSinceFirst.toLocaleString()}</div>
          <div class="label">days ago</div>
          <p class="tagline">You were early.</p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 3: Growth
   */
  growthSlide(stats) {
    // Only show if there's meaningful growth data
    if (!stats.yoyGrowth || stats.previousYearConversations < 5) {
      return null;
    }
    
    const growthDisplay = stats.yoyGrowth >= 10 
      ? Math.round(stats.yoyGrowth) 
      : stats.yoyGrowth.toFixed(1);
    
    return `
      <div class="slide" data-slide="3">
        <div class="slide-content">
          <p class="eyebrow">This year</p>
          <div class="multiplier">
            <div class="big-number gradient" style="font-size: clamp(100px, 28vw, 220px);">${growthDisplay}</div>
            <div class="multiplier-x">x</div>
          </div>
          <div class="label">more conversations than last year</div>
          <p class="tagline">You went all-in on AI</p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 4: Conversations
   */
  conversationsSlide(stats) {
    return `
      <div class="slide" data-slide="4">
        <div class="slide-content">
          <p class="eyebrow">Total conversations</p>
          <div class="big-number">${stats.conversations.toLocaleString()}</div>
          <div class="label">conversations in ${stats.year}</div>
          <p class="tagline">That's about <span class="highlight">${stats.conversationsPerDay} per day</span></p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 5: Words
   */
  wordsSlide(stats) {
    const novelsText = stats.novelsEquivalent > 0 
      ? `${stats.novelsEquivalent} novel${stats.novelsEquivalent > 1 ? 's' : ''}`
      : 'a short story';
    
    return `
      <div class="slide" data-slide="5">
        <div class="slide-content">
          <p class="eyebrow">You wrote</p>
          <div class="big-number">${stats.wordsTypedFormatted}</div>
          <div class="label">words to ChatGPT</div>
          <p class="tagline">That's <span class="highlight-coral">${novelsText}</span> worth of prompts</p>
          ${stats.talkRatio > 1 ? `<p class="tagline-dim">ChatGPT wrote back ${stats.talkRatio}x more</p>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Slide 6: Streak
   */
  streakSlide(stats) {
    if (stats.longestStreak < 3) return null;
    
    let tagline = 'Nice consistency';
    if (stats.longestStreak >= 30) tagline = 'That\'s serious dedication';
    else if (stats.longestStreak >= 14) tagline = 'Two weeks strong';
    else if (stats.longestStreak >= 7) tagline = 'A full week without missing';
    
    return `
      <div class="slide" data-slide="6">
        <div class="slide-content">
          <p class="eyebrow">Longest streak</p>
          <div class="big-number coral">${stats.longestStreak}</div>
          <div class="label">days in a row</div>
          <p class="tagline">${tagline}</p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 7: Active Days with contribution graph
   */
  activeDaysSlide(stats) {
    const contribGraph = this.generateContribGraph(stats.dailyActivity, stats.year);
    
    return `
      <div class="slide" data-slide="7">
        <div class="slide-content">
          <p class="eyebrow">Your ${stats.year}</p>
          <div class="contrib-wrapper">
            ${contribGraph}
          </div>
          <div class="big-number" style="font-size: clamp(64px, 18vw, 140px);">${stats.activeDays}</div>
          <div class="label">days active</div>
          <p class="tagline"><span class="highlight">${stats.activeDaysPct}%</span> of the year</p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 8: Peak Time
   */
  peakTimeSlide(stats) {
    return `
      <div class="slide" data-slide="8">
        <div class="slide-content">
          <p class="eyebrow">When you chat</p>
          <div class="peak-grid">
            <div class="peak-item">
              <div class="peak-value cyan">${stats.peakHour}</div>
              <div class="peak-label">Peak hour</div>
            </div>
            <div class="peak-item">
              <div class="peak-value coral">${stats.peakDay}</div>
              <div class="peak-label">Peak day</div>
            </div>
          </div>
          <p class="tagline">${this.getPeakTimeTagline(stats.peakHourRaw, stats.peakDay)}</p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 9: Model
   */
  modelSlide(stats) {
    return `
      <div class="slide" data-slide="9">
        <div class="slide-content">
          <p class="eyebrow">Your favorite AI</p>
          <div class="model-name">${stats.topModel}</div>
          <p class="subtitle">Your most-used model in ${stats.year}</p>
          <p class="tagline">You like the good stuff</p>
        </div>
      </div>
    `;
  },

  /**
   * Slide 10: Personality
   */
  personalitySlide(stats) {
    return `
      <div class="slide" data-slide="10">
        <div class="slide-content">
          <p class="eyebrow">Based on your patterns</p>
          <p class="subtitle">You are</p>
          <div class="personality-type">${stats.personality.type}</div>
          <div class="glass-card">
            <p class="personality-description">
              ${stats.personality.description}
            </p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Slide 11: Summary Card - Story-driven shareable card
   */
  summarySlide(stats) {
    // Generate a fun story tagline based on their usage
    const storyTagline = this.getStoryTagline(stats);
    const journeyStart = stats.allTime.firstDate ? `AI explorer since ${stats.allTime.firstDate.split(',')[0]}` : '';
    
    return `
      <div class="slide" data-slide="11">
        <div class="slide-content">
          <div class="summary-card-v2">
            <div class="summary-card-header">
              <div class="summary-brand">
                <span class="summary-sparkle">✦</span>
                <span>ChatGPT Wrapped</span>
              </div>
              <div class="summary-year">${stats.year}</div>
            </div>
            
            <div class="summary-personality-badge">${stats.personality.type}</div>
            
            <div class="summary-story">
              <p class="summary-story-text">${storyTagline}</p>
            </div>
            
            <div class="summary-highlights">
              <div class="summary-highlight">
                <div class="summary-highlight-value">${stats.conversations.toLocaleString()}</div>
                <div class="summary-highlight-label">conversations</div>
              </div>
              <div class="summary-highlight">
                <div class="summary-highlight-value">${stats.wordsTypedFormatted}</div>
                <div class="summary-highlight-label">words written</div>
              </div>
            </div>
            
            <div class="summary-details">
              <div class="summary-detail">
                <span class="summary-detail-icon">🔥</span>
                <span>${stats.longestStreak} day streak</span>
              </div>
              <div class="summary-detail">
                <span class="summary-detail-icon">📅</span>
                <span>${stats.activeDays} days active</span>
              </div>
              <div class="summary-detail">
                <span class="summary-detail-icon">⚡</span>
                <span>${stats.topModel} fan</span>
              </div>
            </div>
            
            ${journeyStart ? `<div class="summary-origin">${journeyStart}</div>` : ''}
          </div>
          
        </div>
      </div>
    `;
  },

  /**
   * Generate a fun story tagline based on usage patterns
   */
  getStoryTagline(stats) {
    const convos = stats.conversations;
    const streak = stats.longestStreak;
    const activePct = stats.activeDaysPct;
    const personality = stats.personality.type;
    
    // High volume users
    if (convos >= 1000) {
      return `I had ${convos.toLocaleString()} conversations with AI this year. Yes, we're basically best friends now.`;
    }
    
    // Dedicated streak users
    if (streak >= 30) {
      return `${streak} days straight of AI conversations. That's not a habit, that's a lifestyle.`;
    }
    
    // Very active users
    if (activePct >= 70) {
      return `I used ChatGPT ${activePct}% of the year. The other ${100 - activePct}%? Probably sleeping.`;
    }
    
    // Moderate users with good engagement
    if (convos >= 300) {
      return `${convos.toLocaleString()} conversations later, and I still have more questions than answers.`;
    }
    
    // Based on personality type
    if (personality.includes('Night')) {
      return `My best ideas come at ${stats.peakHour}. ${convos.toLocaleString()} late-night AI sessions and counting.`;
    }
    
    if (personality.includes('Power')) {
      return `${convos.toLocaleString()} conversations. ${stats.wordsTypedFormatted} words. One AI-powered year.`;
    }
    
    // Default fun tagline
    return `${convos.toLocaleString()} conversations with AI in ${stats.year}. Each one a little adventure.`;
  },

  /**
   * Generate contribution graph HTML
   */
  generateContribGraph(dailyActivity, year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date();
    
    // Adjust to end of year if we're past it
    if (endDate.getFullYear() > year) {
      endDate.setFullYear(year, 11, 31);
    }
    
    // Find max count for intensity scaling
    const counts = Object.values(dailyActivity);
    const maxCount = Math.max(...counts, 1);
    
    let html = '<div class="contrib-graph">';
    
    // Start from first Sunday before or on Jan 1
    const firstDay = new Date(startDate);
    while (firstDay.getDay() !== 0) {
      firstDay.setDate(firstDay.getDate() - 1);
    }
    
    // Generate weeks
    const currentDate = new Date(firstDay);
    while (currentDate <= endDate || currentDate.getDay() !== 0) {
      html += '<div class="contrib-week">';
      
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = dailyActivity[dateStr] || 0;
        const isInYear = currentDate.getFullYear() === year && currentDate <= endDate;
        
        let level = '';
        if (isInYear && count > 0) {
          const intensity = count / maxCount;
          if (intensity > 0.75) level = 'l4';
          else if (intensity > 0.5) level = 'l3';
          else if (intensity > 0.25) level = 'l2';
          else level = 'l1';
        }
        
        const className = isInYear ? `contrib-day ${level}` : 'contrib-day';
        html += `<div class="${className}"></div>`;
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      html += '</div>';
      
      // Stop if we've gone past the year
      if (currentDate.getFullYear() > year) break;
    }
    
    html += '</div>';
    return html;
  },

  /**
   * Get contextual tagline for peak time
   */
  getPeakTimeTagline(hour, day) {
    // Night owl (midnight to 5am)
    if (hour >= 0 && hour < 5) {
      return 'The night is when your best ideas come';
    }
    
    // Early bird (5am to 8am)
    if (hour >= 5 && hour < 8) {
      return 'Early bird gets the AI';
    }
    
    // Morning (8am to 12pm)
    if (hour >= 8 && hour < 12) {
      return 'Morning productivity, activated';
    }
    
    // Lunch (12pm to 2pm)
    if (hour >= 12 && hour < 14) {
      return 'Lunch break or thinking break?';
    }
    
    // Afternoon (2pm to 6pm)
    if (hour >= 14 && hour < 18) {
      return 'Afternoon focus mode';
    }
    
    // Evening (6pm to 9pm)
    if (hour >= 18 && hour < 21) {
      return 'Evening wind-down with AI';
    }
    
    // Late night (9pm to midnight)
    return 'Late night thinker';
  }
};
