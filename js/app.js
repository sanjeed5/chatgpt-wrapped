/**
 * ChatGPT Wrapped V3 - Story Logic
 */

// Analytics helper - tracks events to both Umami and GoatCounter
const Analytics = {
  track(eventName, data = {}) {
    // Umami
    if (typeof umami !== 'undefined') {
      umami.track(eventName, data);
    }
    // GoatCounter
    if (typeof goatcounter !== 'undefined' && goatcounter.count) {
      goatcounter.count({
        path: `event/${eventName}`,
        event: true,
      });
    }
  }
};

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
    this.updateViewportHeight();
    window.addEventListener('resize', () => this.updateViewportHeight());
    window.addEventListener('orientationchange', () => this.updateViewportHeight());
    this.cacheDOM();
    this.bindEvents();
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.updateProgressUI();
    this.goToSlide(0);
  },

  updateViewportHeight() {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
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
    this.dom.btnDemo.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadDemo();
    });

    // Drag & Drop
    this.dom.dropZone.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      this.dom.fileInput.click();
    });
    this.dom.dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        this.dom.fileInput.click();
      }
    });
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
      if (e.target.id === 'btn-download') {
        this.downloadSummary();
      } else if (e.target.id === 'btn-share-x') {
        this.shareOnX();
      } else if (e.target.id === 'btn-replay') {
        this.replayStory();
      } else if (e.target.id === 'btn-error-back') {
        this.goToSlide(0);
      } else if (e.target.id === 'btn-get-wrapped') {
        this.goToSlide(0);
      }
    });
  },

  // --- LOGIC FLOW ---

  async handleFile(file) {
    this.isDemo = false;
    this.goToSlide(1); // Loading slide
    
    // Show file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeIndicator = document.getElementById('file-size-indicator');
    if (sizeIndicator) {
      sizeIndicator.textContent = `Processing ${sizeInMB} MB...`;
    }
    
    try {
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));
      const parsePromise = Parser.parse(file, () => {});
      
      const [_, conversations] = await Promise.all([minLoadingTime, parsePromise]);
      Analytics.track('file-uploaded', { size_mb: sizeInMB });
      this.processData(conversations);
    } catch (err) {
      this.showError(err.message);
    }
  },

  async loadDemo() {
    this.isDemo = true;
    Analytics.track('demo-clicked');
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
      this.stats = Stats.compute(conversations);
      const year = this.stats.year;
      document.title = `ChatGPT Wrapped ${year}`;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `ChatGPT Wrapped ${year}`);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', `ChatGPT Wrapped ${year}`);
      
      // Generate slides using external module
      const { summarySlide } = SlideGenerator.generate(this.stats, this.dom.dynamicSlidesContainer);

      document.querySelectorAll('[data-hook="year"]').forEach(el => {
        el.textContent = year;
      });
      
      // Handle Demo Mode state in Summary
      if (this.isDemo && summarySlide) {
        const sharePrompt = summarySlide.querySelector('#share-prompt');
        const actionsRow = summarySlide.querySelector('#actions-row');
        const btnGet = summarySlide.querySelector('#btn-get-wrapped');
        
        if (sharePrompt) sharePrompt.style.display = 'none';
        if (actionsRow) actionsRow.style.display = 'none';
        if (btnGet) btnGet.style.display = 'block';
      }
      
      // Update slides array with new dynamic slides
      this.slides = Array.from(document.querySelectorAll('.slide'));
      this.updateProgressUI();
      
      // Start the show
      this.goToSlide(3); // First data slide (after upload=0, loading=1, error=2)
    } catch (err) {
      this.showError('Error processing stats: ' + err.message);
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
    
    // Trigger animations on slide enter
    setTimeout(() => {
      this.animateSlideNumbers(curr);
      this.animateEmojis(curr);
      this.addGlowEffect(curr);
    }, 100);
    
    // Trigger confetti on special slides
    if (index === 3 && this.stats) { // First data slide (journey)
      setTimeout(() => this.triggerConfetti(50), 300);
    }
    
    // Confetti on persona slide
    const isPersonaSlide = curr.querySelector('.persona-name');
    if (isPersonaSlide) {
      setTimeout(() => this.triggerConfetti(40), 400);
    }
    
    // Big confetti burst on summary/final slide
    const isSummarySlide = curr.querySelector('.summary-card');
    if (isSummarySlide) {
      setTimeout(() => this.triggerConfetti(70), 200);
      Analytics.track('story-completed', { is_demo: this.isDemo });
    }
    
    // Announce to screen readers
    const slideTitle = curr.querySelector('h1, h2');
    if (slideTitle) {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `Slide ${index + 1} of ${this.slides.length}: ${slideTitle.textContent}`;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    }

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
    const btn = document.getElementById('btn-download');
    const originalText = btn.textContent;
    btn.textContent = 'Generating...';
    btn.disabled = true;
    
    Analytics.track('download-image');
    
    html2canvas(card, { backgroundColor: '#000000' }).then(canvas => {
      const link = document.createElement('a');
      const year = this.stats?.year || new Date().getFullYear();
      link.download = `chatgpt-wrapped-${year}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      btn.textContent = '✓ Downloaded!';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    });
  },

  shareOnX() {
    Analytics.track('share-x');
    const year = this.stats?.year || new Date().getFullYear();
    const text = encodeURIComponent(`My ChatGPT Wrapped ${year}: ${this.stats?.conversations || 0} conversations this year! 🤖✨\n\nCheck out yours at gptwrapped.sanjeed.in`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
  },

  replayStory() {
    // Go to first data slide
    this.goToSlide(3);
  },

  triggerConfetti(count = 50) {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ffffff', '#fbbf24'];
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        // Add some variety to confetti shapes
        if (Math.random() > 0.5) {
          confetti.style.borderRadius = '50%';
        }
        confetti.style.width = (Math.random() * 8 + 6) + 'px';
        confetti.style.height = (Math.random() * 8 + 6) + 'px';
        
        const currentSlide = this.slides[this.currentSlideIndex];
        currentSlide.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3500);
      }, i * 30);
    }
  },

  // Animate numbers counting up
  animateNumber(element, targetNum, duration = 1000) {
    const startTime = performance.now();
    const startNum = 0;
    
    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for satisfying deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNum = Math.floor(startNum + (targetNum - startNum) * easeOut);
      
      element.textContent = currentNum.toLocaleString('en-US');
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = targetNum.toLocaleString('en-US');
      }
    };
    
    requestAnimationFrame(updateNumber);
  },

  // Animate all countable numbers in a slide
  animateSlideNumbers(slide) {
    // Find elements with data-count attribute or stat-huge class with numbers
    const statElements = slide.querySelectorAll('.stat-huge, .stat-box .val, .hero-val, .mini-val');
    
    statElements.forEach((el, idx) => {
      const text = el.textContent.trim();
      // Check if it's a pure number (with possible commas)
      const numMatch = text.replace(/,/g, '').match(/^(\d+)$/);
      if (numMatch) {
        const targetNum = parseInt(numMatch[1], 10);
        if (targetNum > 0) {
          // Stagger the animations slightly
          setTimeout(() => {
            this.animateNumber(el, targetNum, 800 + Math.min(targetNum, 500));
          }, idx * 100);
        }
      }
    });
  },

  // Add bounce animation to emojis
  animateEmojis(slide) {
    const emojiElements = slide.querySelectorAll('.persona-icon, .model-icon, .overview-icon, .error-icon');
    emojiElements.forEach((el, idx) => {
      el.classList.remove('emoji-bounce');
      // Force reflow
      void el.offsetWidth;
      setTimeout(() => {
        el.classList.add('emoji-bounce');
      }, idx * 100);
    });
  },

  // Add glow to main stat
  addGlowEffect(slide) {
    const mainStat = slide.querySelector('.stat-huge');
    if (mainStat) {
      mainStat.classList.add('glow-pulse');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
