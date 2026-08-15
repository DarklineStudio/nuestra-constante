/* ==========================================================================
   NUESTRA CONSTANTE — TIME CAPSULES MODULE ("Cápsulas del Tiempo")
   ========================================================================== */

const Capsule = {
    list: [
        {
            id: 'cap_1month',
            title: 'Cápsula 1er Mes',
            icon: '💌',
            daysRequired: 30,
            message: '✨ "Un mes caminando a tu lado. 30 días en los que aprendí que la felicidad tiene tu sonrisa."'
        },
        {
            id: 'cap_3months',
            title: 'Cápsula 3 Meses',
            icon: '💫',
            daysRequired: 90,
            message: '👑 "90 días construyendo recuerdos, superando metas y entrenando el corazón juntos."'
        },
        {
            id: 'cap_6months',
            title: 'Cápsula 6 Meses',
            icon: '🌙',
            daysRequired: 180,
            message: '💎 "Medio año de ser mi lugar seguro. Nuestra historia es lo más hermoso que me ha pasado."'
        },
        {
            id: 'cap_1year',
            title: 'Cápsula 1er Aniversario',
            icon: '👑',
            daysRequired: 365,
            message: '🏆 "365 días juntos. Un año entero donde mi única constante vital fuiste y serás tú."'
        },
        {
            id: 'cap_500days',
            title: 'Cápsula 500 Días',
            icon: '💖',
            daysRequired: 500,
            message: '✨ "500 días de complicidad absoluta, aventuras inolvidables y amor que sigue creciendo."'
        },
        {
            id: 'cap_2years',
            title: 'Cápsula 2° Aniversario',
            icon: '🌹',
            daysRequired: 730,
            message: '👑 "730 días escribiendo nuestro libro juntos. Dos años donde confirmamos que somos el uno para el otro."'
        },
        {
            id: 'cap_1000days',
            title: 'Cápsula 1,000 Días',
            icon: '💎',
            daysRequired: 1000,
            message: '🏆 "1,000 días a tu lado. Mil motivos para seguir enamorándome de ti cada mañana."'
        },
        {
            id: 'cap_3years',
            title: 'Cápsula 3er Aniversario',
            icon: '♾️',
            daysRequired: 1095,
            message: '❤️ "Tres años caminando juntos. Nuestra promesa sigue intacta y nuestro futuro es brillante."'
        }
    ],

    getAllCapsules() {
        let custom = [];
        try {
            custom = Storage.getCustomCapsules() || [];
        } catch (e) {
            console.warn('Custom capsules load error', e);
        }
        return [...this.list, ...custom];
    },

    toggleModeUI(mode) {
        const group = document.getElementById('capDateGroup');
        const dateInput = document.getElementById('newCapDate');
        if (group) {
            if (mode === 'milestone') {
                group.classList.add('hidden');
                if (dateInput) dateInput.required = false;
            } else {
                group.classList.remove('hidden');
                if (dateInput) dateInput.required = true;
            }
        }
    },

    render() {
        const container = document.getElementById('capsulesGrid');
        if (!container) return;

        const startDateTimestamp = Storage.getStartDate();
        const daysElapsed = startDateTimestamp ? Math.floor((Date.now() - startDateTimestamp) / (1000 * 60 * 60 * 24)) : 0;
        const allCapsules = this.getAllCapsules();

        container.innerHTML = allCapsules.map(cap => {
            let isUnlocked = false;
            let daysLeft = 0;
            let statusText = '';
            const isPublished = Storage.isCapsulePublished(cap.id) || cap.isPublished || (cap.mode === 'milestone' && cap.isFulfilled);

            if (isPublished) {
                isUnlocked = true;
                statusText = '✨ Cumplida y Guardada · Ver en Historia';
            } else if (cap.mode === 'milestone') {
                isUnlocked = false;
                statusText = '🎯 Meta por Cumplir (Toca al lograrla)';
            } else if (cap.targetDate) {
                const targetTs = new Date(cap.targetDate).getTime();
                isUnlocked = Date.now() >= targetTs;
                daysLeft = Math.max(0, Math.ceil((targetTs - Date.now()) / (1000 * 60 * 60 * 24)));
                statusText = isUnlocked ? '✨ Toca para abrir y publicar' : (daysLeft > 0 ? `Faltan ${daysLeft} días` : 'Se abre hoy ✨');
            } else {
                isUnlocked = daysElapsed >= cap.daysRequired;
                daysLeft = Math.max(0, cap.daysRequired - daysElapsed);
                statusText = isUnlocked ? '✨ Toca para abrir y publicar' : `Faltan ${daysLeft} días`;
            }

            const safeId = (cap.id || '').replace(/'/g, "\\'");
            const cardStateClass = isPublished ? 'unlocked published' : (isUnlocked ? 'unlocked' : 'locked');
            const iconDisplay = isPublished ? (cap.icon || '⌛') : (isUnlocked ? (cap.icon || '⌛') : (cap.mode === 'milestone' ? '🎯' : '🔒'));

            return `
                <div class="capsule-card ${cardStateClass}" onclick="window.Capsule && window.Capsule.open('${safeId}', ${isUnlocked}, ${daysLeft})">
                    <span class="capsule-icon">${iconDisplay}</span>
                    <h4 class="capsule-title">${cap.title}</h4>
                    <span class="capsule-status">${statusText}</span>
                </div>
            `;
        }).join('');
    },

    open(id, isUnlocked, daysLeft) {
        const cap = this.getAllCapsules().find(c => c.id === id);
        if (!cap) return;

        const isPublished = Storage.isCapsulePublished(id) || cap.isPublished || (cap.mode === 'milestone' && cap.isFulfilled);

        if (isPublished) {
            const safeId = (cap.id || '').replace(/'/g, "\\'");
            showLuxuryNotice({
                icon: '🔒',
                title: '✨ CÁPSULA CUMPLIDA & GUARDADA',
                message: `
                    <div style="text-align:center; padding:10px 0;">
                        <span style="font-size:0.85rem; color:var(--accent-gold); font-weight:700; text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:8px;">${cap.title}</span>
                        <p style="font-family:var(--font-serif); font-size:1.25rem; font-style:italic; color:var(--accent-gold-light); line-height:1.5; margin:0 0 14px 0;">"${cap.message}"</p>
                        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">🔒 Esta cápsula ya fue cumplida y guardada por siempre en nuestra historia. Su contenido está sellado contra edición como legado inolvidable. ❤️</p>
                        <br>
                        <button type="button" class="btn-primary-luxury full-width" onclick="window.Capsule && window.Capsule.goToHistory('${safeId}')">
                            <span>📖 Ver publicación en Nuestra Historia</span>
                        </button>
                    </div>
                `
            });
            return;
        }

        if (cap.mode === 'milestone' && !cap.isFulfilled) {
            this.openPhotoModal(id);
            return;
        }

        if (isUnlocked) {
            this.openPhotoModal(id);
        } else {
            showLuxuryNotice({
                icon: '🔒',
                title: `${cap.title} (Sellada)`,
                message: `Esta cápsula secreta del tiempo se abrirá automáticamente en <strong>${daysLeft > 0 ? daysLeft + ' días' : 'unas horas'}</strong> cuando llegue esa fecha tan esperada. ❤️`
            });
        }
    },

    goToHistory(capId) {
        const cap = capId ? this.getAllCapsules().find(c => c.id === capId) : null;
        const noticeModal = document.getElementById('premiumNoticeModal');
        if (noticeModal) {
            noticeModal.classList.add('hidden');
            noticeModal.style.display = 'none';
        }

        const navBtn = document.querySelector('.nav-item[data-tab="timeline"]') || document.querySelector('.nav-item[data-tab="historia"]');
        if (navBtn) navBtn.click();

        const targetTimeline = window.Timeline || (typeof Timeline !== 'undefined' ? Timeline : null);
        if (targetTimeline && typeof targetTimeline.scrollToPost === 'function') {
            targetTimeline.scrollToPost(capId, cap ? cap.title : null);
        }
    },

    openPhotoModal(id) {
        const noticeModal = document.getElementById('premiumNoticeModal');
        if (noticeModal) {
            noticeModal.classList.add('hidden');
            noticeModal.style.display = 'none';
        }

        const cap = this.getAllCapsules().find(c => c.id === id);
        if (!cap) return;

        const modal = document.getElementById('unlockCapsulePhotoModal');
        const idElem = document.getElementById('capPhotoModalId');
        const iconElem = document.getElementById('capPhotoModalIcon');
        const titleElem = document.getElementById('capPhotoModalTitle');
        const noteElem = document.getElementById('capPhotoNote');
        const fileInput = document.getElementById('capPhotoModalInput');

        if (idElem) idElem.value = id;
        if (iconElem) iconElem.textContent = cap.icon || '⌛';
        if (titleElem) titleElem.textContent = cap.title;
        if (noteElem) noteElem.value = cap.message;
        if (fileInput) fileInput.value = '';

        this.removePhotoPreview();

        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    },

    closePhotoModal() {
        const modal = document.getElementById('unlockCapsulePhotoModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        this.removePhotoPreview();
    },

    handlePhotoPreview(e) {
        const file = e.target.files ? e.target.files[0] : null;
        const previewBox = document.getElementById('capPhotoPreviewBox');
        const previewImg = document.getElementById('capPhotoPreviewImg');

        if (file && previewBox && previewImg) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                previewImg.src = evt.target.result;
                previewBox.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    },

    removePhotoPreview() {
        const fileInput = document.getElementById('capPhotoModalInput');
        const previewBox = document.getElementById('capPhotoPreviewBox');
        const previewImg = document.getElementById('capPhotoPreviewImg');

        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (previewBox) previewBox.classList.add('hidden');
    },

    confirmPublishWithPhoto(e) {
        if (e) e.preventDefault();
        const id = document.getElementById('capPhotoModalId')?.value;
        const cap = this.getAllCapsules().find(c => c.id === id);
        if (!cap) return;

        const note = document.getElementById('capPhotoNote')?.value.trim() || cap.message;
        const fileInput = document.getElementById('capPhotoModalInput');
        const file = fileInput && fileInput.files ? fileInput.files[0] : null;

        // Mark capsule as permanently published & sealed against editing
        Storage.markCapsulePublished(id);

        if (cap.mode === 'milestone') {
            cap.isFulfilled = true;
            const custom = Storage.getCustomCapsules() || [];
            const index = custom.findIndex(c => c.id === id);
            if (index !== -1) {
                custom[index].isFulfilled = true;
                custom[index].isPublished = true;
                custom[index].fulfilledDate = new Date().toISOString();
                localStorage.setItem('nuestraconstante_customCapsules', JSON.stringify(custom));
                Storage.syncToCloud();
            }
        }

        const publishPost = (photoDataUrl = null) => {
            const targetTimeline = window.Timeline || (typeof Timeline !== 'undefined' ? Timeline : null);
            if (targetTimeline && typeof targetTimeline.addCapsulePost === 'function') {
                targetTimeline.addCapsulePost({
                    title: cap.title,
                    message: note,
                    photo: photoDataUrl
                });
            }

            this.closePhotoModal();
            this.render();

            // Auto-navigate to timeline tab
            const navBtn = document.querySelector('.nav-item[data-tab="timeline"]') || document.querySelector('.nav-item[data-tab="historia"]');
            if (navBtn) navBtn.click();

            showLuxuryNotice({
                icon: '📸',
                title: '¡CÁPSULA PUBLICADA EN NUESTRA HISTORIA!',
                message: `La cápsula <strong>"${cap.title}"</strong> se ha publicado y fijado arriba en <strong>Nuestra Historia</strong>. 📸❤️`
            });
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxDim = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    publishPost(compressedDataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            publishPost(null);
        }
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const btnOpen = document.getElementById('btnOpenCreateCapsule');
        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                if (e) e.preventDefault();
                Capsule.openCreateModal();
            });
        }
    },

    openCreateModal() {
        const modal = document.getElementById('createCapsuleModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    },

    closeCreateModal() {
        const modal = document.getElementById('createCapsuleModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    },

    handleCreate(e) {
        if (e) e.preventDefault();
        const titleElem = document.getElementById('newCapTitle');
        const dateElem = document.getElementById('newCapDate');
        const messageElem = document.getElementById('newCapMessage');
        const modeElem = document.querySelector('input[name="capMode"]:checked');

        const mode = modeElem ? modeElem.value : 'date';
        const title = titleElem ? titleElem.value.trim() : '';
        const targetDate = (mode === 'date' && dateElem) ? dateElem.value : null;
        const message = messageElem ? messageElem.value.trim() : '';

        if (!title || !message) return;
        if (mode === 'date' && !targetDate) return;

        const newCapsule = {
            id: 'custom_cap_' + Date.now(),
            title,
            icon: mode === 'milestone' ? '🎯' : '⌛',
            mode,
            targetDate,
            isFulfilled: false,
            message
        };

        Storage.addCustomCapsule(newCapsule);
        this.closeCreateModal();
        this.render();

        if (titleElem) titleElem.value = '';
        if (dateElem) dateElem.value = '';
        if (messageElem) messageElem.value = '';

        showLuxuryNotice({
            icon: mode === 'milestone' ? '🎯' : '🔒',
            title: mode === 'milestone' ? '¡META REGISTRADA EN NUESTRAS CÁPSULAS!' : '¡CÁPSULA SELLADA AL FUTURO!',
            message: mode === 'milestone' 
                ? `La meta <strong>"${title}"</strong> se ha guardado como cápsula. Al cumplirla juntos, podrán abrirla y publicar el mensaje en nuestra historia. ❤️`
                : `La cápsula <strong>"${title}"</strong> se ha guardado bajo candado. Se abrirá automáticamente cuando llegue la fecha programada. ❤️`
        });
    }
};

window.Capsule = Capsule;
window.openCreateCapsuleModal = function() {
    if (window.Capsule) window.Capsule.openCreateModal();
};
window.closeCreateCapsuleModal = function() {
    if (window.Capsule) window.Capsule.closeCreateModal();
};
