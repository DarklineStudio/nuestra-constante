/* ==========================================================================
   OUR TIME — MAIN APPLICATION LAUNCHER & ROUTER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    init() {
        this.purgeStaleCache();
        Storage.initCloud();
        this.updateBrandTexts();
        this.initAmbientCanvas();
        this.bindNavigation();
        this.registerServiceWorker();

        // Check if relationship already started
        const startDate = Storage.getStartDate();

        if (startDate) {
            Storage.ensureDataIntegrity();
            // Already accepted -> Show Main App directly
            document.getElementById('introSection').classList.add('hidden');
            document.getElementById('mainSection').classList.remove('hidden');
            document.getElementById('bottomNav').classList.remove('hidden');

            Counter.start();
            Timeline.init();
            Timeline.render();
            Painting.init();
            Training.init();
            Training.render();
            Capsule.init();
            Capsule.render();
            Music.init();
            Letter.init();
            Vitals.startEcg();
        } else {
            // Not accepted yet -> Show Fullscreen Intro sequence
            Intro.init();
            Timeline.init();
            Painting.init();
            Training.init();
            Capsule.init();
            Music.init();
            Letter.init();
            Intro.startSequence();
        }
    },

    purgeStaleCache() {
        const CURRENT_VER = '2026.08.15';
        try {
            const savedVer = localStorage.getItem('nuestraconstante_app_version');
            if (savedVer !== CURRENT_VER) {
                console.log('[Anti-Cache Shield] Clearing stale cache for version update:', CURRENT_VER);
                if ('caches' in window) {
                    caches.keys().then(names => {
                        for (let name of names) caches.delete(name);
                    });
                }
                localStorage.setItem('nuestraconstante_app_version', CURRENT_VER);
            }
        } catch (e) {}
    },

    updateBrandTexts() {
        try {
            document.title = `${AppConfig.appName} — ${AppConfig.tagline}`;
            
            const titleElements = document.querySelectorAll('.header-title, .brand-title, .letter-brand');
            titleElements.forEach(el => {
                if (el) el.textContent = AppConfig.appName;
            });

            const taglineHeader = document.querySelector('.header-tagline');
            if (taglineHeader) taglineHeader.textContent = AppConfig.tagline;

            const taglineBrand = document.querySelector('.brand-tagline');
            if (taglineBrand) taglineBrand.textContent = `"${AppConfig.tagline}"`;

            const letterStamp = document.getElementById('letterDateStamp');
            if (letterStamp) letterStamp.textContent = AppConfig.tagline;
        } catch (e) {
            console.log('Brand text update error:', e);
        }
    },

    bindNavigation() {
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTab = item.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        const btnReset = document.getElementById('btnResetIntro');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.confirmDeliveryReset());
        }
    },

    async confirmDeliveryReset() {
        const confirmed = await showLuxuryConfirm({
            icon: '🎁',
            title: 'PREPARAR ENTREGA A ELLA',
            message: '¿Deseas reiniciar la aplicación para que vuelva a la pantalla de la propuesta inicial?<br><br>Al entregársela a ella y presionar <strong>"SÍ, ACEPTO ❤️"</strong>, el tiempo oficial comenzará a correr en vivo a partir de ese segundo exacto.',
            confirmText: 'Sí, reiniciar para entrega',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            Storage.resetForDelivery();
        }
    },

    switchTab(tabId) {
        // Update navigation UI
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update tab views
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.classList.add('hidden');
        });

        const activeTab = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
        if (activeTab) {
            activeTab.classList.remove('hidden');
        }

        // Trigger specific component refresh if needed
        if (tabId === 'historia' || tabId === 'timeline') {
            Timeline.init();
            Timeline.render();
        } else if (tabId === 'pintura') {
            Painting.setupCanvasDimensions();
            Painting.switchCanvasMode(Painting.currentCanvasMode || 'constellation');
            Painting.renderMuseumGallery();
            Painting.updateRoadmap();
        } else if (tabId === 'nosotros') {
            Vitals.startEcg();
            Training.render();
            Capsule.render();
        } else if (tabId === 'musica') {
            Music.render();
        }
    },

    // Background Ambient Sparkles
    ambientAnimId: null,
    initAmbientCanvas() {
        const canvas = document.getElementById('ambientCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (this.ambientAnimId) {
            cancelAnimationFrame(this.ambientAnimId);
            this.ambientAnimId = null;
        }

        let stars = [];
        const numStars = 45;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.5,
                    alpha: Math.random(),
                    speed: Math.random() * 0.01 + 0.003
                });
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                star.alpha += star.speed;
                if (star.alpha > 1 || star.alpha < 0) {
                    star.speed = -star.speed;
                }

                ctx.save();
                ctx.globalAlpha = Math.abs(star.alpha) * 0.7;
                ctx.fillStyle = '#e6c875';
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            this.ambientAnimId = requestAnimationFrame(draw);
        };

        draw();
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('PWA ServiceWorker registrado:', reg.scope))
                .catch(err => console.log('PWA ServiceWorker error:', err));
        }
    }
};

// Global Helper Functions replacing browser alert() and confirm() with Luxury Modal
function showLuxuryNotice({ title = 'NUESTRA CONSTANTE', message, icon = '✨', confirmText = 'Entendido ❤️' }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('premiumNoticeModal');
        const iconElem = document.getElementById('noticeIcon');
        const titleElem = document.getElementById('noticeTitle');
        const msgElem = document.getElementById('noticeMessage');
        const btnConfirm = document.getElementById('btnConfirmNotice');
        const btnCancel = document.getElementById('btnCancelNotice');
        const btnClose = document.getElementById('btnCloseNoticeModal');

        if (!modal) {
            alert(message);
            resolve(true);
            return;
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        if (iconElem) iconElem.textContent = icon;
        if (titleElem) titleElem.textContent = title;
        if (msgElem) msgElem.innerHTML = typeof message === 'string' ? message.replace(/\n/g, '<br>') : message;
        if (btnConfirm && btnConfirm.querySelector('span')) {
            btnConfirm.querySelector('span').textContent = confirmText;
        }
        if (btnCancel) btnCancel.classList.add('hidden');

        const close = () => {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            if (btnConfirm) btnConfirm.onclick = null;
            if (btnClose) btnClose.onclick = null;
            resolve(true);
        };

        if (btnConfirm) btnConfirm.onclick = close;
        if (btnClose) btnClose.onclick = close;
    });
}

function showLuxuryConfirm({ title = 'NUESTRA CONSTANTE', message, icon = '❓', confirmText = 'Sí ❤️', cancelText = 'Cancelar' }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('premiumNoticeModal');
        const iconElem = document.getElementById('noticeIcon');
        const titleElem = document.getElementById('noticeTitle');
        const msgElem = document.getElementById('noticeMessage');
        const btnConfirm = document.getElementById('btnConfirmNotice');
        const btnCancel = document.getElementById('btnCancelNotice');
        const btnClose = document.getElementById('btnCloseNoticeModal');

        if (!modal) {
            const res = confirm(message);
            resolve(res);
            return;
        }

        iconElem.textContent = icon;
        titleElem.textContent = title;
        msgElem.innerHTML = message.replace(/\n/g, '<br>');
        btnConfirm.querySelector('span').textContent = confirmText;
        btnCancel.querySelector('span').textContent = cancelText;
        btnCancel.classList.remove('hidden');

        const cleanup = () => {
            modal.classList.add('hidden');
            btnConfirm.removeEventListener('click', onConfirm);
            btnCancel.removeEventListener('click', onCancel);
            btnClose.removeEventListener('click', onCancel);
        };

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        btnConfirm.addEventListener('click', onConfirm);
        btnCancel.addEventListener('click', onCancel);
        btnClose.addEventListener('click', onCancel);
        modal.classList.remove('hidden');
    });
}

function showLuxuryPrompt({ title = 'Escribir mensaje', subtitle = 'Redacta un mensaje especial para ella', icon = '✍️' } = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('premiumPromptModal');
        const form = document.getElementById('formLuxuryPrompt');
        const titleInput = document.getElementById('promptInputTitle');
        const textInput = document.getElementById('promptInputText');
        const btnCancel = document.getElementById('btnCancelPrompt');
        const btnClose = document.getElementById('btnClosePromptModal');

        if (!modal || !form) {
            resolve(null);
            return;
        }

        // Reset inputs
        titleInput.value = '';
        textInput.value = '';

        const cleanup = () => {
            modal.classList.add('hidden');
            form.removeEventListener('submit', onSubmit);
            if (btnCancel) btnCancel.removeEventListener('click', onCancel);
            if (btnClose) btnClose.removeEventListener('click', onCancel);
        };

        const onSubmit = (e) => {
            e.preventDefault();
            const valTitle = titleInput.value.trim();
            const valText = textInput.value.trim();
            cleanup();
            if (valTitle && valText) {
                resolve({ title: valTitle, text: valText });
            } else {
                resolve(null);
            }
        };

        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        form.addEventListener('submit', onSubmit);
        if (btnCancel) btnCancel.addEventListener('click', onCancel);
        if (btnClose) btnClose.addEventListener('click', onCancel);

        modal.classList.remove('hidden');
        titleInput.focus();
    });
}

// Global helper function for inline onclick handlers
function switchTab(tabId) {
    App.switchTab(tabId);
}
