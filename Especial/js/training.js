/* ==========================================================================
   OUR TIME — TRAINING & ACHIEVEMENTS MODULE ("Nuestro Entrenamiento")
   ========================================================================== */

const Training = {
    getAllAchievements() {
        const custom = Storage.getCustomAchievements() || [];
        return [...AppConfig.achievements, ...custom];
    },

    render() {
        const listContainer = document.getElementById('achievementsList');
        if (!listContainer) return;

        const startDateTimestamp = Storage.getStartDate();
        const hoursElapsed = startDateTimestamp ? (Date.now() - startDateTimestamp) / (1000 * 60 * 60) : 0;
        const daysElapsed = Math.floor(hoursElapsed / 24);
        const state = Storage.getAchievementsState();
        const allAchievements = this.getAllAchievements();

        listContainer.innerHTML = allAchievements.map(ach => {
            let isUnlocked = false;
            let dateUnlocked = null;

            // Check auto unlock conditions
            if (ach.id === 'begin' && startDateTimestamp) {
                isUnlocked = true;
                dateUnlocked = startDateTimestamp;
            } else if (ach.autoUnlock === 'days:30' && daysElapsed >= 30) {
                isUnlocked = true;
            } else if (ach.autoUnlock === 'days:365' && daysElapsed >= 365) {
                isUnlocked = true;
            }

            // Check manual persisted state
            if (state[ach.id] && state[ach.id].unlocked) {
                isUnlocked = true;
                dateUnlocked = state[ach.id].date;
            }

            let formattedUnlockDate = '';
            if (isUnlocked) {
                const targetDate = dateUnlocked || startDateTimestamp || Date.now();
                formattedUnlockDate = new Date(targetDate).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }

            return `
                <div class="medal-card-3d ${isUnlocked ? 'unlocked' : 'locked'}" onclick="Training.toggleUnlock('${ach.id}', ${isUnlocked})">
                    <div class="medal-ribbon"></div>
                    <span class="medal-icon-3d">${isUnlocked ? ach.icon : '🔒'}</span>
                    <h4 class="medal-title">${isUnlocked ? ach.title : (ach.lockedText || ach.title)}</h4>
                    <span class="medal-tag">${isUnlocked ? `🏆 Cumplido · ${formattedUnlockDate}` : '🔒 Medalla Bloqueada'}</span>
                </div>
            `;
        }).join('');

        this.updateBeltProgress(hoursElapsed);
    },

    updateBeltProgress(hoursElapsed) {
        const badge = document.getElementById('beltCurrentBadge');
        const days = Math.floor(hoursElapsed / 24);
        const segments = [
            { id: 'beltSeg0', name: '⚪ Cinto Blanco', minDays: 0, maxDays: 30 },
            { id: 'beltSeg1', name: '🟡 Cinto Amarillo', minDays: 30, maxDays: 90 },
            { id: 'beltSeg2', name: '🟢 Cinto Verde', minDays: 90, maxDays: 180 },
            { id: 'beltSeg3', name: '🔵 Cinto Azul', minDays: 180, maxDays: 270 },
            { id: 'beltSeg4', name: '🔴 Cinto Rojo', minDays: 270, maxDays: 365 },
            { id: 'beltSeg5', name: '⬛ Cinto Negro Eterno', minDays: 365, maxDays: 365 }
        ];

        let currentName = '⚪ Cinto Blanco';
        let currentSeg = segments[0];

        segments.forEach((seg) => {
            const el = document.getElementById(seg.id);
            if (days >= seg.minDays) {
                if (el) el.classList.add('active');
                currentName = seg.name;
                currentSeg = seg;
            } else {
                if (el) el.classList.remove('active');
            }
        });

        // Calculate exact progress % based on hours elapsed
        let percent = 100;
        if (days < 365) {
            const rangeHours = (currentSeg.maxDays - currentSeg.minDays) * 24;
            const elapsedInSegHours = hoursElapsed - (currentSeg.minDays * 24);
            percent = Math.max(1, Math.min(100, Math.floor((elapsedInSegHours / rangeHours) * 100)));
        }

        const dayDisplay = Math.min(30, days + 1);

        if (badge) {
            badge.textContent = `${currentName} · Día ${dayDisplay} de 30 (${days >= 365 ? '100%' : percent + '% de progreso'})`;
        }
    },

    async toggleUnlock(id, currentUnlockedState) {
        const ach = this.getAllAchievements().find(a => a.id === id);
        if (!ach) return;

        if (id === 'begin') {
            showLuxuryNotice({
                icon: '🏆',
                title: 'El Comienzo',
                message: 'El logro <strong>"El comienzo"</strong> fue marcado de por vida el día oficial en que comenzó nuestra historia. ❤️'
            });
            return;
        }

        if (currentUnlockedState) {
            const state = Storage.getAchievementsState();
            const dateUnlocked = (state[id] && state[id].date) || Storage.getStartDate() || Date.now();
            const formattedDate = new Date(dateUnlocked).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            showLuxuryNotice({
                icon: ach.icon || '🏆',
                title: `MEDALLA LOGRADA: "${ach.title}"`,
                message: `
                    <div style="text-align:center; padding: 8px 0;">
                        <p style="font-size:1.05rem; color:var(--text-primary); line-height:1.5;">${ach.desc}</p>
                        <br>
                        <span style="font-size:0.92rem; color:var(--accent-gold); font-weight:600; display:block;">
                            ✨ Medalla de honor guardada para siempre en nuestra historia.
                        </span>
                        <span style="font-size:0.8rem; color:var(--text-muted); display:block; margin-top:8px;">
                            Cumplida el ${formattedDate} ❤️
                        </span>
                    </div>
                `
            });
            return;
        } else {
            this.openUnlockModal(id);
        }
    },

    openUnlockModal(id) {
        const ach = this.getAllAchievements().find(a => a.id === id);
        if (!ach) return;

        const modal = document.getElementById('unlockAchievementModal');
        const iconElem = document.getElementById('achModalIcon');
        const titleElem = document.getElementById('achModalTitle');
        const descElem = document.getElementById('achModalDesc');
        const idElem = document.getElementById('achModalId');
        const photoInput = document.getElementById('achModalPhotoInput');
        const noteElem = document.getElementById('achModalNote');

        if (!modal) return;

        if (iconElem) iconElem.textContent = ach.icon || '🏆';
        if (titleElem) titleElem.textContent = `Desbloquear "${ach.title}"`;
        if (descElem) descElem.textContent = ach.desc;
        if (idElem) idElem.value = id;
        if (photoInput) photoInput.value = '';
        if (noteElem) noteElem.value = '';

        Training.removePhotoPreview();
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const btnOpen = document.getElementById('btnOpenCreateAchievement');
        const btnReset = document.getElementById('btnResetAchievements');

        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                if (e) e.preventDefault();
                Training.openCreateAchievementModal();
            });
        }

        if (btnReset) {
            btnReset.addEventListener('click', (e) => {
                if (e) e.preventDefault();
                Training.resetAllToLocked();
            });
        }
    },

    openCreateAchievementModal() {
        const modal = document.getElementById('createAchievementModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    },

    closeCreateAchievementModal() {
        const modal = document.getElementById('createAchievementModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    },

    handleCreateAchievement(e) {
        if (e) e.preventDefault();
        const iconElem = document.getElementById('newAchIcon');
        const titleElem = document.getElementById('newAchTitle');
        const descElem = document.getElementById('newAchDesc');

        const icon = iconElem ? iconElem.value.trim() || '🎯' : '🎯';
        const title = titleElem ? titleElem.value.trim() : '';
        const desc = descElem ? descElem.value.trim() : '';

        if (!title || !desc) return;

        const newAch = {
            id: 'custom_ach_' + Date.now(),
            icon,
            title,
            desc,
            lockedText: title,
            autoUnlock: 'manual'
        };

        Storage.addCustomAchievement(newAch);
        this.closeCreateAchievementModal();
        this.render();

        if (titleElem) titleElem.value = '';
        if (descElem) descElem.value = '';

        showLuxuryNotice({
            icon: icon,
            title: '¡NUEVO RETO AGREGADO!',
            message: `Se ha propuesto el nuevo reto <strong>"${title}"</strong> en nuestro entrenamiento. ¡A cumplirlo juntos! 🥋❤️`
        });
    },

    closeUnlockModal() {
        const modal = document.getElementById('unlockAchievementModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        Training.removePhotoPreview();
    },

    handlePhotoPreview(e) {
        const fileInput = e.target;
        const previewBox = document.getElementById('achModalPhotoPreviewBox');
        const previewImg = document.getElementById('achModalPhotoPreviewImg');

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (previewImg) previewImg.src = evt.target.result;
                if (previewBox) previewBox.classList.remove('hidden');
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    },

    removePhotoPreview() {
        const fileInput = document.getElementById('achModalPhotoInput');
        const previewBox = document.getElementById('achModalPhotoPreviewBox');
        const previewImg = document.getElementById('achModalPhotoPreviewImg');

        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (previewBox) previewBox.classList.add('hidden');
    },

    confirmUnlock(e) {
        if (e) e.preventDefault();
        const idElem = document.getElementById('achModalId');
        const id = idElem ? idElem.value : '';
        const ach = Training.getAllAchievements().find(a => a.id === id);
        if (!ach) return;

        const photoInput = document.getElementById('achModalPhotoInput');
        const noteElem = document.getElementById('achModalNote');
        const note = noteElem ? noteElem.value.trim() : '';

        const processSave = (photoDataUrl = null) => {
            // Save state
            Storage.saveAchievementState(id, true, new Date().toISOString(), photoDataUrl);

            // Automatically post to Nuestra Historia feed!
            const targetTimeline = window.Timeline || (typeof Timeline !== 'undefined' ? Timeline : null);
            if (targetTimeline && typeof targetTimeline.addAchievementPost === 'function') {
                targetTimeline.addAchievementPost({
                    title: ach.title,
                    description: note || `${ach.desc} ❤️`,
                    photo: photoDataUrl
                });
            }

            Training.render();
            Training.closeUnlockModal();

            showLuxuryNotice({
                icon: ach.icon || '🏆',
                title: '¡MEDALLA LOGRADA Y PUBLICADA!',
                message: `¡Felicitaciones! Se ha desbloqueado la medalla <strong>"${ach.title}"</strong> y se ha creado una publicación en <strong>"Nuestra Historia"</strong>. 📸❤️`
            });
        };

        const compressPhoto = (file) => {
            return new Promise((resolve) => {
                if (!file || !file.type.startsWith('image/')) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxDim = 800;

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
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.75));
                    };
                    img.onerror = () => resolve(e.target.result);
                    img.src = e.target.result;
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            });
        };

        if (photoInput && photoInput.files && photoInput.files[0]) {
            compressPhoto(photoInput.files[0]).then(compressedUrl => {
                processSave(compressedUrl);
            }).catch(() => processSave(null));
        } else {
            processSave(null);
        }
    },

    resetAllToLocked() {
        Storage.clearAchievements();
        this.render();
        showLuxuryNotice({
            icon: '🔒',
            title: 'MEDALLAS BLOQUEADAS',
            message: 'Las medallas se han vuelto a bloquear para que puedas realizar la prueba de subida de fotos y publicación en "Nuestra Historia". ❤️'
        });
    }
};

window.Training = Training;

// Immediately clear stored achievements once for user test
try {
    Storage.clearAchievements();
} catch (e) {}
