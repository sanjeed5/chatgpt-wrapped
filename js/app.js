/**
 * ChatGPT Wrapped - Main Application
 */

const App = {
  currentSlide: 1,
  totalSlides: 0,
  stats: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Demo button
    document.getElementById('btn-demo').addEventListener('click', () => this.loadDemo());
    
    // Dropzone (directly on page)
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) this.handleFile(file);
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFile(file);
    });
    
    // Restart
    document.getElementById('btn-restart').addEventListener('click', () => this.restart());
    
    // Slide navigation
    document.getElementById('prev-zone').addEventListener('click', () => this.prevSlide());
    document.getElementById('next-zone').addEventListener('click', () => this.nextSlide());
    document.getElementById('btn-prev').addEventListener('click', () => this.prevSlide());
    document.getElementById('btn-next').addEventListener('click', () => this.nextSlide());
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('slides-screen').classList.contains('active')) {
        this.restart();
      }
      if (document.getElementById('slides-screen').classList.contains('active')) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          this.nextSlide();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevSlide();
        }
      }
    });
    
    // Touch swipe
    const slidesScreen = document.getElementById('slides-screen');
    let touchStartX = 0;
    
    slidesScreen.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slidesScreen.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.nextSlide();
        else this.prevSlide();
      }
    }, { passive: true });
  },

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`${id}-screen`).classList.add('active');
  },

  async loadDemo() {
    this.showScreen('loading');
    document.getElementById('loading-status').textContent = 'Generating demo data...';
    
    try {
      await this.delay(300);
      const conversations = DemoData.generate();
      
      document.getElementById('loading-status').textContent = 'Computing stats...';
      await this.delay(200);
      
      this.stats = Stats.compute(conversations, 2025);
      
      document.getElementById('loading-status').textContent = 'Building slides...';
      await this.delay(300);
      
      this.showWrapped();
    } catch (error) {
      console.error('Demo error:', error);
      document.getElementById('error-message').textContent = error.message;
      this.showScreen('error');
    }
  },

  async handleFile(file) {
    this.showScreen('loading');
    
    try {
      const conversations = await Parser.parse(file, (status) => {
        document.getElementById('loading-status').textContent = status;
      });
      
      document.getElementById('loading-status').textContent = 'Computing stats...';
      this.stats = Stats.compute(conversations, 2025);
      
      document.getElementById('loading-status').textContent = 'Building slides...';
      await this.delay(300);
      
      this.showWrapped();
    } catch (error) {
      console.error('File error:', error);
      document.getElementById('error-message').textContent = error.message;
      this.showScreen('error');
    }
  },

  showWrapped() {
    const container = document.getElementById('slides-container');
    container.innerHTML = Slides.generate(this.stats);
    
    const slides = container.querySelectorAll('.slide');
    this.totalSlides = slides.length;
    
    slides.forEach((slide, i) => slide.setAttribute('data-slide', i + 1));
    
    // Nav dots
    const nav = document.getElementById('nav-dots');
    nav.innerHTML = '';
    for (let i = 1; i <= this.totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'nav-dot' + (i === 1 ? ' active' : '');
      dot.addEventListener('click', () => this.goToSlide(i));
      nav.appendChild(dot);
    }
    
    this.currentSlide = 1;
    this.updateNav();
    this.showScreen('slides');
  },

  goToSlide(n) {
    if (n < 1 || n > this.totalSlides) return;
    
    document.querySelectorAll('#slides-container .slide').forEach(s => s.classList.remove('active'));
    document.querySelector(`#slides-container .slide[data-slide="${n}"]`).classList.add('active');
    
    this.currentSlide = n;
    this.updateNav();
  },

  nextSlide() {
    if (this.currentSlide < this.totalSlides) this.goToSlide(this.currentSlide + 1);
  },

  prevSlide() {
    if (this.currentSlide > 1) this.goToSlide(this.currentSlide - 1);
  },

  updateNav() {
    document.querySelectorAll('#nav-dots .nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i + 1 === this.currentSlide);
    });
    document.getElementById('btn-prev').disabled = this.currentSlide === 1;
    document.getElementById('btn-next').disabled = this.currentSlide === this.totalSlides;
  },

  restart() {
    this.currentSlide = 1;
    this.totalSlides = 0;
    this.stats = null;
    document.getElementById('slides-container').innerHTML = '';
    document.getElementById('nav-dots').innerHTML = '';
    document.getElementById('file-input').value = '';
    this.showScreen('upload');
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
