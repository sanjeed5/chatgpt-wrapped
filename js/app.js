/**
 * ChatGPT Wrapped V3 - Story Logic
 */

const App = {
  currentSlideIndex: 0,
  slides: [],
  progressBars: [],
  timer: null,
  isPaused: false,
  isDemo: false,
  slideDuration: 5000, // 5 seconds per slide
  stats: null,

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.updateProgressUI();
    this.goToSlide(0);
  },

  cacheDOM() {
    this.dom = {
      app: document.getElementById('app'),
      progressContainer: document.getElementById('progress-container'),
      dynamicSlidesContainer: document.getElementById('dynamic-slides'),
      tapLeft: document.getElementById('tap-left'),
      tapRight: document.getElementById('tap-right'),
      fileInput: document.getElementById('file-input'),
      btnSelect: document.getElementById('btn-select'),
      btnDemo: document.getElementById('btn-demo'),
      dropZone: document.getElementById('drop-zone'),
      errorSlide: document.getElementById('slide-error'),
      errorMessage: document.getElementById('error-message'),
      btnErrorBack: document.getElementById('btn-error-back'),
    };
  },

  bindEvents() {
    // Navigation
    this.dom.tapLeft.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling issues
      this.prevSlide();
    });
    
    this.dom.tapRight.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextSlide();
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });

    // Hold to pause (Desktop/Mobile)
    const pauseEvents = ['mousedown', 'touchstart'];
    const resumeEvents = ['mouseup', 'touchend', 'mouseleave'];

    pauseEvents.forEach(evt => {
      this.dom.app.addEventListener(evt, () => this.pause());
    });

    resumeEvents.forEach(evt => {
      this.dom.app.addEventListener(evt, () => this.resume());
    });

    // File Handling
    this.dom.btnSelect.addEventListener('click', () => this.dom.fileInput.click());
    this.dom.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFile(file);
    });

    // Demo
    this.dom.btnDemo.addEventListener('click', () => this.loadDemo());

    // Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dom.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    this.dom.dropZone.addEventListener('dragover', () => this.dom.dropZone.classList.add('drag-over'));
    this.dom.dropZone.addEventListener('dragleave', () => this.dom.dropZone.classList.remove('drag-over'));
    this.dom.dropZone.addEventListener('drop', (e) => {
      this.dom.dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) this.handleFile(file);
    });
    
    // Delegate events for dynamic buttons
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-action') {
        if (this.isDemo) {
          window.location.reload();
        } else {
          this.downloadSummary();
        }
      } else if (e.target.id === 'btn-error-back') {
        this.goToSlide(0);
      }
    });
  },

  // --- LOGIC FLOW ---

  async handleFile(file) {
    this.isDemo = false;
    this.goToSlide(1); // Loading slide
    try {
      const conversations = await Parser.parse(file, () => {});
      this.processData(conversations);
    } catch (err) {
      this.showError(err.message);
    }
  },

  async loadDemo() {
    this.isDemo = true;
    this.goToSlide(1); // Loading
    setTimeout(() => {
      try {
        const conversations = DemoData.generate();
        this.processData(conversations);
      } catch (e) {
        this.showError('Demo failed: ' + e.message);
      }
    }, 1000);
  },

  processData(conversations) {
    try {
      this.stats = Stats.compute(conversations, 2025);
      this.generateSlides(this.stats);
      
      // Update slides array with new dynamic slides
      this.slides = Array.from(document.querySelectorAll('.slide'));
      this.updateProgressUI();
      
      // Start the show
      this.goToSlide(3); // First data slide (after upload=0, loading=1, error=2)
    } catch (err) {
      this.showError('Error processing stats: ' + err.message);
    }
  },

  generateSlides(stats) {
    const container = this.dom.dynamicSlidesContainer;
    container.innerHTML = ''; // Clear

    // Helper to fill template
    const createSlide = (tplId, dataFn) => {
      const tpl = document.getElementById(tplId);
      const clone = tpl.content.cloneNode(true);
      const slide = clone.querySelector('.slide');
      
      // Fill data
      const hooks = slide.querySelectorAll('[data-hook]');
      hooks.forEach(el => {
        const key = el.dataset.hook;
        if (dataFn[key]) el.textContent = dataFn[key];
      });

      container.appendChild(slide);
      return slide;
    };

    // NEW FLOW - Streamlined and Impactful
    
    // 1. Journey (When it all began)
    if (stats.allTime && stats.allTime.firstDate) {
      createSlide('tpl-slide-journey', {
        'first-date-short': stats.allTime.firstDateShort,
        'first-year': stats.allTime.firstYear,
        'days-since': `${stats.allTime.daysSinceFirst} days ago`,
        'first-title': stats.allTime.firstConvoTitle
      });
    }
    
    // 2. Intro (2025 overview)
    createSlide('tpl-slide-intro', {
      'total-convos': stats.conversations,
      'active-days': stats.activeDays
    });

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
      
      createSlide('tpl-slide-growth', {
        'growth-multiple': growthMultiple,
        'this-year': stats.conversations,
        'last-year': stats.previousYearConversations,
        'growth-message': message
      });
    }

    // 4. Biggest Month
    if (stats.biggestMonth) {
      createSlide('tpl-slide-biggest-month', {
        'biggest-month': stats.biggestMonth.month,
        'month-count': stats.biggestMonth.count
      });
    }

    // 5. Longest Streak
    if (stats.longestStreak > 0) {
      createSlide('tpl-slide-streak', {
        'streak-days': stats.longestStreak
      });
    }

    // 6. Peak Time (with real chart data)
    const peakSlide = createSlide('tpl-slide-peak', {
      'peak-day': stats.peakDay,
      'peak-time': stats.peakHour
    });
    
    // Populate day chart with real data
    if (stats.peakDayDistribution) {
      const chartContainer = peakSlide.querySelector('[data-hook="day-chart"]');
      const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
      const counts = days.map(day => stats.peakDayDistribution[day] || 0);
      const maxCount = Math.max(...counts, 1);
      
      days.forEach((day, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        if (day === stats.peakDay) bar.classList.add('active');
        const height = Math.max((counts[idx] / maxCount) * 100, 5); // Min 5% for visibility
        bar.style.height = `${height}%`;
        chartContainer.appendChild(bar);
      });
    }

    // 7. Persona
    const personaData = {
      'persona-type': stats.personality.type,
      'persona-desc': stats.personality.description,
      'top-model': stats.topModel
    };
    
    if (stats.personality.emoji) {
      personaData['persona-emoji'] = stats.personality.emoji;
    }
    
    createSlide('tpl-slide-persona', personaData);

    // 8. Words
    const wordsSlide = document.getElementById('tpl-slide-words').content.cloneNode(true);
    const slide = wordsSlide.querySelector('.slide');
    
    slide.querySelector('[data-hook="words-user"]').textContent = stats.wordsTypedFormatted;
    
    const booksWritten = stats.booksWritten || stats.novelsEquivalent;
    const comparisonEl = slide.querySelector('[data-hook="books-comparison"]');
    
    if (booksWritten > 0) {
      slide.querySelector('[data-hook="books-written"]').textContent = booksWritten;
    } else {
      comparisonEl.textContent = 'Every word counts. ';
      const highlight = document.createElement('span');
      highlight.className = 'highlight';
      highlight.textContent = 'You\'re building something.';
      comparisonEl.appendChild(highlight);
    }
    
    container.appendChild(slide);

    // 9. Roast
    createSlide('tpl-slide-roast', {
      'roast-text': stats.roast
    });

    // 10. Summary
    const summaryPersona = stats.personality.archetype || stats.personality.type;
    createSlide('tpl-slide-summary', {
      'total-convos': stats.conversations,
      'active-days': stats.activeDays,
      'total-hours': stats.totalHours,
      'words-short': stats.wordsTypedFormatted,
      'persona-type': summaryPersona
    });

    // Configure action button
    const summarySlide = container.lastElementChild;
    const actionBtn = summarySlide.querySelector('#btn-action');
    if (actionBtn) {
      actionBtn.textContent = this.isDemo ? 'Try with your data' : 'Save Image';
    }
  },

  // --- NAVIGATION & ANIMATION ---

  updateProgressUI() {
    const container = this.dom.progressContainer;
    container.innerHTML = '';
    
    // Only show progress for data slides (index >= 3)
    // Hide bars for upload (0), loading (1), and error (2) slides
    
    this.slides.forEach((_, idx) => {
      const bar = document.createElement('div');
      bar.className = 'progress-bar';
      
      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      bar.appendChild(fill);
      
      container.appendChild(bar);
      
      // Hide bars for upload/loading/error screens
      if (idx < 3) bar.style.display = 'none';
    });

    this.progressBars = Array.from(document.querySelectorAll('.progress-bar'));
  },

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    // Reset previous slide
    const prev = this.slides[this.currentSlideIndex];
    if (prev) prev.classList.remove('active');

    // Activate new slide
    this.currentSlideIndex = index;
    const curr = this.slides[this.currentSlideIndex];
    curr.classList.add('active');

    // Toggle Tap Zones
    // Active for story slides (index >= 3, after error slide) BUT NOT the last slide (summary), 
    // because the last slide has interactive buttons.
    // Error slide (index 2) should not have tap zones
    const isStoryMode = index >= 3 && index < this.slides.length - 1;
    this.dom.tapLeft.style.display = isStoryMode ? 'block' : 'none';
    this.dom.tapRight.style.display = isStoryMode ? 'block' : 'none';

    // Update Bars
    this.progressBars.forEach((bar, idx) => {
      const fill = bar.querySelector('.progress-fill');
      fill.style.width = idx < index ? '100%' : '0%';
      fill.style.transition = 'none'; // Instant update
    });

    // Start Timer for this slide (if it's a data slide)
    // Don't auto-advance error slide (index 2) or summary slide
    this.resetTimer();
    if (index >= 3 && index < this.slides.length - 1) { // Don't auto-advance error or summary
      this.startSlideTimer();
    }
  },

  nextSlide() {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.goToSlide(this.currentSlideIndex + 1);
    } else {
      // End of story
    }
  },

  prevSlide() {
    if (this.currentSlideIndex > 3) { // Allow going back through story slides
      this.goToSlide(this.currentSlideIndex - 1);
    } else if (this.currentSlideIndex === 3) {
      // From first data slide, go back to upload (skip error slide)
      this.goToSlide(0);
    } else if (this.currentSlideIndex === 2) {
      // From error slide, go back to upload
      this.goToSlide(0);
    }
  },

  startSlideTimer() {
    this.resetTimer();
    
    const bar = this.progressBars[this.currentSlideIndex];
    if (!bar) return;
    
    const fill = bar.querySelector('.progress-fill');
    
    // Force reflow
    void fill.offsetWidth;
    
    fill.style.transition = `width ${this.slideDuration}ms linear`;
    fill.style.width = '100%';

    this.timer = setTimeout(() => {
      this.nextSlide();
    }, this.slideDuration);
  },

  resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    // Stop current bar animation
    const bar = this.progressBars[this.currentSlideIndex];
    if (bar) {
      const fill = bar.querySelector('.progress-fill');
      const currentWidth = fill.style.width; // keep current? no, reset handled by goToSlide
      fill.style.transition = 'none';
    }
  },

  pause() {
    this.isPaused = true;
    if (this.timer) clearTimeout(this.timer);
    
    // Freeze animation
    const bar = this.progressBars[this.currentSlideIndex];
    if (bar) {
      const fill = bar.querySelector('.progress-fill');
      const computedStyle = window.getComputedStyle(fill);
      const width = computedStyle.getPropertyValue('width');
      fill.style.transition = 'none';
      fill.style.width = width;
    }
  },

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    
    // We strictly restart the slide for simplicity in V3
    // A perfect resume is complex; restarting the slide timer is acceptable UX
    // But let's just not auto-advance if they paused near the end?
    // Let's just hold current state.
    
    // Actually, for simplicity: simple pause logic is hard without requestAnimationFrame.
    // Let's just NOT auto-advance if holding.
    // User has to tap to continue if they held it? 
    // Or we just restart the timer for the *remaining* time?
    // Let's restart full timer for now to ensure they have time to read.
    if (this.currentSlideIndex >= 2 && this.currentSlideIndex < this.slides.length - 1) {
       // this.startSlideTimer(); // This restarts the whole bar, slightly janky but works.
    }
  },

  showError(message) {
    if (this.dom.errorMessage) {
      this.dom.errorMessage.textContent = message;
    }
    this.goToSlide(2); // Error slide (index 2: upload=0, loading=1, error=2)
  },

  downloadSummary() {
    const card = document.getElementById('summary-card');
    html2canvas(card, { backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'chatgpt-wrapped-2025.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
