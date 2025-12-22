/**
 * Slide Generator Module
 * Handles the creation and population of dynamic slides.
 */

const SlideGenerator = {
  generate(stats, container) {
    container.innerHTML = ''; // Clear
    const toDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const parseDateKey = (key) => {
      if (!key) return null;
      const parts = key.split('-').map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0';
      return value.toLocaleString('en-US');
    };

    const formatShortDate = (date) => {
      if (!(date instanceof Date)) return '';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    const monthName = (idx) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[idx] || '';
    };

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
    
    // 2. Intro (year overview)
    let introDesc = "ChatGPT became part of your routine.";
    if (stats.userMessages < 100) introDesc = "A few curious check-ins.";
    else if (stats.userMessages < 500) introDesc = "You stopped by when you needed a nudge.";
    else if (stats.activeDays >= 250) introDesc = "Practically every day.";
    else if (stats.userMessages >= 5000) introDesc = "This was a full-on collaboration.";
    else if (stats.userMessages >= 3000) introDesc = "This became your go-to sidekick.";
    else if (stats.activeDays >= 150) introDesc = "A steady weekly rhythm.";
    else if (stats.userMessages >= 1000) introDesc = "Plenty of conversations together.";

    const introSub = `In ${stats.year}, you sent ${formatNumber(stats.userMessages)} messages across ${formatNumber(stats.activeDays)} days.`;

    const introSlide = createSlide('tpl-slide-intro', {
      year: stats.year,
      'total-convos': formatNumber(stats.userMessages),
      'active-days': formatNumber(stats.activeDays),
      'intro-desc': introDesc,
      'intro-sub': introSub
    });
    
    if (introSlide) {
        const introStatHuge = introSlide.querySelector('.stat-huge');
        if (introStatHuge) introStatHuge.setAttribute('data-animate', 'true');
        if (!introSub) {
          const subEl = introSlide.querySelector('[data-hook="intro-sub"]');
          if (subEl) subEl.style.display = 'none';
        }
    }

    // 3. YoY Growth
    if (stats.yoyMessageGrowth && stats.previousYearUserMessages > 0) {
      const growthMultiple = stats.yoyMessageGrowth >= 1 
        ? `${stats.yoyMessageGrowth.toFixed(1)}x`
        : `${Math.round(stats.yoyMessageGrowth * 100)}%`;
      
      let message = "Steady compared to last year.";
      if (stats.yoyMessageGrowth >= 3) message = "Huge jump from last year.";
      else if (stats.yoyMessageGrowth >= 2) message = "You leaned on it a lot more.";
      else if (stats.yoyMessageGrowth >= 1.5) message = "You reached for it more often.";
      else if (stats.yoyMessageGrowth < 1) message = 'A lighter year—still showed up.';
      
      const growthLabel = stats.yoyMessageGrowth >= 1 ? "more messages than last year" : "of last year's messages";

      const growthSlide = createSlide('tpl-slide-growth', {
        'growth-multiple': growthMultiple,
        'growth-label': growthLabel,
        'this-year': formatNumber(stats.userMessages),
        'last-year': formatNumber(stats.previousYearUserMessages),
        'current-year-label': stats.year,
        'previous-year-label': stats.year - 1,
        'growth-message': message
      });

      if (growthSlide) {
          const graphContainer = growthSlide.querySelector('.growth-graph-container');
          if (graphContainer) {
            const y1 = stats.previousYearUserMessages;
            const y2 = stats.userMessages;
            const max = Math.max(y1, y2);
            const h1 = max > 0 ? (y1 / max) * 100 : 0;
            const h2 = max > 0 ? (y2 / max) * 100 : 0;
            const previousYear = stats.year - 1;
            const currentYear = stats.year;
            
            graphContainer.innerHTML = `
              <div class="growth-bar-wrapper">
                <div class="growth-bar previous" style="height: ${h1}%"></div>
                <span class="growth-bar-label">${previousYear}</span>
              </div>
              <div class="growth-bar-wrapper">
                <div class="growth-bar current" style="height: ${h2}%"></div>
                <span class="growth-bar-label">${currentYear}</span>
              </div>
            `;
            
            const boxPrevious = growthSlide.querySelector('.growth-box-previous');
            const boxCurrent = growthSlide.querySelector('.growth-box-current');
            if (boxPrevious) { boxPrevious.style.opacity = '0'; boxPrevious.style.animation = 'fade-in 0.5s ease-out 0.5s forwards'; } 
            if (boxCurrent) { boxCurrent.style.opacity = '0'; boxCurrent.style.animation = 'fade-in 0.5s ease-out 1.5s forwards'; }
          }
      }
    }

    // 4. Biggest Month
    if (stats.biggestMonth) {
      let monthDesc = "That month was your hot streak.";
      if (stats.biggestMonth.count < 5) monthDesc = "Quality time.";
      else if (stats.biggestMonth.count < 20) monthDesc = "A productive month.";
      else if (stats.biggestMonth.count > 100) monthDesc = "A ridiculous amount of chats.";

      createSlide('tpl-slide-biggest-month', {
        'biggest-month': stats.biggestMonth.month,
        'month-count': formatNumber(stats.biggestMonth.count),
        'month-desc': monthDesc
      });
    }

    // 5. Longest Streak
    if (stats.longestStreak > 0) {
      const streakSlide = createSlide('tpl-slide-streak', {
        'streak-days': formatNumber(stats.longestStreak),
        'streak-label': stats.longestStreak === 1 ? 'day' : 'days straight'
      });

      if (streakSlide) {
          const heatmapContainer = streakSlide.querySelector('.streak-heatmap-container');
          const heatmapLabel = streakSlide.querySelector('[data-hook="heatmap-range"]');

          if (heatmapContainer && stats.dailyActivityAllTime) {
            // Split year into two halves: Jan-Jun and Jul-Dec
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get streak range for highlighting
            const streakStartKey = stats.longestStreakRange?.startKey;
            const streakEndKey = stats.longestStreakRange?.endKey;
            const isInStreak = (dateKey) => {
              if (!streakStartKey || !streakEndKey) return false;
              return dateKey >= streakStartKey && dateKey <= streakEndKey;
            };

            // Calculate max count for consistent coloring
            let maxCount = 0;
            Object.entries(stats.dailyActivityAllTime).forEach(([key, count]) => {
              if (key.startsWith(String(stats.year))) maxCount = Math.max(maxCount, count);
            });

            // Clear container and build two halves
            heatmapContainer.innerHTML = '';

            const halves = [
              { startMonth: 0, endMonth: 5, label: 'Jan–Jun' },
              { startMonth: 6, endMonth: 11, label: 'Jul–Dec' }
            ];

            halves.forEach(({ startMonth, endMonth }) => {
              const halfStart = new Date(stats.year, startMonth, 1);
              const halfEnd = new Date(stats.year, endMonth + 1, 0); // Last day of end month
              
              // Snap to week boundaries
              const startDate = new Date(halfStart);
              startDate.setDate(halfStart.getDate() - halfStart.getDay());
              const endDate = new Date(halfEnd);
              endDate.setDate(halfEnd.getDate() + (6 - halfEnd.getDay()));

              const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
              const weeksCount = Math.ceil(totalDays / 7);

              // Create half container
              const halfDiv = document.createElement('div');
              halfDiv.className = 'heatmap-half';

              // Month labels
              const monthsDiv = document.createElement('div');
              monthsDiv.className = 'heatmap-half-months';
              monthsDiv.style.gridTemplateColumns = `repeat(${weeksCount}, 1fr)`;
              
              let lastMonth = -1;
              for (let w = 0; w < weeksCount; w++) {
                const weekStart = new Date(startDate);
                weekStart.setDate(startDate.getDate() + w * 7);
                const month = weekStart.getMonth();
                if (month >= startMonth && month <= endMonth && month !== lastMonth) {
                  const label = document.createElement('span');
                  label.textContent = monthName(month);
                  label.style.gridColumn = `${w + 1}`;
                  monthsDiv.appendChild(label);
                  lastMonth = month;
                }
              }
              halfDiv.appendChild(monthsDiv);

              // Grid
              const gridDiv = document.createElement('div');
              gridDiv.className = 'heatmap-half-grid';
              gridDiv.style.gridTemplateColumns = `repeat(${weeksCount}, 1fr)`;

              for (let w = 0; w < weeksCount; w++) {
                for (let d = 0; d < 7; d++) {
                  const current = new Date(startDate);
                  current.setDate(startDate.getDate() + w * 7 + d);
                  const dateKey = toDateKey(current);
                  const count = stats.dailyActivityAllTime[dateKey] || 0;
                  const isFuture = current > today;
                  const isOutsideHalf = current < halfStart || current > halfEnd;
                  const inStreak = isInStreak(dateKey);

                  const cell = document.createElement('div');
                  cell.className = 'heatmap-cell';
                  cell.style.gridColumn = `${w + 1}`;
                  cell.style.gridRow = `${d + 1}`;

                  if (isOutsideHalf) {
                    cell.classList.add('outside-year');
                  } else if (isFuture) {
                    cell.classList.add('future');
                  } else if (count > 0) {
                    const intensity = maxCount > 0 ? Math.ceil((count / maxCount) * 4) : 1;
                    cell.classList.add(`level-${Math.min(intensity, 4)}`);
                    if (inStreak) {
                      cell.classList.add('streak');
                    }
                    cell.title = `${monthName(current.getMonth())} ${current.getDate()} · ${count}${inStreak ? ' (streak)' : ''}`;
                  }

                  gridDiv.appendChild(cell);
                }
              }
              halfDiv.appendChild(gridDiv);
              heatmapContainer.appendChild(halfDiv);
            });

            if (heatmapLabel) heatmapLabel.style.display = 'none';
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
          const dayAbbrevs = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
          const counts = days.map(day => stats.peakDayDistribution[day] || 0);
          const maxCount = Math.max(...counts);
          
          days.forEach((day, idx) => {
            const barWrapper = document.createElement('div');
            barWrapper.className = 'bar-wrapper';
            
            const bar = document.createElement('div');
            bar.className = 'bar';
            if (day === stats.peakDay) bar.classList.add('active');
            const height = maxCount > 0 ? (counts[idx] / maxCount) * 100 : 0;
            bar.style.height = `${height}%`;
            bar.title = `${day}: ${counts[idx]} conversations`;
            
            const label = document.createElement('span');
            label.className = 'bar-day-label';
            label.textContent = dayAbbrevs[idx];
            
            barWrapper.appendChild(bar);
            barWrapper.appendChild(label);
            chartContainer.appendChild(barWrapper);
          });
      }
    }

    // 7. Model
    if (stats.topModels && stats.topModels.length > 0) {
      const tpl = document.getElementById('tpl-slide-model');
      if (tpl) {
        const clone = tpl.content.cloneNode(true);
        const slide = clone.querySelector('.slide');
        const modelList = slide.querySelector('[data-hook="model-list"]');
        
        if (modelList) {
          stats.topModels.forEach((modelData, idx) => {
            const modelItem = document.createElement('div');
            modelItem.className = 'model-item';
            if (idx === 0) modelItem.classList.add('primary');
            
            const modelName = document.createElement('div');
            modelName.className = 'model-name';
            modelName.textContent = modelData.model;
            
            const modelCount = document.createElement('div');
            modelCount.className = 'model-count';
            modelCount.textContent = `${modelData.count} message${modelData.count === 1 ? '' : 's'}`;
            
            modelItem.appendChild(modelName);
            modelItem.appendChild(modelCount);
            modelList.appendChild(modelItem);
          });
        }
        
        container.appendChild(slide);
      }
    }

    // 8. Politeness
    if (stats.politeness && stats.politeness.userMessageCount > 0) {
      const { description } = stats.politeness;
      const politeDesc = description || 'Kindness noticed.';

      createSlide('tpl-slide-politeness', {
        'polite-desc': politeDesc
      });
    }

    // 8. Persona
    const personaTitle = (stats.personality.type || '').replace(/^[^\w]+\s*/, '').trim();

    const personaData = {
      'persona-type': personaTitle || stats.personality.archetype,
      'persona-desc': stats.personality.description,
      'persona-reason': stats.personality.reason || ''
    };
    
    if (stats.personality.emoji) {
      personaData['persona-emoji'] = stats.personality.emoji;
    }
    
    const personaSlide = createSlide('tpl-slide-persona', personaData);
    
    if (personaSlide) {
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
        
        const wordsTypedRaw = stats.wordsTyped;
        const booksWritten = stats.booksWritten || stats.novelsEquivalent;
        const comparisonEl = slide.querySelector('[data-hook="books-comparison"]');
        const writtenEl = slide.querySelector('[data-hook="books-written"]');
        
        if (booksWritten >= 5) {
          if (writtenEl) writtenEl.textContent = booksWritten;
        } else if (booksWritten >= 1) {
          if (writtenEl) writtenEl.textContent = booksWritten;
          if (comparisonEl) comparisonEl.innerHTML = `That's <span class="highlight">${booksWritten}</span> book${booksWritten === 1 ? '' : 's'} worth.`;
        } else if (comparisonEl) {
          const essays = Math.max(1, Math.floor(wordsTypedRaw / 500));
          if (essays >= 1 && wordsTypedRaw >= 1000) {
            comparisonEl.innerHTML = `That's <span class="highlight">${essays}</span> essays worth.`;
          } else {
            const tweets = Math.max(1, Math.floor(wordsTypedRaw / 40));
            comparisonEl.innerHTML = `That's about <span class="highlight">${tweets}</span> tweets worth.`;
          }
        }
        container.appendChild(slide);
    }

    // 10. Summary
    // Use same persona derivation as persona slide for consistency
    const summaryPersonaTitle = (stats.personality.type || '').replace(/^[^\w]+\s*/, '').trim();
    const summaryPersona = summaryPersonaTitle || stats.personality.archetype || 'Explorer';
    const mannersCount = stats.politeness?.count || 0;
    const mannersIcon = stats.politeness?.icon || '😇';
    const summarySlide = createSlide('tpl-slide-summary', {
      year: stats.year,
      'total-convos': formatNumber(stats.userMessages),
      'active-days': formatNumber(stats.activeDays),
      'words-short': stats.wordsTypedFormatted,
      'streak-days': formatNumber(stats.longestStreak || 0),
      'persona-type': summaryPersona,
      'manners-count': formatNumber(mannersCount),
      'manners-icon': mannersIcon
    });

    return { summarySlide }; // Return for app to hook events if needed
  }
};
