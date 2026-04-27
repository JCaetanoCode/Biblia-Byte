    
:root {
    --bg: #faf7f2;  /* Bege Aveludado */
    --card: #ffffff;
    --text: #1e293b;
    --text-secondary: #64748b;
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --border: #e2e8f0;
    --tag-bg: #dbeafe;
    --tag-text: #1e40af;
    --success: #16a34a;
    --success-bg: #dcfce7;
    --warning: #f59e0b;
    --accent: #8b5cf6;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
    --radius: 12px;
    --radius-sm: 8px;
    --transition: 0.2s ease;
}

     let bibliaAtual = null;
        let versaoAtual = 'acf';
        let resultadosAtuais = [];
        let livroAtual = null;
        let capituloAtual = 1;

        // Função para mudar entre abas
        function mudarAba(aba) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('ativo'));
            event.target.classList.add('ativo');
            
            document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'));
            document.getElementById(`painel-${aba}`).classList.add('ativo');
            
            if (aba === 'pesquisa' && bibliaAtual) {
                preencherFiltroLivros();
            }
        }

        // Carregar a versão selecionada
        function carregarVersao(versao) {
            document.getElementById('resultado').innerHTML = '<div class="loading">⏳ Carregando ' + versao.toUpperCase() + '...</div>';
            
            fetch(`${versao}.json`)
                .then(resposta => {
                    if (!resposta.ok) {
                        throw new Error(`Arquivo ${versao}.json não encontrado`);
                    }
                    return resposta.json();
                })
                .then(dados => {
                    bibliaAtual = dados;
                    versaoAtual = versao;
                    preencherListaLivros();
                    preencherFiltroLivros();
                    document.getElementById('resultado').innerHTML = '<div class="sucesso">✅ ' + getNomeVersao(versao) + ' carregada! Selecione um livro e capítulo.</div>';
                })
                .catch(erro => {
                    document.getElementById('resultado').innerHTML = `<div class="erro">❌ Erro ao carregar ${versao}.json</div>`;
                    bibliaAtual = null;
                });
        }

        function getNomeVersao(versao) {
            const nomes = {
                'acf': 'ACF (Almeida Corrigida Fiel)',
                'aa': 'AA (Almeida Revista)',
                'nvi': 'NVI (Nova Versão Internacional)'
            };
            return nomes[versao] || versao.toUpperCase();
        }

        function preencherListaLivros() {
            if (!bibliaAtual) return;
            
            const selectLivro = document.getElementById('livro');
            selectLivro.innerHTML = '';
            
            bibliaAtual.forEach((livro, indice) => {
                const option = document.createElement('option');
                option.value = indice;
                const nomeLivro = livro.nome || livro.name || livro.book || `Livro ${indice + 1}`;
                option.textContent = nomeLivro;
                selectLivro.appendChild(option);
            });
        }

        function preencherFiltroLivros() {
            if (!bibliaAtual) return;
            
            const filtroLivro = document.getElementById('filtroLivroPesquisa');
            filtroLivro.innerHTML = '<option value="todos">Todos os livros</option>';
            
            bibliaAtual.forEach((livro, indice) => {
                const option = document.createElement('option');
                option.value = indice;
                const nomeLivro = livro.nome || livro.name || livro.book || `Livro ${indice + 1}`;
                option.textContent = nomeLivro;
                filtroLivro.appendChild(option);
            });
        }

        // ========== BUSCAR CAPÍTULO INTEIRO ==========
        function buscarCapitulo() {
            if (!bibliaAtual) {
                document.getElementById('resultado').innerHTML = '<div class="erro">⏳ Carregue uma versão primeiro.</div>';
                return;
            }

            const indiceLivro = parseInt(document.getElementById('livro').value);
            const capitulo = parseInt(document.getElementById('capitulo').value);
            const versiculoInput = document.getElementById('versiculo').value;
            const versiculoDestaque = versiculoInput ? parseInt(versiculoInput) : null;

            const livro = bibliaAtual[indiceLivro];
            
            if (!livro) {
                document.getElementById('resultado').innerHTML = '<div class="erro">Livro não encontrado.</div>';
                return;
            }

            livroAtual = livro;
            capituloAtual = capitulo;

            const nomeLivro = livro.nome || livro.name || livro.book;
            const capitulos = livro.capitulos || livro.chapters;
            
            if (!capitulos || capitulo > capitulos.length || capitulo < 1) {
                document.getElementById('resultado').innerHTML = `<div class="erro">O livro ${nomeLivro} não possui o capítulo ${capitulo}.</div>`;
                return;
            }

            const versiculos = capitulos[capitulo - 1];
            
            if (!versiculos || versiculos.length === 0) {
                document.getElementById('resultado').innerHTML = `<div class="erro">O capítulo ${capitulo} de ${nomeLivro} está vazio.</div>`;
                return;
            }

            // Verificar se o versículo de destaque é válido
            if (versiculoDestaque && (versiculoDestaque > versiculos.length || versiculoDestaque < 1)) {
                document.getElementById('resultado').innerHTML = `<div class="erro">O capítulo ${capitulo} de ${nomeLivro} possui apenas ${versiculos.length} versículo(s).</div>`;
                return;
            }

            // Exibir o capítulo inteiro
            exibirCapitulo(nomeLivro, capitulo, versiculos, versiculoDestaque);
        }

        function exibirCapitulo(nomeLivro, capitulo, versiculos, versiculoDestaque = null) {
            const totalCapitulos = livroAtual.capitulos?.length || livroAtual.chapters?.length || 1;
            
            let html = `
                <div class="capitulo-container">
                    <div class="capitulo-header">
                        <h2>${nomeLivro} ${capitulo}</h2>
                        <div class="capitulo-nav">
                            <button onclick="navegarCapitulo(-1)" ${capitulo <= 1 ? 'disabled' : ''}>← Anterior</button>
                            <button onclick="navegarCapitulo(1)" ${capitulo >= totalCapitulos ? 'disabled' : ''}>Próximo →</button>
                        </div>
                    </div>
            `;
            
            if (versiculoDestaque) {
                html += `<div class="info-pesquisa">📌 <span class="indicador-versiculo">Versículo ${versiculoDestaque} destacado</span></div>`;
            }
            
            html += `<div class="versiculo-lista">`;
            
            versiculos.forEach((texto, indice) => {
                const numeroVersiculo = indice + 1;
                const isDestacado = versiculoDestaque === numeroVersiculo;
                const classeDestacado = isDestacado ? 'versiculo-destacado' : '';
                
                html += `
                    <div class="versiculo-item ${classeDestacado}" id="v${numeroVersiculo}">
                        <span class="versiculo-numero">${numeroVersiculo}</span>
                        <span class="versiculo-texto">${texto}</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <div class="versao">${getNomeVersao(versaoAtual)}</div>
                </div>
            `;
            
            document.getElementById('resultado').innerHTML = html;
            
            // Rolar até o versículo destacado (se houver)
            if (versiculoDestaque) {
                setTimeout(() => {
                    const elemento = document.getElementById(`v${versiculoDestaque}`);
                    if (elemento) {
                        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }

        function navegarCapitulo(direcao) {
            const novoCapitulo = capituloAtual + direcao;
            document.getElementById('capitulo').value = novoCapitulo;
            document.getElementById('versiculo').value = '';
            buscarCapitulo();
        }

        // ========== FUNÇÕES DE PESQUISA ==========
        function executarPesquisa() {
            if (!bibliaAtual) {
                alert('Carregue uma versão primeiro!');
                return;
            }

            const termo = document.getElementById('termoPesquisa').value.trim();
            if (termo.length < 2) {
                alert('Digite pelo menos 2 caracteres para pesquisar');
                return;
            }

            const filtroLivro = document.getElementById('filtroLivroPesquisa').value;
            
            document.getElementById('resultadosPesquisa').innerHTML = '<div class="loading">🔍 Pesquisando...</div>';
            
            setTimeout(() => {
                const resultados = pesquisarNaBiblia(termo, filtroLivro);
                exibirResultadosPesquisa(resultados, termo);
            }, 10);
        }

        function pesquisarNaBiblia(termo, filtroLivro) {
            const resultados = [];
            const termoLower = termo.toLowerCase();
            
            bibliaAtual.forEach((livro, indiceLivro) => {
                if (filtroLivro !== 'todos' && parseInt(filtroLivro) !== indiceLivro) {
                    return;
                }
                
                const nomeLivro = livro.nome || livro.name || livro.book;
                const capitulos = livro.capitulos || livro.chapters;
                
                if (!capitulos) return;
                
                capitulos.forEach((versiculos, indiceCapitulo) => {
                    if (!versiculos) return;
                    
                    versiculos.forEach((texto, indiceVersiculo) => {
                        if (texto && texto.toLowerCase().includes(termoLower)) {
                            resultados.push({
                                livro: nomeLivro,
                                indiceLivro: indiceLivro,
                                capitulo: indiceCapitulo + 1,
                                versiculo: indiceVersiculo + 1,
                                texto: texto,
                                termo: termo
                            });
                        }
                    });
                });
            });
            
            return resultados;
        }

        function exibirResultadosPesquisa(resultados, termo) {
            resultadosAtuais = resultados;
            const container = document.getElementById('resultadosPesquisa');
            
            if (resultados.length === 0) {
                container.innerHTML = `<div class="info-pesquisa">😕 Nenhum resultado encontrado para "${termo}"</div>`;
                return;
            }
            
            let html = `<div class="info-pesquisa">📊 ${resultados.length} resultado(s) encontrados para "${termo}"</div>`;
            
            const resultadosLimitados = resultados.slice(0, 100);
            
            resultadosLimitados.forEach((res) => {
                const textoDestacado = destacarTermo(res.texto, termo);
                
                html += `
                    <div class="resultado-item" onclick="irParaCapituloComDestaque(${res.indiceLivro}, ${res.capitulo}, ${res.versiculo})">
                        <strong>${res.livro} ${res.capitulo}:${res.versiculo}</strong>
                        <div class="texto">${textoDestacado}</div>
                        <div class="referencia">${getNomeVersao(versaoAtual)}</div>
                    </div>
                `;
            });
            
            if (resultados.length > 100) {
                html += `<div class="info-pesquisa">Mostrando 100 de ${resultados.length} resultados. Refine sua pesquisa.</div>`;
            }
            
            container.innerHTML = html;
        }

        function destacarTermo(texto, termo) {
            const regex = new RegExp(`(${termo})`, 'gi');
            return texto.replace(regex, '<span class="highlight">$1</span>');
        }

        function irParaCapituloComDestaque(indiceLivro, capitulo, versiculo) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('ativo'));
            document.querySelectorAll('.tab')[0].classList.add('ativo');
            document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'));
            document.getElementById('painel-leitura').classList.add('ativo');
            
            document.getElementById('livro').value = indiceLivro;
            document.getElementById('capitulo').value = capitulo;
            document.getElementById('versiculo').value = versiculo;
            
            buscarCapitulo();
        }

        function limparPesquisa() {
            document.getElementById('termoPesquisa').value = '';
            document.getElementById('filtroLivroPesquisa').value = 'todos';
            document.getElementById('resultadosPesquisa').innerHTML = '<div class="info-pesquisa">Digite um termo e clique em Pesquisar</div>';
            resultadosAtuais = [];
        }

        // Eventos
        document.getElementById('versao').addEventListener('change', function() {
            carregarVersao(this.value);
        });

        document.getElementById('termoPesquisa').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                executarPesquisa();
            }
        });

        document.getElementById('capitulo').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') buscarCapitulo();
        });
        
        document.getElementById('versiculo').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') buscarCapitulo();
        });

        // Carregar versão inicial
        carregarVersao('acf');
    