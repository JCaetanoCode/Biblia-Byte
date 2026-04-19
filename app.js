// Aplicação principal - orquestra todos os módulos
const App = {
  async init() {
    // Inicializa elementos UI
    UIManager.init();
    
    // Configura estado com elementos UI
    AppState.init(UIManager.elements);
    
    // Carrega última posição lida
    const lastPos = StorageManager.getLastPosition();
    if (lastPos.book && BIBLE_BOOKS[lastPos.book]) {
      AppState.setBook(lastPos.book);
      AppState.setChapter(lastPos.chapter || 1);
      UIManager.populateBookSelect();
    }
    
    // Configura event listeners
    this.setupEventListeners();
    
    // Carrega capítulo inicial
    await this.loadCurrentChapter();
  },
  
  setupEventListeners() {
    const els = UIManager.elements;
    
    // Seletores
    els.bookSelect.addEventListener('change', async (e) => {
      AppState.setBook(e.target.value);
      UIManager.updateChapterSelect();
      await this.loadCurrentChapter();
    });
    
    els.chapterSelect.addEventListener('change', async (e) => {
      AppState.setChapter(parseInt(e.target.value));
      UIManager.updateNavButtons();
      await this.loadCurrentChapter();
    });
    
    // Navegação
    els.prevBtn.addEventListener('click', async () => {
      if (AppState.prevChapter()) {
        els.chapterSelect.value = AppState.currentChapter;
        UIManager.updateNavButtons();
        await this.loadCurrentChapter();
      }
    });
    
    els.nextBtn.addEventListener('click', async () => {
      if (AppState.nextChapter()) {
        els.chapterSelect.value = AppState.currentChapter;
        UIManager.updateNavButtons();
        await this.loadCurrentChapter();
      }
    });
    
    // Modo noturno
    els.nightModeToggle.addEventListener('click', () => {
      UIManager.toggleNightMode();
    });
    
    // Scroll to top
    document.getElementById('scrollTopBtn').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Compartilhar
    document.getElementById('shareBtn').addEventListener('click', () => {
      this.shareCurrentChapter();
    });
    
    // Event delegation para botões dinâmicos
    els.bibleContent.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      
      if (btn.classList.contains('bookmark-btn')) {
        this.handleBookmark(btn);
      } else if (btn.classList.contains('copy-btn')) {
        this.handleCopy(btn);
      }
    });
    
    // Atualizar progresso no scroll
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      UIManager.updateProgress(scrollPercent);
    });
  },
  
  async loadCurrentChapter() {
    UIManager.showLoading();
    
    try {
      const html = await VerseParser.fetchChapter(AppState.currentBook, AppState.currentChapter);
      const verses = VerseParser.parseFromHTML(html);
      
      UIManager.renderVerses(verses);
      
      // Registra leitura
      StorageManager.addHistoryEntry(AppState.currentBook, AppState.currentChapter);
      StorageManager.saveLastPosition(AppState.currentBook, AppState.currentChapter);
      
      // Atualiza estatísticas
      UIManager.updateStats();
      UIManager.updateProgress();
      
    } catch (error) {
      UIManager.elements.bibleContent.innerHTML = `
        <div class="loading">
          <p>😕 Erro ao carregar o capítulo.</p>
          <p style="font-size:0.9rem;margin-top:12px;">${error.message}</p>
        </div>
      `;
    }
  },
  
  handleBookmark(btn) {
    const verseNum = parseInt(btn.dataset.verse);
    const wasAdded = AppState.toggleBookmark(verseNum);
    
    // Atualiza UI
    btn.textContent = wasAdded ? '★' : '☆';
    btn.closest('.verse').classList.toggle('bookmarked', wasAdded);
    
    // Salva
    StorageManager.saveBookmarks(AppState.bookmarks);
    UIManager.updateStats();
    
    UIManager.showToast(wasAdded ? '⭐ Versículo favoritado!' : '🗑️ Removido dos favoritos');
  },
  
  handleCopy(btn) {
    const verseNum = btn.dataset.verse;
    const text = btn.dataset.text;
    const fullText = `${AppState.currentBook} ${AppState.currentChapter}:${verseNum} - ${text}`;
    
    navigator.clipboard?.writeText(fullText).then(() => {
      UIManager.showToast('📋 Versículo copiado!');
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      UIManager.showToast('📋 Versículo copiado!');
    });
  },
  
  shareCurrentChapter() {
    const text = `📖 Estou lendo ${AppState.currentBook} ${AppState.currentChapter} na Bíblia ARC`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({ title: 'Bíblia ARC', text, url });
    } else {
      navigator.clipboard?.writeText(`${text} - ${url}`);
      UIManager.showToast('📤 Link copiado para compartilhar!');
    }
  }
};

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});