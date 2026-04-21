# 📖 Biblia-Byte

Uma Bíblia digital leve, rápida e offline, com 3 versões em português: ACF, AA e NVI.

🔗 **Acesse o projeto:** [jcaetanocode.github.io/Biblia-Byte](https://jcaetanocode.github.io/Biblia-Byte/)

---

## ✨ Funcionalidades

- ✅ 3 versões bíblicas completas (ACF, AA, NVI)
- ✅ Navegação por livro, capítulo e versículo
- ✅ Alternância entre versões com um clique
- ✅ Design responsivo (funciona no celular)
- ✅ Tema claro/escuro
- ✅ Carregamento rápido (dados em JSON puro)

---

## 🧠 Como funciona

O projeto utiliza **três arquivos JSON** (`acf.json`, `aa.json`, `nvi.json`) contendo toda a Bíblia estruturada.  
O JavaScript carrega o arquivo selecionado, percorre os livros, capítulos e versículos, e exibe o conteúdo na tela.

### Estrutura de um versículo no JSON:
```json
{
  "Joao": {
    "3": {
      "16": "Porque Deus amou o mundo de tal maneira..."
    }
  }
}