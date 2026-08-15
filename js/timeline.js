/* ==========================================================================
   NUESTRA CONSTANTE — INSTAGRAM-STYLE STORY FEED MODULE ("Nuestra Historia")
   ========================================================================== */

const Timeline = {
    selectedCategory: 'todas',
    selectedPhotos: [], // Holds DataURLs for new post form
    lightboxPhotos: [],
    lightboxCurrentIndex: 0,

    init() {
        Storage.ensureDataIntegrity();
        this.bindEvents();
    },

    bindEvents() {
        if (this.bound) return;
        this.bound = true;

        const btnAdd = document.getElementById('btnAddTimelineEvent');
        const modal = document.getElementById('timelineModal');
        const btnClose = document.getElementById('btnCloseTimelineModal');
        const form = document.getElementById('formAddTimelineEvent');
        const photosInput = document.getElementById('eventPhotos');

        if (photosInput) {
            photosInput.addEventListener('change', (e) => this.handlePhotosSelect(e));
        }

        if (btnAdd && modal) {
            btnAdd.addEventListener('click', () => {
                if (form) form.reset();
                this.selectedPhotos = [];
                this.renderFormPhotosPreview();
                this.populateCategorySelect();
                const dateEl = document.getElementById('eventDate');
                if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
                const customGrp = document.getElementById('customCategoryInputGroup');
                if (customGrp) customGrp.classList.add('hidden');
                modal.classList.remove('hidden');
            });
        }

        if (btnClose && modal) {
            btnClose.addEventListener('click', () => modal.classList.add('hidden'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    },

    populateCategorySelect() {
        const select = document.getElementById('eventCategorySelect');
        if (!select) return;

        const categories = Storage.getStoryCategories();
        select.innerHTML = `
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            <option value="__new__">➕ Crear Nueva Sección...</option>
        `;

        select.onchange = (e) => {
            const customGrp = document.getElementById('customCategoryInputGroup');
            if (e.target.value === '__new__') {
                if (customGrp) customGrp.classList.remove('hidden');
                document.getElementById('eventCategoryCustom')?.focus();
            } else {
                if (customGrp) customGrp.classList.add('hidden');
            }
        };
    },

    async handlePhotosSelect(e) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        this.selectedPhotos = [];
        for (const file of files) {
            try {
                const rawUrl = await this.readFileAsDataURL(file);
                const compressedUrl = await this.compressImage(rawUrl, 750, 0.65);
                this.selectedPhotos.push(compressedUrl);
            } catch (err) {
                console.warn('Error processing photo:', err);
            }
        }
        this.renderFormPhotosPreview();
    },

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    },

    compressImage(dataUrl, maxDimension = 750, quality = 0.65) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    },

    renderFormPhotosPreview() {
        const grid = document.getElementById('eventPhotosPreviewGrid');
        if (!grid) return;

        if (this.selectedPhotos.length === 0) {
            grid.classList.add('hidden');
            grid.innerHTML = '';
            return;
        }

        grid.classList.remove('hidden');
        grid.innerHTML = this.selectedPhotos.map((imgUrl, index) => `
            <div style="position:relative; width:100%; aspect-ratio:1; background:#0f0f14; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.15);">
                <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" alt="Previsualización ${index + 1}">
                <button type="button" onclick="window.Timeline && window.Timeline.removeSelectedPhoto(${index})" style="position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.85); color:#ff4d4d; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; font-size:0.85rem; font-weight:bold; display:flex; align-items:center; justify-content:center; z-index:5;">&times;</button>
            </div>
        `).join('');
    },

    removeSelectedPhoto(index) {
        this.selectedPhotos.splice(index, 1);
        this.renderFormPhotosPreview();
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value.trim();
        const date = document.getElementById('eventDate').value;
        const description = document.getElementById('eventDescription').value.trim();
        const isPinned = document.getElementById('eventIsPinned')?.checked || false;

        const categorySelect = document.getElementById('eventCategorySelect');
        let category = categorySelect ? categorySelect.value : '✨ Especiales';

        if (category === '__new__') {
            const customVal = document.getElementById('eventCategoryCustom')?.value.trim();
            if (customVal) {
                category = customVal.startsWith('🏷️') || customVal.startsWith('✈️') || customVal.startsWith('🏋️') || customVal.startsWith('🥋') || customVal.startsWith('🌹') ? customVal : `🏷️ ${customVal}`;
                Storage.addStoryCategory(category);
            } else {
                category = '✨ Especiales';
            }
        }

        // Multiple photos array
        const photos = [...this.selectedPhotos];
        const primaryPhoto = photos.length > 0 ? photos[0] : null;

        const newEvent = {
            id: 'event_' + Date.now(),
            title,
            date,
            description,
            category: category,
            photo: primaryPhoto,
            photos: photos,
            isPinned: isPinned,
            likes: 1,
            isLiked: true
        };

        try {
            Storage.addTimelineEvent(newEvent);
        } catch (err) {
            console.error('Error saving timeline event:', err);
        }

        this.selectedPhotos = [];
        const photoInput = document.getElementById('eventPhotos');
        if (photoInput) photoInput.value = '';
        this.renderFormPhotosPreview();

        const modal = document.getElementById('timelineModal');
        if (modal) modal.classList.add('hidden');

        this.render();
        if (window.Sound) window.Sound.playSuccess();

        showLuxuryNotice({
            icon: '📸',
            title: '¡PUBLICACIÓN EN NUESTRA HISTORIA!',
            message: `Momento guardado exitosamente en la sección <strong>${category}</strong>. ❤️`
        });
    },

    selectCategoryFilter(category) {
        this.selectedCategory = category;
        this.render();
    },

    promptCreateNewCategory() {
        showLuxuryPrompt({
            icon: '🏷️',
            title: 'CREAR NUEVA SECCIÓN DE ÁLBUM',
            subtitle: 'Agrega un nombre o tema para clasificar sus momentos juntos (Ej. Cine, Viajes, Cenas...)',
            placeholder: 'Ej. 🍿 Noches de Cine',
            confirmText: 'Crear Sección',
            onConfirm: (categoryName) => {
                if (categoryName && categoryName.trim()) {
                    const formatted = categoryName.trim();
                    Storage.addStoryCategory(formatted);
                    this.selectedCategory = formatted;
                    this.render();
                }
            }
        });
    },

    renderCategoryPills() {
        const container = document.getElementById('storyCategoryPills');
        if (!container) return;

        const categories = Storage.getStoryCategories();
        const isAllSelected = this.selectedCategory === 'todas';

        let html = `
            <button type="button" class="btn-text-gold" onclick="window.Timeline && window.Timeline.selectCategoryFilter('todas')" style="flex-shrink: 0; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: 1px solid ${isAllSelected ? 'var(--accent-gold)' : 'var(--border-gold-subtle)'}; background: ${isAllSelected ? 'rgba(230, 200, 117, 0.25)' : 'rgba(18, 16, 25, 0.85)'}; color: ${isAllSelected ? 'var(--accent-gold)' : 'var(--text-secondary)'}; white-space: nowrap;">
                ✨ Todas las publicaciones
            </button>
        `;

        categories.forEach(cat => {
            const isSelected = this.selectedCategory === cat;
            const safeCat = cat.replace(/'/g, "\\'");
            html += `
                <button type="button" class="btn-text-gold" onclick="window.Timeline && window.Timeline.selectCategoryFilter('${safeCat}')" style="flex-shrink: 0; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: 1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-gold-subtle)'}; background: ${isSelected ? 'rgba(230, 200, 117, 0.25)' : 'rgba(18, 16, 25, 0.85)'}; color: ${isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)'}; white-space: nowrap;">
                    ${cat}
                </button>
            `;
        });

        html += `
            <button type="button" onclick="window.Timeline && window.Timeline.promptCreateNewCategory()" style="flex-shrink: 0; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: 1px dashed var(--accent-gold); background: rgba(230, 200, 117, 0.1); color: var(--accent-gold); white-space: nowrap;">
                ➕ Nueva Sección...
            </button>
        `;

        container.innerHTML = html;
    },

    renderPostMedia(evt) {
        const photos = Array.isArray(evt.photos) && evt.photos.length > 0 
            ? evt.photos 
            : (evt.photo ? [evt.photo] : []);

        if (photos.length === 0) {
            const formattedDate = this.parseSafeDate(evt.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
            return `
                <div class="post-text-artwork">
                    <h3 class="post-artwork-title">${evt.title}</h3>
                    <span class="post-artwork-date">Nuestra Constante · ${formattedDate}</span>
                </div>
            `;
        }

        const safeTitle = (evt.title || '').replace(/'/g, "\\'");
        const safeDate = this.parseSafeDate(evt.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        const safeDesc = (evt.description || '').replace(/'/g, "\\'");
        const safeCategory = (evt.category || '✨ Especiales').replace(/'/g, "\\'");
        const photosJson = JSON.stringify(photos).replace(/"/g, '&quot;');

        // Single photo layout
        if (photos.length === 1) {
            return `
                <div class="insta-post-media" style="position:relative; cursor:pointer;" onclick="window.Timeline && window.Timeline.openAlbumLightbox(${photosJson}, 0, '${safeTitle}', '${safeDate}', '${safeDesc}', '${safeCategory}')">
                    <img src="${photos[0]}" class="post-image" alt="${evt.title}" loading="lazy">
                </div>
            `;
        }

        // Multi-photo Album grid layout
        const count = photos.length;
        let gridHtml = '';

        if (count === 2) {
            gridHtml = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:3px; height: 280px; width: 100%;">
                    ${photos.map((p, idx) => `
                        <img src="${p}" style="width:100%; height:100%; object-fit:cover; display:block; cursor:pointer;" alt="${evt.title} ${idx+1}" onclick="window.Timeline && window.Timeline.openAlbumLightbox(${photosJson}, ${idx}, '${safeTitle}', '${safeDate}', '${safeDesc}', '${safeCategory}')">
                    `).join('')}
                </div>
            `;
        } else if (count === 3) {
            gridHtml = `
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:3px; height: 300px; width: 100%;">
                    <img src="${photos[0]}" style="width:100%; height:100%; object-fit:cover; display:block; cursor:pointer;" alt="${evt.title} 1" onclick="window.Timeline && window.Timeline.openAlbumLightbox(${photosJson}, 0, '${safeTitle}', '${safeDate}', '${safeDesc}', '${safeCategory}')">
                    <div style="display:grid; grid-template-rows: 1fr 1fr; gap:3px; height:100%;">
                        <img src="${photos[1]}" style="width:100%; height:100%; object-fit:cover; display:block; cursor:pointer;" alt="${evt.title} 2" onclick="window.Timeline && window.Timeline.openAlbumLightbox(${photosJson}, 1, '${safeTitle}', '${safeDate}', '${safeDesc}', '${safeCategory}')">
                        <img src="${photos[2]}" style="width:100%; height:100%; object-fit:cover; display:block; cursor:pointer;" alt="${evt.title} 3" onclick="window.Timeline && window.Timeline.openAlbumLightbox(${photosJson}, 2, '${safeTitle}', '${safeDate}', '${safeDesc}', '${safeCategory}')">
                    </div>
                </div>
            `;
        } else {
            // 4 or more photos (2x2 grid with overlay on 4th photo)
            const remainingCount = count - 4;
            gridHtml = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:3px; height: 320px; width: 100%;">
                    ${photos.slice(0, 3).map((p, idx) => `
                        <img src="${p}" style="width:100%; height:100%; object-fit:cover; display:block; cursor:pointer;" alt="${evt.title} ${idx+1}" onclick="window.Timeline && window.Timeline.openAlbumLightbox(${photosJson}, ${idx}, '${safeTitle}', '${safeDate}', '${safeDesc}', '${safeCategory}')">
                    `).join('')}
                    <div style="position:relative; width:100%; height:100%; cursor:pointer;" onclick="window.Timeline && window.Timeline.openAlbumLightbox(${photosJson}, 3, '${safeTitle}', '${safeDate}', '${safeDesc}', '${safeCategory}')">
                        <img src="${photos[3]}" style="width:100%; height:100%; object-fit:cover; display:block;" alt="${evt.title} 4">
                        ${remainingCount > 0 ? `
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.65); color:var(--accent-gold); font-size:1.3rem; font-weight:800; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px);">
                                +${remainingCount} fotos
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        return `
            <div class="insta-post-media" style="position:relative; overflow:hidden; border-radius: 4px;">
                <span style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.85); color:var(--accent-gold); font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:12px; border:1px solid var(--border-gold-subtle); z-index:5; pointer-events:none;">
                    📸 Álbum (${count} fotos)
                </span>
                ${gridHtml}
            </div>
        `;
    },

    openAlbumLightbox(photos, initialIndex, title, date, desc, category) {
        this.lightboxPhotos = Array.isArray(photos) ? photos : [photos];
        this.lightboxCurrentIndex = initialIndex || 0;

        const modal = document.getElementById('lightboxModal');
        const titleEl = document.getElementById('lightboxTitle');
        const dateEl = document.getElementById('lightboxDate');
        const descEl = document.getElementById('lightboxDesc');
        const categoryTag = document.getElementById('lightboxCategoryTag');

        if (titleEl) titleEl.textContent = title || 'Nuestro Recuerdo';
        if (dateEl) dateEl.textContent = date || '';
        if (descEl) descEl.textContent = desc || '';
        if (categoryTag) categoryTag.textContent = category || '✨ Especiales';

        this.updateLightboxImage();
        this.renderLightboxThumbnails();

        if (modal) modal.classList.remove('hidden');
    },

    updateLightboxImage() {
        const img = document.getElementById('lightboxImg');
        const counter = document.getElementById('lightboxPhotoCounter');
        const btnPrev = document.getElementById('lightboxBtnPrev');
        const btnNext = document.getElementById('lightboxBtnNext');

        if (!this.lightboxPhotos || this.lightboxPhotos.length === 0) return;

        const currentPhoto = this.lightboxPhotos[this.lightboxCurrentIndex];
        if (img) img.src = currentPhoto;

        const total = this.lightboxPhotos.length;
        if (counter) counter.textContent = `${this.lightboxCurrentIndex + 1} / ${total}`;

        if (btnPrev) btnPrev.style.display = total > 1 ? 'flex' : 'none';
        if (btnNext) btnNext.style.display = total > 1 ? 'flex' : 'none';

        // Highlight thumbnail
        const thumbs = document.querySelectorAll('.lightbox-thumb');
        thumbs.forEach((t, i) => {
            if (i === this.lightboxCurrentIndex) {
                t.style.borderColor = 'var(--accent-gold)';
                t.style.opacity = '1';
            } else {
                t.style.borderColor = 'rgba(255,255,255,0.2)';
                t.style.opacity = '0.5';
            }
        });
    },

    renderLightboxThumbnails() {
        const container = document.getElementById('lightboxThumbnails');
        if (!container) return;

        if (this.lightboxPhotos.length <= 1) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.lightboxPhotos.map((photoUrl, idx) => `
            <div class="lightbox-thumb" onclick="window.Timeline && window.Timeline.lightboxSelectPhoto(${idx})" style="width: 54px; height: 54px; aspect-ratio: 1; border-radius: 6px; overflow: hidden; border: 2px solid ${idx === this.lightboxCurrentIndex ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}; cursor: pointer; flex-shrink: 0; opacity: ${idx === this.lightboxCurrentIndex ? '1' : '0.5'}; transition: all 0.2s ease;">
                <img src="${photoUrl}" style="width:100%; height:100%; object-fit:cover; display:block;" alt="Miniatura ${idx + 1}">
            </div>
        `).join('');
    },

    lightboxNextPhoto() {
        if (!this.lightboxPhotos || this.lightboxPhotos.length <= 1) return;
        this.lightboxCurrentIndex = (this.lightboxCurrentIndex + 1) % this.lightboxPhotos.length;
        this.updateLightboxImage();
    },

    lightboxPrevPhoto() {
        if (!this.lightboxPhotos || this.lightboxPhotos.length <= 1) return;
        this.lightboxCurrentIndex = (this.lightboxCurrentIndex - 1 + this.lightboxPhotos.length) % this.lightboxPhotos.length;
        this.updateLightboxImage();
    },

    lightboxSelectPhoto(index) {
        this.lightboxCurrentIndex = index;
        this.updateLightboxImage();
    },

    closeLightbox() {
        const modal = document.getElementById('lightboxModal');
        if (modal) modal.classList.add('hidden');
    },

    render() {
        Storage.ensureDataIntegrity();
        this.renderCategoryPills();

        const listContainer = document.getElementById('timelineEventsList');
        const statDays = document.getElementById('instaStatDays');
        const statPosts = document.getElementById('instaStatPosts');
        if (!listContainer) return;

        const startDateTimestamp = Storage.getStartDate();
        const daysElapsed = startDateTimestamp ? Math.floor((Date.now() - startDateTimestamp) / (1000 * 60 * 60 * 24)) : 0;
        if (statDays) statDays.textContent = daysElapsed;

        let events = Storage.getTimelineEvents();
        if (!events || events.length === 0) {
            const startDateTs = Storage.getStartDate() || Date.now();
            const startDateObj = new Date(startDateTs);
            const initialEvent = {
                id: 'event_begin',
                title: 'El comienzo',
                date: startDateObj.toISOString().split('T')[0],
                time: startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: 'El día en que comenzó nuestro tiempo y nuestra historia vital.',
                category: '✨ Especiales',
                isInitial: true
            };
            Storage.addTimelineEvent(initialEvent);
            events = Storage.getTimelineEvents();
        }

        if (statPosts) statPosts.textContent = events.length;

        // Filter by selected category if not 'todas'
        let filteredEvents = events;
        if (this.selectedCategory && this.selectedCategory !== 'todas') {
            filteredEvents = events.filter(e => (e.category || '✨ Especiales') === this.selectedCategory || e.isInitial);
        }

        // Sort: isInitial FIRST (absolute top!), then isPinned, then date descending
        filteredEvents.sort((a, b) => {
            if (a.isInitial && !b.isInitial) return -1;
            if (!a.isInitial && b.isInitial) return 1;

            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            return this.parseSafeDate(b.date) - this.parseSafeDate(a.date);
        });

        if (filteredEvents.length === 0) {
            listContainer.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding: 40px 20px;" class="glass-panel">
                    <span style="font-size:2.5rem; display:block; margin-bottom:8px;">📸</span>
                    <h3 style="color:var(--accent-gold); font-size:1.1rem; margin-bottom:6px;">No hay historias aún en ${this.selectedCategory}</h3>
                    <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px;">Sé el primero en compartir un momento o álbum en esta sección.</p>
                    <button type="button" class="btn-primary-luxury btn-sm" onclick="document.getElementById('btnAddTimelineEvent')?.click()">
                        <span>+ Publicar momento</span>
                    </button>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = filteredEvents.map(evt => {
            const formattedDate = this.parseSafeDate(evt.date).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const isInitialPost = evt.isInitial;
            const showPinnedTag = evt.isPinned || isInitialPost;
            const categoryTag = evt.category || '✨ Especiales';

            return `
                <div class="insta-post-card glass-panel ${showPinnedTag ? 'pinned-post' : ''}" id="post_${evt.id}" data-capsule-id="${evt.capsuleId || ''}" data-post-title="${(evt.title || '').replace(/"/g, '&quot;')}">
                    <!-- Post Header -->
                    <div class="insta-post-header">
                        <div class="post-user-info">
                            <div class="post-avatar">NC</div>
                            <div class="post-user-meta">
                                <span class="post-username">nuestraconstante</span>
                                <span class="post-location">${formattedDate} • <strong style="color:var(--accent-gold); font-weight:600;">${categoryTag}</strong></span>
                            </div>
                        </div>
                        <div class="post-actions-right">
                            ${isInitialPost 
                                ? `<span class="pinned-tag-badge" style="background: rgba(230,200,117,0.25); color: #fff;">👑 EL COMIENZO</span>`
                                : (evt.isPinned ? `<span class="pinned-tag-badge">📌 FIJADO</span>` : '')
                            }
                            ${!isInitialPost ? `
                                <button class="post-opt-btn" onclick="Timeline.togglePin('${evt.id}')" title="${evt.isPinned ? 'Desfijar' : 'Fijar arriba'}">
                                    ${evt.isPinned ? '📌' : '📍'}
                                </button>
                                <button class="post-opt-btn" onclick="Timeline.deletePost('${evt.id}')" title="Eliminar">🗑️</button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Post Media Container (Single or Multi-Photo Album) -->
                    ${this.renderPostMedia(evt)}

                    <!-- Post Action Buttons -->
                    <div class="insta-post-bar">
                        <button class="post-like-btn ${evt.isLiked ? 'liked' : ''}" onclick="Timeline.toggleLike('${evt.id}')">
                            <span class="heart-icon">${evt.isLiked ? '❤️' : '🤍'}</span>
                            <span class="like-count">${evt.likes || 1} les gusta</span>
                        </button>
                    </div>

                    <!-- Post Caption -->
                    <div class="insta-post-caption">
                        <span class="caption-username">nuestraconstante</span>
                        <strong class="caption-title">${evt.title}</strong> —
                        <span class="caption-text">${evt.description || ''}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    async togglePin(id) {
        const events = Storage.getTimelineEvents();
        const evt = events.find(e => e.id === id);
        if (!evt) return;

        evt.isPinned = !evt.isPinned;
        localStorage.setItem(Storage.KEYS.TIMELINE_EVENTS, JSON.stringify(events));
        Storage.syncToCloud();
        this.render();

        showLuxuryNotice({
            icon: '📌',
            title: evt.isPinned ? 'PUBLICACIÓN FIJADA' : 'DESFIJADA',
            message: evt.isPinned 
                ? 'Esta publicación ahora aparecerá fijada en la parte superior de nuestra historia. ❤️' 
                : 'La publicación ya no está fijada.'
        });
    },

    toggleLike(id) {
        const events = Storage.getTimelineEvents();
        const evt = events.find(e => e.id === id);
        if (!evt) return;

        evt.isLiked = !evt.isLiked;
        evt.likes = (evt.likes || 0) + (evt.isLiked ? 1 : -1);
        if (evt.likes < 0) evt.likes = 0;

        if (evt.isLiked && window.Sound) window.Sound.playHeart();

        localStorage.setItem(Storage.KEYS.TIMELINE_EVENTS, JSON.stringify(events));
        Storage.syncToCloud();
        this.render();
    },

    async deletePost(id) {
        const confirmed = await showLuxuryConfirm({
            icon: '🗑️',
            title: 'ELIMINAR PUBLICACIÓN',
            message: '¿Estás seguro de que deseas eliminar este momento de nuestra historia?',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            let events = Storage.getTimelineEvents();
            events = events.filter(e => e.id !== id);
            localStorage.setItem(Storage.KEYS.TIMELINE_EVENTS, JSON.stringify(events));
            Storage.syncToCloud();
            if (window.Sound) window.Sound.playDelete();
            this.render();
        }
    },

    parseSafeDate(d) {
        if (!d) return new Date();
        let dt = new Date(d);
        if (!isNaN(dt.getTime())) return dt;
        const clean = d.toString().split('T')[0];
        dt = new Date(clean + 'T00:00:00');
        return !isNaN(dt.getTime()) ? dt : new Date();
    },

    addAchievementPost({ title, description, photo }) {
        const newEvent = {
            id: 'timeline_ach_' + Date.now(),
            title: `🏆 ${title}`,
            date: new Date().toISOString().split('T')[0],
            description: description || `¡Medalla "${title}" desbloqueada juntos! ❤️`,
            category: '🥋 Taekwondo',
            photo: photo || null,
            photos: photo ? [photo] : [],
            isPinned: true
        };
        Storage.addTimelineEvent(newEvent);
        this.render();
    },

    addCapsulePost({ id, title, message, photo }) {
        const newEvent = {
            id: 'timeline_cap_' + Date.now(),
            capsuleId: id || null,
            title: `⌛ ${title}`,
            rawTitle: title,
            date: new Date().toISOString().split('T')[0],
            description: `✨ Cápsula del Tiempo Desbloqueada:\n\n"${message}" ❤️`,
            category: '✨ Especiales',
            photo: photo || null,
            photos: photo ? [photo] : [],
            isPinned: true
        };
        Storage.addTimelineEvent(newEvent);
        this.render();
    },

    scrollToPost(capsuleId, title) {
        this.render();
        setTimeout(() => {
            let targetCard = null;
            if (capsuleId) {
                targetCard = document.querySelector(`[data-capsule-id="${capsuleId}"]`);
            }
            if (!targetCard && title) {
                const cleanTitle = title.toLowerCase();
                const cards = document.querySelectorAll('.insta-post-card');
                cards.forEach(card => {
                    const cardTitle = (card.getAttribute('data-post-title') || '').toLowerCase();
                    if (cardTitle.includes(cleanTitle)) {
                        targetCard = card;
                    }
                });
            }
            if (!targetCard) {
                targetCard = document.querySelector('.insta-post-card');
            }

            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetCard.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease, transform 0.4s ease';
                targetCard.style.borderColor = 'var(--accent-gold)';
                targetCard.style.boxShadow = '0 0 35px rgba(230, 200, 117, 0.9)';
                targetCard.style.transform = 'scale(1.02)';

                setTimeout(() => {
                    targetCard.style.boxShadow = '';
                    targetCard.style.borderColor = '';
                    targetCard.style.transform = '';
                }, 3200);
            }
        }, 180);
    }
};

window.Timeline = Timeline;
