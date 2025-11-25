document.addEventListener('DOMContentLoaded', () => {
    
    /* ==================================================================
       1. MENU MOBILE E NAVEGAÇÃO
       ================================================================== */
    const menuBtn = document.getElementById('menuBtn');
    const navList = document.getElementById('navList');
    
    if(menuBtn && navList) {
        // Abrir/Fechar menu
        menuBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuBtn.innerHTML = navList.classList.contains('active') ? '✕' : '☰';
        });

        // Fechar ao clicar em link (para mobile)
        document.querySelectorAll('#navList a').forEach(link => {
            link.addEventListener('click', () => {
                if(window.innerWidth <= 900) {
                    navList.classList.remove('active');
                    menuBtn.innerHTML = '☰';
                }
            });
        });
    }

    /* ==================================================================
       2. CARROSSEL (SLIDER) DO TOPO
       ================================================================== */
    const track = document.getElementById('sliderTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if(track && nextBtn) {
        let currentIndex = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        };

        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        };

        // Passa sozinho a cada 5 segundos
        setInterval(() => nextBtn.click(), 5000);
    }

    /* ==================================================================
       3. SISTEMA DE NOTÍCIAS (COM SUPORTE A ARQUIVOS)
       ================================================================== */
    
    const newsGrid = document.getElementById('newsGrid');
    const adminForm = document.getElementById('adminForm');
    
    // Carrega do LocalStorage ou inicia vazio
    let savedNews = JSON.parse(localStorage.getItem('siteNews')) || [];

    /**
     * Função que decide se cria uma tag <IMG> ou <VIDEO>
     * baseada no código do arquivo (Base64)
     */
    function createMediaHTML(src, isModal = false) {
        if (!src) return ''; // Se não tiver mídia

        // Verifica se o código começa com 'data:video'
        const isVideo = src.startsWith('data:video');
        
        if (isVideo) {
            // Se for vídeo:
            // No Modal: Mostra controles (play, volume) e autoplay
            // Na Lista: Mudo (muted), loop e sem controles
            return `<video src="${src}" 
                    ${isModal ? 'controls autoplay' : 'muted loop autoplay playsinline'} 
                    style="width:100%; object-fit:cover; border-radius:8px; display:block; height:${isModal ? 'auto' : '200px'}">
                    </video>`;
        } else {
            // Se for imagem:
            return `<img src="${src}" alt="Mídia" 
                    style="width:100%; object-fit:cover; border-radius:8px; display:block; height:${isModal ? 'auto' : '200px'}">`;
        }
    }

    // Função para desenhar as notícias na tela
    function renderNews() {
        if(!newsGrid) return;
        newsGrid.innerHTML = ''; // Limpa antes de desenhar
        
        if(savedNews.length === 0) {
            newsGrid.innerHTML = '<p style="text-align:center; color:#666; grid-column: 1/-1;">Nenhuma notícia publicada ainda.</p>';
            return;
        }

        savedNews.forEach(news => {
            const article = document.createElement('article');
            article.className = 'news-item';
            article.onclick = () => openModal(news);
            
            // Gera o HTML da mídia (Thumb)
            const mediaHTML = createMediaHTML(news.image);

            article.innerHTML = `
                <div class="news-thumb" style="height:200px; overflow:hidden; background:#eee;">
                    ${mediaHTML}
                </div>
                <div class="news-content">
                    <h4>${news.title}</h4>
                    <p class="meta">${news.date}</p>
                    <p>${news.summary}</p>
                    <span style="color:var(--dourado); font-size:12px; font-weight:bold; margin-top:5px; display:block;">Ler completo →</span>
                </div>
            `;
            newsGrid.prepend(article); // Adiciona no topo (mais recente)
        });
    }

    // Renderiza ao carregar a página
    renderNews();

    /* ==================================================================
       4. LÓGICA DO ADMIN (UPLOAD DE ARQUIVO)
       ================================================================== */
    if(adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede recarregar a página

            const title = document.getElementById('newsTitle').value;
            const summary = document.getElementById('newsSummary').value;
            const fullText = document.getElementById('newsFull').value;
            const fileInput = document.getElementById('newsFile');
            
            // Verifica se tem arquivo selecionado
            if(fileInput.files.length === 0) {
                alert("Por favor, selecione uma imagem ou vídeo.");
                return;
            }

            const file = fileInput.files[0];

            // --- VALIDAÇÃO DE TAMANHO (IMPORTANTE) ---
            // Como estamos usando LocalStorage, arquivos muito grandes (vídeos longos)
            // vão travar o site ou dar erro de cota excedida.
            // Limite sugerido: 2MB a 3MB.
            const limitMB = 3;
            if(file.size > limitMB * 1024 * 1024) {
                alert(`Arquivo muito grande! O limite para teste no navegador é ${limitMB}MB.\nTente uma foto menor ou um vídeo curto.`);
                return;
            }

            // Lê o arquivo e converte para texto (Base64)
            const reader = new FileReader();

            reader.onload = function(event) {
                const base64String = event.target.result;

                const newPost = {
                    id: Date.now(),
                    title: title,
                    image: base64String, // Salva o "codigão" da imagem/vídeo aqui
                    summary: summary,
                    fullText: fullText,
                    date: new Date().toLocaleDateString('pt-BR')
                };

                // Tenta salvar no navegador
                try {
                    savedNews.push(newPost);
                    localStorage.setItem('siteNews', JSON.stringify(savedNews));
                    
                    // Sucesso
                    adminForm.reset(); // Limpa form
                    renderNews();      // Atualiza lista
                    alert('Notícia publicada com sucesso!');
                    
                    // Rola a tela para ver a notícia
                    document.getElementById('noticias').scrollIntoView({behavior: 'smooth'});
                    
                } catch (error) {
                    // Se o armazenamento encher
                    console.error(error);
                    alert("Erro: O armazenamento do navegador está cheio.\nExclua notícias antigas ou use arquivos menores.");
                    savedNews.pop(); // Remove o item que falhou
                }
            };

            // Inicia a leitura do arquivo
            reader.readAsDataURL(file);
        });
    }

    /* ==================================================================
       5. LÓGICA DO MODAL (POPUP)
       ================================================================== */
    const modal = document.getElementById('newsModal');
    
    // Função global para abrir
    window.openModal = function(news) {
        if(!modal) return;
        
        const modalContent = modal.querySelector('.modal-content');

        // 1. Remove mídia antiga (para não duplicar)
        const oldMedia = document.getElementById('modalMedia');
        if(oldMedia) oldMedia.remove();

        // 2. Cria container da nova mídia
        const mediaContainer = document.createElement('div');
        mediaContainer.id = 'modalMedia';
        mediaContainer.style.marginBottom = '20px'; // Espaço antes do título
        
        // 3. Gera o HTML (Vídeo com controles ou Imagem grande)
        mediaContainer.innerHTML = createMediaHTML(news.image, true);
        
        // 4. Insere logo após o botão de fechar
        const closeBtn = modalContent.querySelector('.modal-close');
        closeBtn.insertAdjacentElement('afterend', mediaContainer);

        // 5. Preenche os textos
        document.getElementById('modalTitle').innerText = news.title;
        document.getElementById('modalDate').innerText = news.date;
        document.getElementById('modalBody').innerText = news.fullText;
        
        // 6. Abre
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Trava rolagem do fundo
    }

    // Função global para fechar
    window.closeModal = function() {
        if(!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = 'auto'; // Destrava rolagem
        
        // Pausa vídeo se tiver tocando ao fechar
        const video = modal.querySelector('video');
        if(video) video.pause();
    }

    // Fechar ao clicar fora
    if(modal) {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) closeModal();
        });
    }

    /* ==================================================================
       6. FUNÇÃO DO ADMIN (SENHA)
       ================================================================== */
    window.toggleAdmin = function() {
        const panel = document.getElementById('adminPanel');
        if(panel.style.display === 'none') {
            const pass = prompt("Senha do Administrador:");
            if(pass === "admin123") {
                panel.style.display = 'block';
                // Rola suavemente até o painel
                setTimeout(() => panel.scrollIntoView({behavior:'smooth'}), 100);
            } else {
                alert("Senha incorreta");
            }
        } else {
            panel.style.display = 'none';
        }
    }
});