// Parser para extrair versículos dos arquivos HTML
const VerseParser = {
  async fetchChapter(book, chapter) {
    const url = `${book}/${chapter}.html`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      console.error('Erro ao carregar capítulo:', error);
      throw error;
    }
  },
  
  parseFromHTML(html) {
    const verses = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Estratégia 1: Procurar por elementos com classe "verse" ou similares
    const verseElements = doc.querySelectorAll('.verse, [class*="verse"], p');
    
    verseElements.forEach(el => {
      const text = el.textContent.trim();
      // Filtra textos muito curtos ou cabeçalhos
      if (text && text.length > 15 && !text.includes('Bíblia') && !text.includes('Capítulo')) {
        verses.push(this.cleanVerse(text));
      }
    });
    
    // Estratégia 2: Se não encontrou, tenta dividir por padrões de numeração
    if (verses.length === 0) {
      const bodyText = doc.body.textContent;
      const parts = bodyText.split(/(?=\d+\.\s+)/);
      
      parts.forEach(part => {
        const cleaned = this.cleanVerse(part);
        if (cleaned.length > 10) {
          verses.push(cleaned);
        }
      });
    }
    
    // Estratégia 3: Fallback - extrai todos os parágrafos substanciais
    if (verses.length === 0) {
      const paragraphs = doc.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.length > 30) {
          verses.push(this.cleanVerse(text));
        }
      });
    }
    
    return verses;
  },
  
  cleanVerse(text) {
    // Remove quebras de linha extras e espaços múltiplos
    return text
      .replace(/\s+/g, ' ')
      .replace(/^\d+\.\s*/, '') // Remove numeração no início
      .trim();
  }
};