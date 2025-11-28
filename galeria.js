document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('galleryGrid');
    const form = document.getElementById('galleryForm');
    const adminPanel = document.getElementById('adminPanel');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    let isAdmin = false;

    // 1. CARREGAR
    async function loadGallery() {
        grid.innerHTML = '<p style="text-align:center; width:100%">Carregando...</p>';
        try {
            const res = await fetch('listar_galeria.php?t=' + Date.now());
            const items = await res.json();
            grid.innerHTML = '';

            if(items.length === 0) { grid.innerHTML = '<p style="text-align:center; width:100%">Galeria vazia.</p>'; return; }

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'gallery-card';
                
                // Botão Lixeira
                const deleteBtn = isAdmin ? `<button class="delete-btn" onclick="deleteItem(event, ${item.id})" style="position:absolute; top:10px; right:10px; z-index:20; width:35px; height:35px; background:red; border:2px solid white; color:white; border-radius:50%; cursor:pointer;">🗑</button>` : '';

                let content = '';
                if(item.tipo === 'video') {
                    // pointer-events:none faz o clique atravessar o video e pegar no card
                    content = `<video src="${item.caminho}" muted style="pointer-events:none; width:100%; height:100%; object-fit:cover;"></video>`;
                } else {
                    content = `<img src="${item.caminho}" loading="lazy">`;
                }

                const descText = (item.descricao && item.descricao !== 'null') ? item.descricao : '';
                const caption = descText ? `<div class="card-caption">${descText}</div>` : '';

                card.innerHTML = `${deleteBtn} ${content} ${caption}`;
                
                // CLIQUE
                card.onclick = () => openLightbox(item.caminho, item.tipo, descText);
                
                grid.appendChild(card);
            });
        } catch(e) { console.error(e); }
    }

    loadGallery();

    // 2. ADMIN
    window.toggleAdmin = function() {
        if(adminPanel.style.display === 'block') {
            adminPanel.style.display = 'none';
            isAdmin = false;
        } else {
            if(prompt("Senha:") === "admin123") {
                adminPanel.style.display = 'block';
                isAdmin = true;
            } else { alert("Senha incorreta"); }
        }
        loadGallery(); 
    }

    // 3. UPLOAD
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('galleryFiles');
            const descInput = document.getElementById('galleryDesc');
            
            if(input.files.length === 0) return;

            const formData = new FormData();
            formData.append('descricao', descInput.value); 
            for(let i=0; i<input.files.length; i++) {
                formData.append('files[]', input.files[i]);
            }

            const btn = form.querySelector('button');
            btn.disabled = true;
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.innerText = "Iniciando...";

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'salvar_galeria.php', true);

            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
                    progressBar.style.width = percent + '%';
                    progressText.innerText = Math.round(percent) + '%';
                }
            };

            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const json = JSON.parse(xhr.responseText);
                        if(json.status === 'sucesso') {
                            alert(json.msg);
                            form.reset();
                            progressContainer.style.display = 'none';
                            loadGallery();
                        } else { alert('Erro: ' + json.msg); }
                    } catch(e) { alert('Erro resposta servidor'); }
                } else { alert('Erro envio'); }
                btn.disabled = false;
            };
            xhr.onerror = function() { alert('Erro conexão'); btn.disabled = false; };
            xhr.send(formData);
        });
    }

    // 4. DELETAR
    window.deleteItem = async function(e, id) {
        e.stopPropagation();
        if(confirm("Excluir?")) {
            await fetch('excluir_galeria.php', { method:'POST', body:JSON.stringify({id:id}) });
            loadGallery();
        }
    }

    // 5. LIGHTBOX (ZOOM)
    window.openLightbox = function(src, type, desc) {
        const lb = document.getElementById('lightbox');
        const mediaBox = document.getElementById('lightboxMedia');
        const textBox = document.getElementById('lightboxText');
        
        mediaBox.innerHTML = '';
        
        if(type === 'video') {
            mediaBox.innerHTML = `<video src="${src}" controls autoplay style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 0 20px black;"></video>`;
        } else {
            mediaBox.innerHTML = `<img src="${src}" style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 0 20px black;">`;
        }

        if(desc) {
            textBox.innerText = desc;
            textBox.style.display = 'block';
        } else {
            textBox.style.display = 'none';
        }
        
        // FORÇA O DISPLAY FLEX PARA APARECER
        lb.style.display = 'flex';
    }

    window.closeLightbox = function() {
        document.getElementById('lightbox').style.display = 'none';
        const v = document.querySelector('#lightboxMedia video');
        if(v) v.pause();
    }
});