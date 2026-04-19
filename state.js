// Gerenciamento de estado global
const AppState = {
  // Estado atual
  currentBook: 'Gênesis',
  currentChapter: 1,
  
  // Dados persistentes (serão carregados do storage)
  bookmarks: [],
  readingHistory: [],
  
  // Elementos DOM (serão inicializados depois)
  elements: {},
  
  // Métodos
  init(elements) {
    this.elements = elements;
    this.loadFromStorage();
  },
  
  loadFromStorage() {
    this.bookmarks = StorageManager.getBookmarks();
    this.readingHistory = StorageManager.getHistory();
  },
  
  setBook(book) {
    this.currentBook = book;
    this.currentChapter = 1;
  },
  
  setChapter(chapter) {
    this.currentChapter = chapter;
  },
  
  nextChapter() {
    const maxChapters = BIBLE_BOOKS[this.currentBook];
    if (this.currentChapter < maxChapters) {
      this.currentChapter++;
      return true;
    }
    return false;
  },
  
  prevChapter() {
    if (this.currentChapter > 1) {
      this.currentChapter--;
      return true;
    }
    return false;
  },
  
  getMaxChapters() {
    return BIBLE_BOOKS[this.currentBook];
  },
  
  isBookmarked(verseNum) {
    return this.bookmarks.some(b => 
      b.book === this.currentBook && 
      b.chapter === this.currentChapter && 
      b.verse === verseNum
    );
  },
  
  toggleBookmark(verseNum) {
    const existingIndex = this.bookmarks.findIndex(b => 
      b.book === this.currentBook && 
      b.chapter === this.currentChapter && 
      b.verse === verseNum
    );
    
    if (existingIndex > -1) {
      this.bookmarks.splice(existingIndex, 1);
      return false; // removido
    } else {
      this.bookmarks.push({
        book: this.currentBook,
        chapter: this.currentChapter,
        verse: verseNum,
        timestamp: Date.now()
      });
      return true; // adicionado
    }
  }
};