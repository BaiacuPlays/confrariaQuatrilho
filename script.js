document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DO MENU E CARROSSEL (MANTIDA IGUAL) ---
    const menuBtn = document.getElementById('menuBtn');
    const navList = document.getElementById('navList');
    if(menuBtn && navList) {
        menuBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuBtn.innerHTML = navList.classList.contains('active') ? '✕' : '☰';
        });
        document.querySelectorAll('#navList a').forEach(link => {
            link.addEventListener('click', () => {
                if(window.innerWidth <= 900) {
                    navList.classList.remove('active');
                    menuBtn.innerHTML = '☰';
                }
            });
        });
    }

    // Carrossel Simples
    const track = document.getElementById('sliderTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if(track && nextBtn) {
        let currentIndex = 0;
        const slides = document.querySelectorAll('.slide');
        
        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        };
        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        };
        setInterval(() => nextBtn.click(), 5000);
    }

    // --- 2. SISTEMA DE NOTÍCIAS (NOVO!) ---
    
    const newsGrid = document.getElementById('newsGrid');
    const adminForm = document.getElementById('adminForm');
    
    // Carregar notícias salvas (Simulando banco de dados)
    let savedNews = JSON.parse(localStorage.getItem('siteNews')) || [
        // Notícia padrão de exemplo se não tiver nada salvo
        {
            id: Date.now(),
            title: "Bem-vindo ao novo site",
            image: "https://placehold.co/600x400/114b2e/fff?text=Site+Novo",
            summary: "Lançamos hoje nosso portal oficial da Confraria.",
            fullText: "Estamos muito felizes em anunciar o lançamento do site oficial.\n\nAqui você poderá acompanhar os resultados dos jogos, ver fotos dos jantares e ficar por dentro das datas dos próximos torneios.\n\nFique à vontade para navegar!",
            date: new Date().toLocaleDateString()
        }
    ];

    // Função para desenhar as notícias na tela
    function renderNews() {
        newsGrid.innerHTML = ''; // Limpa antes de desenhar
        
        savedNews.forEach(news => {
            const article = document.createElement('article');
            article.className = 'news-item';
            // Ao clicar, abre o modal com os dados dessa notícia
            article.onclick = () => openModal(news);
            
            article.innerHTML = `
                <div class="news-thumb">
                    <img src="${news.image}" alt="${news.title}">
                </div>
                <div class="news-content">
                    <h4>${news.title}</h4>
                    <p class="meta">${news.date}</p>
                    <p>${news.summary}</p>
                    <span style="color:var(--dourado); font-size:12px; font-weight:bold;">Ler completo →</span>
                </div>
            `;
            newsGrid.prepend(article); // Adiciona no começo (mais recente)
        });
    }

    // Renderiza ao carregar a página
    renderNews();

    // --- 3. LÓGICA DO ADMIN (ADICIONAR NOTÍCIA) ---
    if(adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Não recarrega a página

            // Pega os dados do formulário
            const newPost = {
                id: Date.now(), // ID único baseado no tempo
                title: document.getElementById('newsTitle').value,
                image: document.getElementById('newsImage').value,
                summary: document.getElementById('newsSummary').value,
                fullText: document.getElementById('newsFull').value,
                date: new Date().toLocaleDateString('pt-BR')
            };

            // Salva no Array e no LocalStorage
            savedNews.push(newPost);
            localStorage.setItem('siteNews', JSON.stringify(savedNews));

            // Limpa o form e atualiza a tela
            adminForm.reset();
            renderNews();
            alert('Notícia publicada com sucesso!');
        });
    }

    // --- 4. LÓGICA DO MODAL (POPUP) ---
    const modal = document.getElementById('newsModal');
    
    // Função global para abrir modal (usada no renderNews)
    window.openModal = function(news) {
        document.getElementById('modalImg').src = news.image;
        document.getElementById('modalTitle').innerText = news.title;
        document.getElementById('modalDate').innerText = news.date;
        document.getElementById('modalBody').innerText = news.fullText;
        
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Trava a rolagem do site atrás
    }

    // Função global para fechar
    window.closeModal = function() {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto'; // Destrava rolagem
    }

    // Fechar ao clicar fora do conteúdo
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    // Função para mostrar/esconder painel Admin (link no rodapé)
    window.toggleAdmin = function() {
        const panel = document.getElementById('adminPanel');
        if(panel.style.display === 'none') {
            const pass = prompt("Senha do Administrador:"); // Segurança básica
            if(pass === "admin123") { // Senha simples
                panel.style.display = 'block';
                panel.scrollIntoView();
            } else {
                alert("Senha incorreta");
            }
        } else {
            panel.style.display = 'none';
        }
    }
});