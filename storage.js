// Gerenciamento de armazenamento local
const StorageManager = {
  // Bookmarks
  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem('bible_bookmarks') || '[]');
    } catch {
      return [];
    }
  },
  
  saveBookmarks(bookmarks) {
    localStorage.setItem('bible_bookmarks', JSON.stringify(bookmarks));
  },
  
  // Histórico de leitura
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('bible_history') || '[]');
    } catch {
      return [];
    }
  },
  
  saveHistory(history) {
    // Mantém apenas os últimos N itens
    if (history.length > APP_CONFIG.maxHistoryItems) {
      history = history.slice(-APP_CONFIG.maxHistoryItems);
    }
    localStorage.setItem('bible_history', JSON.stringify(history));
  },
  
  addHistoryEntry(book, chapter) {
    const history = this.getHistory();
    const today = new Date().toDateString();
    
    // Evita duplicatas no mesmo dia
    const exists = history.some(h => 
      h.book === book && h.chapter === chapter && h.date === today
    );
    
    if (!exists) {
      history.push({
        book,
        chapter,
        date: today,
        timestamp: Date.now()
      });
      this.saveHistory(history);
    }
    
    return history;
  },
  
  // Posição de leitura
  saveLastPosition(book, chapter) {
    localStorage.setItem('last_read', JSON.stringify({
      book,
      chapter,
      timestamp: Date.now()
    }));
  },
  
  getLastPosition() {
    try {
      return JSON.parse(localStorage.getItem('last_read') || '{}');
    } catch {
      return {};
    }
  },
  
  // Preferências
  getNightMode() {
    return localStorage.getItem('night_mode') === 'true';
  },
  
  saveNightMode(enabled) {
    localStorage.setItem('night_mode', enabled);
  },
  
  // Estatísticas
  getUniqueChaptersRead() {
    const history = this.getHistory();
    return new Set(history.map(h => `${h.book}-${h.chapter}`)).size;
  },
  
  calculateStreak() {
    const history = this.getHistory();
    if (history.length === 0) return 0;
    
    const dates = [...new Set(history.map(h => h.date))].sort();
    const today = new Date().toDateString();
    
    if (dates[dates.length - 1] !== today) return 0;
    
    let streak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const current = new Date(dates[i + 1]);
      const previous = new Date(dates[i]);
      const diffDays = (current - previous) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) streak++;
      else break;
    }
    
    return streak;
  }
};