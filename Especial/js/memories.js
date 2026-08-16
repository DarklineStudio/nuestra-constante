/* ==========================================================================
   OUR TIME — MEMORIES GALLERY & LIGHTBOX MODULE ("Nuestros Recuerdos")
   ========================================================================== */

const Memories = {
    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const btnAdd = document.getElementById('btnAddMemory');
        const modal = document.getElementById('memoryModal');
        const btnClose = document.getElementById('btnCloseMemoryModal');
        const form = document.getElementById('formAddMemory');
        const lightboxModal = document.getElementById('lightboxModal');
        const btnCloseLightbox = document.getElementById('btnCloseLightbox');

        if (btnAdd && modal) {
            btnAdd.addEventListener('click', () => {
                form.reset();
                document.getElementById('memoryDate').value = new Date().toISOString().split('T')[0];
                modal.classList.remove('hidden');
            });
        }

        if (btnClose && modal) {
            btnClose.addEventListener('click', () => modal.classList.add('hidden'));
        }

        if (btnCloseLightbox && lightboxModal) {
            btnCloseLightbox.addEventListener('click', () => lightboxModal.classList.add('hidden'));
            lightboxModal.querySelector('.modal-backdrop').addEventListener('click', () => lightboxModal.classList.add('hidden'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('memoryTitle').value;
        const date = document.getElementById('memoryDate').value;
        const description = document.getElementById('memoryDescription').value;
        const fileInput = document.getElementById('memoryPhoto');

        if (!fileInput.files || !fileInput.files[0]) {
            alert('Por favor selecciona una fotografía.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const newMemory = {
                id: 'mem_' + Date.now(),
                title,
                date,
                description,
                photo: event.target.result
            };

            Storage.addMemory(newMemory);
            this.render();
            document.getElementById('memoryModal').classList.add('hidden');
        };
        reader.readAsDataURL(fileInput.files[0]);
    },

    openLightbox(id) {
        const memories = Storage.getMemories();
        const memory = memories.find(m => m.id === id);
        if (!memory) return;

        const lightboxModal = document.getElementById('lightboxModal');
        document.getElementById('lightboxImg').src = memory.photo;
        document.getElementById('lightboxTitle').textContent = memory.title;
        document.getElementById('lightboxDate').textContent = new Date(memory.date + 'T00:00:00').toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('lightboxDesc').textContent = memory.description || '';

        lightboxModal.classList.remove('hidden');
    },

    render() {
        const container = document.getElementById('memoriesGrid');
        if (!container) return;

        const memories = Storage.getMemories();
        if (memories.length === 0) {
            container.innerHTML = `
                <div class="glass-panel text-center full-width" style="grid-column: 1 / -1; padding: 32px 16px;">
                    <p class="text-secondary">Aún no hay fotografías en nuestros recuerdos.</p>
                    <p class="text-muted" style="font-size: 0.85rem; margin-top: 6px;">Haz clic en <strong>+ Agregar foto</strong> para guardar nuestro primer recuerdo juntos.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = memories.map(mem => {
            const formattedDate = new Date(mem.date + 'T00:00:00').toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <div class="memory-card" onclick="Memories.openLightbox('${mem.id}')">
                    <div class="memory-img-wrapper">
                        <img src="${mem.photo}" alt="${mem.title}" loading="lazy">
                    </div>
                    <div class="memory-meta">
                        <h4 class="memory-title">${mem.title}</h4>
                        <span class="memory-date">${formattedDate}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
};
