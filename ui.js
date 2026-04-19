// Gerenciamento da interface
const UIManager = {
  elements: {},
  
  init() {
    this.elements = {
      bookSelect: document.getElementById('bookSelect'),
      chapterSelect: document.getElementById('chapterSelect'),
      bibleContent: document.getElementById('bibleContent'),
      prevBtn: document.getElementById('prevChapterBtn'),
      nextBtn: document.getElementById('nextChapterBtn'),
      progressBar: document.getElementById('readingProgress'),
      toast: document.getElementById('toast'),
      versesRead: document.getElementById('versesRead'),
      bookmarksCount: document.getElementById('bookmarksCount'),
      readingStreak: document.getElementById('readingStreak'),
      nightModeToggle: document.getElementById('nightModeToggle')
    };
    
    this.populateBookSelect();
    this.updateStats();
    this.loadNightModePreference();
  },
  
  populateBookSelect() {
    let html = '';
    
    for (const [testament, books] of Object.entries(TESTAMENT_GROUPS)) {
      html += `<optgroup label="${testament}">`;
      books.forEach(book => {
        const selected = book === AppState.currentBook ? 'selected' : '';
        html += `<option value="${book}" ${selected}>${book}</option>`;
      });
      html += '</optgroup>';
    }
    
    this.elements.bookSelect.innerHTML = html;
    this.updateChapterSelect();
  },
  
  updateChapterSelect() {
    const maxChapters = AppState.getMaxChapters();
    let html = '';
    
    for (let i = 1; i <= maxChapters; i++) {
      const selected = i === AppState.currentChapter ? 'selected' : '';
      html += `<option value="${i}" ${selected}>Capítulo ${i}</option>`;
    }
    
    this.elements.chapterSelect.innerHTML = html;
    this.updateNavButtons();
  },
  
  updateNavButtons() {
    this.elements.prevBtn.disabled = AppState.currentChapter <= 1;
    this.elements.nextBtn.disabled = AppState.currentChapter >= AppState.getMaxChapters();
  },
  
  showLoading() {
    this.elements.bibleContent.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Carregando ${AppState.currentBook} ${AppState.currentChapter}...</p>
      </div>
    `;
  },
  
  renderVerses(verses) {
    let html = `<div class="chapter-title">${AppState.currentBook} ${AppState.currentChapter}</div>`;
    
    if (verses.length === 0) {
      html += `<p style="color:#e74c3c;">⚠️ Não foi possível extrair os versículos deste capítulo.</p>`;
      html += `<p style="margin-top:16px;font-size:0.9rem;">Verifique a estrutura do arquivo HTML.</p>`;
    } else {
      verses.forEach((verseText, index) => {
        const verseNum = index + 1;
        const bookmarked = AppState.isBookmarked(verseNum);
        
        html += `
          <div class="verse ${bookmarked ? 'bookmarked' : ''}" data-verse="${verseNum}">
            <span class="verse-number">${verseNum}</span>
            <span class="verse-text">
              ${this.escapeHtml(verseText)}
              <span class="verse-actions">
                <button class="verse-action-btn bookmark-btn" data-verse="${verseNum}">
                  ${bookmarked ? '★' : '☆'}
                </button>
                <button class="verse-action-btn copy-btn" data-verse="${verseNum}" data-text="${this.escapeHtml(verseText)}">
                  📋
                </button>
              </span>
            </span>
          </div>
        `;
      });
    }
    
    this.elements.bibleContent.innerHTML = html;
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  showToast(message) {
    const toast = this.elements.toast;
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, APP_CONFIG.toastDuration);
  },
  
  updateStats() {
    const chaptersRead = StorageManager.getUniqueChaptersRead();
    const estimatedVerses = chaptersRead * APP_CONFIG.averageVersesPerChapter;
    
    this.elements.versesRead.textContent = estimatedVerses;
    this.elements.bookmarksCount.textContent = AppState.bookmarks.length;
    this.elements.readingStreak.textContent = StorageManager.calculateStreak();
  },
  
  updateProgress(scrollPercent = null) {
    if (scrollPercent !== null) {
      this.elements.progressBar.style.width = `${scrollPercent}%`;
    } else {
      const history = StorageManager.getHistory();
      const totalChapters = Object.values(BIBLE_BOOKS).reduce((a, b) => a + b, 0);
      const readChapters = new Set(history.map(h => `${h.book}-${h.chapter}`)).size;
      const percentage = (readChapters / totalChapters) * 100;
      this.elements.progressBar.style.width = `${percentage}%`;
    }
  },
  
  loadNightModePreference() {
    if (StorageManager.getNightMode()) {
      document.body.classList.add('night-mode');
      this.elements.nightModeToggle.textContent = '☀️';
    }
  },
  
  toggleNightMode() {
    const isNight = document.body.classList.toggle('night-mode');
    this.elements.nightModeToggle.textContent = isNight ? '☀️' : '🌙';
    StorageManager.saveNightMode(isNight);
    this.showToast(isNight ? '🌙 Modo noturno ativado' : '☀️ Modo claro ativado');
  }
};