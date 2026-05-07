document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('galleryGrid');
    const form = document.getElementById('galleryForm');
    const adminPanel = document.getElementById('adminPanel');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const titleEl = document.getElementById('currentFolderName');
    const descEl = document.getElementById('currentFolderDesc');
    
    let isAdmin = false;
    let allMedia = []; 
    let allFolders = []; 
    
    let currentType = 'foto'; 
    let currentFolderId = null; 

    // Fecha os dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if(!e.target.matches('.kebab-btn')) {
            document.querySelectorAll('.kebab-dropdown').forEach(d => d.classList.remove('show'));
        }
    });

    // 1. CARREGAR DADOS
    async function loadFolders() {
        try {
            const res = await fetch('listar_pastas.php?t=' + Date.now());
            allFolders = await res.json();
            renderFolders();
            updateAdminSelect();
        } catch(e) { console.error("Erro pastas", e); }
    }

    async function loadGallery() {
        grid.innerHTML = '<p style="text-align:center; width:100%">Carregando...</p>';
        try {
            const res = await fetch('listar_galeria.php?t=' + Date.now());
            allMedia = await res.json();
            renderGallery();
        } catch(e) { grid.innerHTML = '<p style="text-align:center;">Erro ao carregar.</p>';}
    }

    // 2. CONSTRUIR ÁRVORE DE PASTAS (Com recuo visual)
    function buildFolderHTML(parentId, type, level = 0) {
        const folders = allFolders.filter(f => f.parent_id == parentId && f.tipo === type);
        let html = '';
        const padding = level * 15 + 10; // Recuo para subpastas

        folders.forEach(pasta => {
            const isActive = currentFolderId === pasta.id ? 'active' : '';
            html += `
                <li style="padding-left: ${padding}px;" class="${isActive}" onclick="filterGallery(${pasta.id}, '${type}')">
                    <span>📁 ${pasta.nome}</span>
                    <div class="folder-actions" onclick="event.stopPropagation()">
                        <button class="add" onclick="createNewFolder('${type}', ${pasta.id})" title="Criar Subpasta">➕</button>
                        <button class="del" onclick="deleteFolder(${pasta.id})" title="Excluir Pasta">🗑</button>
                    </div>
                </li>
            `;
            // Busca as filhas dessa pasta (Recursividade)
            html += buildFolderHTML(pasta.id, type, level + 1);
        });
        return html;
    }

    function renderFolders() {
        const listFotos = document.getElementById('folderListFotos');
        const listVideos = document.getElementById('folderListVideos');
        
        listFotos.innerHTML = `<li onclick="filterGallery(null, 'foto')" class="${currentFolderId===null && currentType==='foto'?'active':''}">📷 Todas as Fotos</li>`;
        listFotos.innerHTML += buildFolderHTML(null, 'foto');

        listVideos.innerHTML = `<li onclick="filterGallery(null, 'video')" class="${currentFolderId===null && currentType==='video'?'active':''}">🎬 Todos os Vídeos</li>`;
        listVideos.innerHTML += buildFolderHTML(null, 'video');

        // Ativa/Desativa botões visuais de admin nas pastas
        if(isAdmin) document.body.classList.add('admin-mode');
        else document.body.classList.remove('admin-mode');
    }

    // 3. FILTRAR E RENDERIZAR GALERIA
    window.filterGallery = function(folderId, type) {
        currentFolderId = folderId;
        currentType = type;
        
        if(folderId === null) {
            titleEl.innerText = type === 'foto' ? "Todas as Fotos" : "Todos os Vídeos";
        } else {
            const folder = allFolders.find(f => f.id === folderId);
            titleEl.innerText = folder ? folder.nome : "Pasta";
        }
        
        renderFolders(); // Atualiza a classe 'active'
        renderGallery(); // Atualiza as fotos
    }

    function renderGallery() {
        grid.innerHTML = '';
        const filtered = allMedia.filter(item => {
            if(currentFolderId === null) return item.tipo === currentType;
            return item.pasta_id == currentFolderId && item.tipo === currentType;
        });

        if(filtered.length === 0) { 
            grid.innerHTML = '<p style="text-align:center; width:100%;">Nenhuma mídia.</p>'; return; 
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            
            // MENU DE 3 PONTOS (SÓ ADMIN)
            const adminMenu = isAdmin ? `
                <div class="kebab-menu" onclick="event.stopPropagation()">
                    <button class="kebab-btn" onclick="toggleDropdown(event, ${item.id})">⋮</button>
                    <div class="kebab-dropdown" id="drop-${item.id}">
                        <button onclick="editDescItem(${item.id}, '${item.descricao}')">✏️ Editar Texto</button>
                        <button onclick="moveItem(${item.id})">📂 Mover de Pasta</button>
                        <button class="danger" onclick="deleteItem(${item.id})">🗑 Excluir</button>
                    </div>
                </div>
            ` : '';

            let content = item.tipo === 'video' 
                ? `<video src="${item.caminho}" muted style="pointer-events:none; width:100%; height:100%; object-fit:cover;"></video>` 
                : `<img src="${item.caminho}" loading="lazy">`;

            const descText = (item.descricao && item.descricao !== 'null') ? item.descricao : '';
            const caption = descText ? `<div class="card-caption">${descText}</div>` : '';

            card.innerHTML = `${adminMenu} ${content} ${caption}`;
            card.onclick = () => openLightbox(item.caminho, item.tipo, descText);
            grid.appendChild(card);
        });
    }

    // --- FUNÇÕES DE ADMIN ---

    window.toggleAdmin = function() {
        if(adminPanel.style.display === 'block') {
            adminPanel.style.display = 'none'; isAdmin = false;
        } else {
            if(prompt("Senha:") === "admin123") {
                adminPanel.style.display = 'block'; isAdmin = true;
            } else { alert("Senha incorreta"); }
        }
        renderFolders(); renderGallery();
    }

    window.toggleDropdown = function(e, id) {
        e.stopPropagation();
        document.querySelectorAll('.kebab-dropdown').forEach(d => {
            if(d.id !== `drop-${id}`) d.classList.remove('show');
        });
        document.getElementById(`drop-${id}`).classList.toggle('show');
    }

    // Pastas
    window.createNewFolder = async function(tipo, parentId = null) {
        const nome = prompt(`Nome da nova pasta:`);
        if(!nome) return;
        await fetch('criar_pasta.php', { method: 'POST', body: JSON.stringify({ nome: nome, tipo: tipo, parent_id: parentId }) });
        loadFolders();
    }

    window.deleteFolder = async function(id) {
        if(confirm("Excluir pasta? O conteúdo dela irá para a raiz da galeria.")) {
            await fetch('excluir_pasta.php', { method: 'POST', body: JSON.stringify({ id: id }) });
            if(currentFolderId === id) currentFolderId = null; // Reseta se tiver dentro dela
            loadFolders(); loadGallery();
        }
    }

    function updateAdminSelect() {
        const select = document.getElementById('pastaSelect');
        select.innerHTML = '<option value="">(Raiz - Solto na Galeria)</option>';
        allFolders.forEach(f => {
            select.innerHTML += `<option value="${f.id}">[${f.tipo.toUpperCase()}] - ${f.nome}</option>`;
        });
    }

    // Ações das Mídias
    window.deleteItem = async function(id) {
        if(confirm("Excluir arquivo definitivamente?")) {
            await fetch('excluir_galeria.php', { method:'POST', body:JSON.stringify({id:id}) });
            loadGallery();
        }
    }

    window.editDescItem = async function(id, oldDesc) {
        const nova = prompt("Nova descrição:", oldDesc !== 'null' ? oldDesc : '');
        if(nova !== null) {
            await fetch('atualizar_midia.php', { method:'POST', body:JSON.stringify({id: id, acao: 'editar_desc', descricao: nova}) });
            loadGallery();
        }
    }

    window.moveItem = async function(id) {
        let text = "Digite o número da pasta destino ou deixe em branco para jogar na raiz:\n\n";
        const pastasCompatíveis = allFolders.filter(f => f.tipo === currentType);
        pastasCompatíveis.forEach(f => text += `${f.id} - ${f.nome}\n`);
        
        const answer = prompt(text);
        if(answer !== null) {
            const destId = answer.trim() === "" ? null : parseInt(answer);
            await fetch('atualizar_midia.php', { method:'POST', body:JSON.stringify({id: id, acao: 'mover', pasta_id: destId}) });
            loadGallery();
        }
    }

    // Upload
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('galleryFiles');
            const descInput = document.getElementById('galleryDesc');
            const pastaInput = document.getElementById('pastaSelect');
            if(input.files.length === 0) return;

            const formData = new FormData();
            formData.append('descricao', descInput.value); 
            formData.append('pasta_id', pastaInput.value); 
            for(let i=0; i<input.files.length; i++) formData.append('files[]', input.files[i]);

            const btn = form.querySelector('button');
            btn.disabled = true; progressContainer.style.display = 'block';
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'salvar_galeria.php', true);
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
                    progressBar.style.width = percent + '%'; progressText.innerText = Math.round(percent) + '%';
                }
            };
            xhr.onload = () => {
                alert('Concluído!'); form.reset(); progressContainer.style.display = 'none';
                btn.disabled = false; loadGallery();
            };
            xhr.send(formData);
        });
    }

    // Lightbox
    window.openLightbox = function(src, type, desc) {
        document.getElementById('lightboxMedia').innerHTML = type === 'video' 
            ? `<video src="${src}" controls autoplay style="max-width:100%; max-height:80vh;"></video>` 
            : `<img src="${src}" style="max-width:100%; max-height:80vh;">`;
        document.getElementById('lightboxText').style.display = desc ? 'block' : 'none';
        document.getElementById('lightboxText').innerText = desc || '';
        document.getElementById('lightbox').style.display = 'flex';
    }
    window.closeLightbox = function() {
        document.getElementById('lightbox').style.display = 'none';
        const v = document.querySelector('#lightboxMedia video'); if(v) v.pause();
    }

    loadFolders(); loadGallery();
});