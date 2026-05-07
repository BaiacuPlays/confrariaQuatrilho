document.addEventListener('DOMContentLoaded', () => {
    
    let isAdmin = false;

    // --- 1. MENU E CARROSSEL (IGUAL) ---
    const menuBtn = document.getElementById('menuBtn');
    const navList = document.getElementById('navList');
    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuBtn.innerHTML = navList.classList.contains('active') ? '✕' : '☰';
        });
    }

    const track = document.getElementById('sliderTrack');
    const nextBtn = document.getElementById('nextBtn');
    if(track && nextBtn) {
        let currentIndex = 0;
        const slides = document.querySelectorAll('.slide');
        function updateCarousel() { track.style.transform = `translateX(-${currentIndex * 100}%)`; }
        setInterval(() => { currentIndex = (currentIndex + 1) % slides.length; updateCarousel(); }, 5000);
    }

    // --- 2. SISTEMA DE NOTÍCIAS ---
    const newsGrid = document.getElementById('newsGrid');
    const adminForm = document.getElementById('adminForm');
    const adminPanel = document.getElementById('adminPanel');

    // Função que cria o visual da Mídia (pega só a primeira para a capa)
    function createThumbnailHTML(mediaListJson) {
        let mediaList = [];
        try {
            // Tenta ler como lista de arquivos
            mediaList = JSON.parse(mediaListJson);
        } catch(e) {
            // Se der erro (é arquivo antigo ou único), transforma em lista
            mediaList = [mediaListJson];
        }

        if(!mediaList || mediaList.length === 0) return '';
        
        // Pega só o primeiro arquivo para ser a capa
        const src = mediaList[0];
        
        // Verifica se é vídeo (pela extensão .mp4, .mov, etc)
        const isVideo = src.match(/\.(mp4|webm|ogg)$/i);

        if (isVideo) {
            return `<video src="${src}" muted loop onmouseover="this.play()" onmouseout="this.pause()" style="width:100%; height:100%; object-fit:cover;"></video>`;
        } else {
            return `<img src="${src}" alt="Notícia" style="width:100%; height:100%; object-fit:cover;">`;
        }
    }

    async function renderNews() {
        newsGrid.innerHTML = '<p style="text-align:center">Carregando...</p>';
        try {
            const response = await fetch('listar_noticias.php');
            const newsList = await response.json();
            newsGrid.innerHTML = ''; 

            if(newsList.length === 0) { newsGrid.innerHTML = '<p style="text-align:center">Vazio.</p>'; return; }

            newsList.forEach(news => {
                const article = document.createElement('article');
                article.className = 'news-item';
                
                // Botão de Excluir (Só se for Admin)
                const deleteBtn = isAdmin ? `<button class="delete-btn" onclick="deletarNoticia(event, ${news.id})">🗑</button>` : '';

                article.innerHTML = `
                    ${deleteBtn}
                    <div class="news-thumb" style="height:200px; overflow:hidden; position:relative;">
                        ${createThumbnailHTML(news.image)}
                        ${isAdmin ? '' : '<div class="gallery-icon">📷 Ver Galeria</div>'}
                    </div>
                    <div class="news-content">
                        <h4>${news.title}</h4>
                        <p class="meta">${news.date}</p>
                        <p>${news.summary}</p>
                        <span style="color:var(--dourado); font-size:12px; font-weight:bold;">Ler completo →</span>
                    </div>
                `;
                // Passa o objeto completo da notícia para o modal
                article.onclick = () => openModal(news);
                newsGrid.append(article);
            });
        } catch (error) { console.error(error); }
    }
    renderNews();

    // --- 3. ADMIN (UPLOAD REAL) ---
    window.toggleAdmin = function() {
        if(adminPanel.style.display === 'block') {
            adminPanel.style.display = 'none';
            isAdmin = false;
            renderNews();
        } else {
            if(prompt("Senha:") === "admin123") {
                adminPanel.style.display = 'block';
                adminPanel.scrollIntoView();
                isAdmin = true;
                renderNews();
            } else { alert("Senha incorreta"); }
        }
    }

    window.deletarNoticia = async function(event, id) {
        event.stopPropagation();
        if(confirm("Excluir?")) {
            await fetch('excluir_noticia.php', {
                method:'POST', 
                body: JSON.stringify({id: id})
            });
            renderNews();
        }
    }

    if(adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Cria um "Formulário Virtual"
            const formData = new FormData();
            formData.append('title', document.getElementById('newsTitle').value);
            formData.append('summary', document.getElementById('newsSummary').value);
            formData.append('fullText', document.getElementById('newsFull').value);
            formData.append('date', new Date().toLocaleDateString('pt-BR'));

            const fileInput = document.getElementById('newsFile');
            
            // IMPORTANTE: Use 'files[]' com colchetes para o PHP criar um array
            for(let i=0; i < fileInput.files.length; i++){
                formData.append('files[]', fileInput.files[i]);
            }

            try {
                // AQUI ESTAVA O ERRO PROVÁVEL:
                // Não pode ter 'headers' nem 'Content-Type' aqui.
                // O navegador adiciona o 'boundary' automaticamente quando vê FormData.
                const response = await fetch('salvar_noticia.php', {
                    method: 'POST',
                    body: formData 
                });
                
                const result = await response.json();
                
                if(result.status === 'sucesso') {
                    alert('Publicado com sucesso!');
                    adminForm.reset();
                    renderNews();
                } else { 
                    // Se der erro, mostra a mensagem técnica
                    alert('Erro do servidor: ' + result.mensagem); 
                }
            } catch (error) { 
                console.error(error);
                alert('Erro na conexão. Verifique o console (F12) para detalhes.'); 
            }
        });
    }

    // --- 4. MODAL COM GALERIA ---
    const modal = document.getElementById('newsModal');
    const modalContent = modal.querySelector('.modal-content');

    window.openModal = function(news) {
        // Remove galeria antiga
        const oldGallery = document.getElementById('modalGallery');
        if(oldGallery) oldGallery.remove();

        // Cria container da galeria
        const galleryContainer = document.createElement('div');
        galleryContainer.id = 'modalGallery';
        galleryContainer.className = 'modal-gallery-grid';

        // Trata a lista de imagens
        let mediaList = [];
        try { mediaList = JSON.parse(news.image); } catch(e) { mediaList = [news.image]; }

        // Cria cada item da galeria
        mediaList.forEach(src => {
            const isVideo = src.match(/\.(mp4|webm|ogg)$/i);
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            if(isVideo) {
                item.innerHTML = `<video src="${src}" controls></video>`;
            } else {
                item.innerHTML = `<img src="${src}" alt="Mídia" onclick="window.open('${src}', '_blank')">`;
            }
            galleryContainer.appendChild(item);
        });

        // Insere no modal
        modalContent.querySelector('.modal-close').insertAdjacentElement('afterend', galleryContainer);
        
        document.getElementById('modalTitle').innerText = news.title;
        document.getElementById('modalDate').innerText = news.date;
        document.getElementById('modalBody').innerText = news.full_text || news.fullText; // Compatibilidade
        
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    window.closeModal = function() {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
        // Para vídeos que estejam tocando
        const videos = document.querySelectorAll('video');
        videos.forEach(v => v.pause());
    }
});