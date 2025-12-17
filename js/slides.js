/**
 * Slide Generator Module
 * Handles the creation and population of dynamic slides.
 */

const SlideGenerator = {
  generate(stats, container) {
    container.innerHTML = ''; // Clear

    // Helper to fill template
    const createSlide = (tplId, dataFn) => {
      const tpl = document.getElementById(tplId);
      if (!tpl) return null;
      const clone = tpl.content.cloneNode(true);
      const slide = clone.querySelector('.slide');
      
      // Fill data
      const hooks = slide.querySelectorAll('[data-hook]');
      hooks.forEach(el => {
        const key = el.dataset.hook;
        if (dataFn[key] !== undefined) el.textContent = dataFn[key];
      });

      container.appendChild(slide);
      return slide;
    };

    // 1. Journey (When it all began)
    if (stats.allTime && stats.allTime.firstDate) {
      const firstDateFull = stats.allTime.firstDate; // "January 2, 2023"
      let daysSinceText = `${stats.allTime.daysSinceFirst} days ago`;
      if (stats.allTime.daysSinceFirst === 0) daysSinceText = 'Today';
      else if (stats.allTime.daysSinceFirst === 1) daysSinceText = 'Yesterday';

      createSlide('tpl-slide-journey', {
        'first-date-full': firstDateFull,
        'days-since': daysSinceText,
        'first-title': stats.allTime.firstConvoTitle
      });
    }
    
    // 2. Intro (2025 overview)
    let introDesc = "You really went for it.";
    if (stats.conversations < 10) introDesc = "Short and sweet.";
    else if (stats.conversations < 50) introDesc = "Just getting started.";
    else if (stats.conversations > 500) introDesc = "A serious commitment.";

    const introSlide = createSlide('tpl-slide-intro', {
      'total-convos': stats.conversations,
      'active-days': stats.activeDays,
      'total-hours': stats.totalHours,
      'intro-desc': introDesc
    });
    
    if (introSlide) {
        const introStatHuge = introSlide.querySelector('.stat-huge');
        if (introStatHuge) introStatHuge.setAttribute('data-animate', 'true');
    }

    // 3. YoY Growth
    if (stats.yoyGrowth && stats.previousYearConversations > 0) {
      const growthMultiple = stats.yoyGrowth >= 1 
        ? `${stats.yoyGrowth.toFixed(1)}x`
        : `${Math.round(stats.yoyGrowth * 100)}%`;
      
      let message = "You're locked in.";
      if (stats.yoyGrowth >= 3) message = "That's exponential growth.";
      else if (stats.yoyGrowth >= 2) message = "You're all in.";
      else if (stats.yoyGrowth >= 1.5) message = "You're hooked.";
      else if (stats.yoyGrowth < 1) message = 'Quality over quantity.';
      
      const growthLabel = stats.yoyGrowth >= 1 ? "more than last year" : "of last year's volume";

      const growthSlide = createSlide('tpl-slide-growth', {
        'growth-multiple': growthMultiple,
        'growth-label': growthLabel,
        'this-year': stats.conversations,
        'last-year': stats.previousYearConversations,
        'growth-message': message
      });

      if (growthSlide) {
          const graphContainer = growthSlide.querySelector('.growth-graph-container');
          if (graphContainer) {
            const y1 = stats.previousYearConversations;
            const y2 = stats.conversations;
            const max = Math.max(y1, y2);
            
            const h1 = Math.max((y1 / max) * 100, 10);
            const h2 = Math.max((y2 / max) * 100, 10);
            
            graphContainer.innerHTML = `
              <div class="growth-bar-wrapper">
                <div class="growth-bar bar-2024" style="height: ${h1}%"></div>
                <span class="growth-bar-label">2024</span>
              </div>
              <div class="growth-bar-wrapper">
                <div class="growth-bar bar-2025" style="height: ${h2}%"></div>
                <span class="growth-bar-label">2025</span>
              </div>
            `;
            
            const box2024 = growthSlide.querySelector('.growth-box-2024');
            const box2025 = growthSlide.querySelector('.growth-box-2025');
            if (box2024) { box2024.style.opacity = '0'; box2024.style.animation = 'fade-in 0.5s ease-out 0.5s forwards'; } 
            if (box2025) { box2025.style.opacity = '0'; box2025.style.animation = 'fade-in 0.5s ease-out 1.5s forwards'; }
          }
      }
    }

    // 4. Biggest Month
    if (stats.biggestMonth) {
      let monthDesc = "You were on fire 🔥";
      if (stats.biggestMonth.count < 5) monthDesc = "Quality time.";
      else if (stats.biggestMonth.count < 20) monthDesc = "A productive month.";
      else if (stats.biggestMonth.count > 100) monthDesc = "Absolute unit of a month.";

      createSlide('tpl-slide-biggest-month', {
        'biggest-month': stats.biggestMonth.month,
        'month-count': stats.biggestMonth.count,
        'month-desc': monthDesc
      });
    }

    // 5. Longest Streak
    if (stats.longestStreak > 0) {
      const streakSlide = createSlide('tpl-slide-streak', {
        'streak-days': stats.longestStreak,
        'streak-label': stats.longestStreak === 1 ? 'day' : 'days straight'
      });

      if (streakSlide) {
          const heatmapContainer = streakSlide.querySelector('.streak-heatmap-container');
          const heatmapLabel = streakSlide.querySelector('.heatmap-label');

          if (heatmapContainer && stats.dailyActivity) {
            const today = new Date();
            const startOfPeriod = new Date();
            startOfPeriod.setDate(today.getDate() - 111);
            
            if (heatmapLabel) {
               const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
               const displayedMonths = new Set();
               const labels = [];
               
               [0, 30, 60, 90, 111].forEach(offset => {
                 const d = new Date(startOfPeriod);
                 d.setDate(startOfPeriod.getDate() + offset);
                 const m = months[d.getMonth()];
                 if (!displayedMonths.has(m)) {
                   displayedMonths.add(m);
                   labels.push(m);
                 }
               });
               
               heatmapLabel.textContent = labels.join(' · ');
            }

            for (let i = 0; i < 112; i++) {
              const d = new Date();
              d.setDate(today.getDate() - (111 - i));
              const dateKey = d.toISOString().split('T')[0];
              
              const cell = document.createElement('div');
              cell.className = 'heatmap-cell';
              if (stats.dailyActivity[dateKey]) {
                cell.classList.add('active');
                cell.title = dateKey;
                cell.style.animation = `fade-in 0.5s ease-out ${Math.random()}s backwards`;
              }
              heatmapContainer.appendChild(cell);
            }
          }
      }
    }

    // 6. Peak Time
    const peakSlide = createSlide('tpl-slide-peak', {
      'peak-day': stats.peakDay,
      'peak-time': stats.peakHour
    });
    
    if (peakSlide && stats.peakDayDistribution) {
      const chartContainer = peakSlide.querySelector('[data-hook="day-chart"]');
      if (chartContainer) {
          chartContainer.setAttribute('role', 'img');
          chartContainer.setAttribute('aria-label', `Bar chart showing weekly activity. Most active on ${stats.peakDay}.`);
          
          const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
          const counts = days.map(day => stats.peakDayDistribution[day] || 0);
          const maxCount = Math.max(...counts, 1);
          
          days.forEach((day, idx) => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            if (day === stats.peakDay) bar.classList.add('active');
            const height = Math.max((counts[idx] / maxCount) * 100, 5); 
            bar.style.height = `${height}%`;
            bar.title = `${day}: ${counts[idx]} conversations`;
            chartContainer.appendChild(bar);
          });
      }
    }

    // 7. Model
    if (stats.topModel) {
      createSlide('tpl-slide-model', {
        'top-model': stats.topModel
      });
    }

    // 8. Persona
    const personaData = {
      'persona-type': stats.personality.type,
      'persona-desc': stats.personality.description,
      'top-model': stats.topModel
    };
    
    if (stats.personality.emoji) {
      personaData['persona-emoji'] = stats.personality.emoji;
    }
    
    const personaSlide = createSlide('tpl-slide-persona', personaData);
    
    if (personaSlide) {
        const descriptionEl = personaSlide.querySelector('.persona-text');
        if (descriptionEl && stats.personality.reason) {
           const sub = document.createElement('div');
           sub.className = 'persona-reason';
           sub.textContent = stats.personality.reason;
           descriptionEl.parentNode.insertBefore(sub, descriptionEl.nextSibling);
        }
        
        // Hide model badge if missing (though removed from template, safe to keep check)
        if (!stats.topModel) {
          const badge = personaSlide.querySelector('.badge-model');
          if (badge) badge.style.display = 'none';
        }

        const emojiEl = personaSlide.querySelector('.persona-icon');
        if (emojiEl) {
          emojiEl.setAttribute('role', 'img');
          emojiEl.setAttribute('aria-label', stats.personality.type);
        }
    }

    // 9. Words
    // Special handling for Words slide template clone
    const tplWords = document.getElementById('tpl-slide-words');
    if (tplWords) {
        const clone = tplWords.content.cloneNode(true);
        const slide = clone.querySelector('.slide');
        
        slide.querySelector('[data-hook="words-user"]').textContent = stats.wordsTypedFormatted;
        
        const booksWritten = stats.booksWritten || stats.novelsEquivalent;
        const comparisonEl = slide.querySelector('[data-hook="books-comparison"]');
        const writtenEl = slide.querySelector('[data-hook="books-written"]');
        
        if (booksWritten > 0) {
          if (writtenEl) writtenEl.textContent = booksWritten;
        } else {
          const essays = Math.floor(stats.wordsTyped / 500);
          if (essays > 0) {
            comparisonEl.innerHTML = `That's <span class="highlight">${essays}</span> essays worth.`;
          } else {
             comparisonEl.textContent = 'Every word counts. ';
             const highlight = document.createElement('span');
             highlight.className = 'highlight';
             highlight.textContent = 'You\'re building something.';
             comparisonEl.appendChild(highlight);
          }
        }
        container.appendChild(slide);
    }

    // 10. Roast
    const roastSlide = createSlide('tpl-slide-roast', {
      'roast-text': stats.roast.text
    });
    
    if (roastSlide) {
        const roastTitle = roastSlide.querySelector('.roast-text');
        if (roastTitle && stats.roast.reason) {
          const sub = document.createElement('p');
          sub.className = 'roast-reason';
          sub.textContent = `(${stats.roast.reason})`;
          roastTitle.parentNode.appendChild(sub);
        }
    }

    // 11. Summary
    const summaryPersona = stats.personality.archetype || stats.personality.type;
    const summarySlide = createSlide('tpl-slide-summary', {
      'total-convos': stats.conversations,
      'active-days': stats.activeDays,
      'total-hours': stats.totalHours,
      'words-short': stats.wordsTypedFormatted,
      'persona-type': summaryPersona
    });

    return { summarySlide }; // Return for app to hook events if needed
  }
};
