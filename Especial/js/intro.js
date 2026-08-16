/* ==========================================================================
   OUR TIME — INTRO SEQUENCE & PROPOSAL MODULE
   ========================================================================== */

const Intro = {
    particles: [],
    animId: null,
    stepTimer1: null,
    stepTimer2: null,
    currentStep: 1,

    init() {
        this.bindEvents();
        this.initParticleCanvas();
    },

    openHearItModal() {
        const hearItModal = document.getElementById('hearItModal');
        if (hearItModal) hearItModal.classList.remove('hidden');
    },

    closeHearItModal() {
        const hearItModal = document.getElementById('hearItModal');
        if (hearItModal) hearItModal.classList.add('hidden');
    },

    bindEvents() {
        if (this.bound) return;
        this.bound = true;

        const btnStartIntro = document.getElementById('btnStartIntro');
        const btnYes = document.getElementById('btnYes');
        const btnHearIt = document.getElementById('btnHearIt');
        const btnCloseHearIt = document.getElementById('btnCloseHearIt');
        const hearItModal = document.getElementById('hearItModal');
        const introSection = document.getElementById('introSection');

        if (btnStartIntro) {
            btnStartIntro.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToStep4();
            });
        }

        if (btnHearIt) {
            btnHearIt.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openHearItModal();
            });
        }

        if (btnCloseHearIt) {
            btnCloseHearIt.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeHearItModal();
            });
        }

        if (hearItModal) {
            const backdrop = hearItModal.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.closeHearItModal());
            }
        }

        if (btnYes) {
            btnYes.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleYesClick();
            });
        }

        const handleIntroTap = (e) => {
            if (!introSection || introSection.classList.contains('hidden')) return;
            if (e.target.closest('button') || e.target.closest('.modal-card')) return;

            if (this.currentStep === 1) {
                this.advanceToStep2();
            } else if (this.currentStep === 2) {
                this.advanceToStep3();
            } else if (this.currentStep === 3) {
                this.goToStep4();
            } else if (this.currentStep === 4) {
                this.advanceToStep5();
            }
        };

        if (introSection) {
            introSection.addEventListener('click', handleIntroTap);
        }
    },

    startSequence() {
        this.currentStep = 1;
        document.getElementById('introStep1')?.classList.remove('hidden');
        document.getElementById('introStep2')?.classList.add('hidden');
        document.getElementById('introStep3')?.classList.add('hidden');
        document.getElementById('introStep4')?.classList.add('hidden');
        document.getElementById('introStep5')?.classList.add('hidden');

        if (this.stepTimer1) clearTimeout(this.stepTimer1);
        if (this.stepTimer2) clearTimeout(this.stepTimer2);

        // Auto timers for sequence
        this.stepTimer1 = setTimeout(() => {
            if (this.currentStep === 1) this.advanceToStep2();
        }, 1800);

        this.stepTimer2 = setTimeout(() => {
            if (this.currentStep === 2 || this.currentStep === 1) this.advanceToStep3();
        }, 3600);
    },

    advanceToStep2() {
        if (this.stepTimer1) clearTimeout(this.stepTimer1);
        this.currentStep = 2;
        document.getElementById('introStep1')?.classList.add('hidden');
        document.getElementById('introStep2')?.classList.remove('hidden');
    },

    advanceToStep3() {
        if (this.stepTimer2) clearTimeout(this.stepTimer2);
        this.currentStep = 3;
        document.getElementById('introStep1')?.classList.add('hidden');
        document.getElementById('introStep2')?.classList.add('hidden');
        document.getElementById('introStep3')?.classList.remove('hidden');
    },

    goToStep4() {
        this.currentStep = 4;
        document.getElementById('introStep3')?.classList.add('hidden');
        document.getElementById('introStep4')?.classList.remove('hidden');

        this.stepTimer1 = setTimeout(() => {
            if (this.currentStep === 4) this.advanceToStep5();
        }, 2500);
    },

    advanceToStep5() {
        if (this.stepTimer1) clearTimeout(this.stepTimer1);
        this.currentStep = 5;
        document.getElementById('introStep4')?.classList.add('hidden');
        document.getElementById('introStep5')?.classList.remove('hidden');
    },

    async handleYesClick() {
        this.currentStep = 6;
        const exactTimestamp = Date.now();
        
        // Persist startDate permanently to cloud & local storage
        await Storage.setStartDate(exactTimestamp);

        // Add auto initial timeline event if missing
        if (Storage.getTimelineEvents().length === 0) {
            const startDateObj = new Date(exactTimestamp);
            await Storage.addTimelineEvent({
                id: 'event_begin',
                title: 'El comienzo',
                date: startDateObj.toISOString().split('T')[0],
                time: startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: 'El día en que comenzó nuestro tiempo.',
                isInitial: true
            });
        }

        // Unlock first achievement
        await Storage.saveAchievementState('begin', true, new Date().toISOString());

        // Hide Step 5 and show Step 6 celebration
        document.getElementById('introStep5')?.classList.add('hidden');
        document.getElementById('introStep6')?.classList.remove('hidden');

        // Launch celebratory golden particles
        this.explodeGoldParticles();

        // After celebration transition, switch to Main App
        setTimeout(() => {
            this.transitionToMainApp();
        }, 3800);
    },

    transitionToMainApp() {
        const introSec = document.getElementById('introSection');
        if (introSec) introSec.style.opacity = '0';
        setTimeout(() => {
            if (introSec) introSec.style.opacity = '1';
            if (window.App && window.App.showMainDashboard) {
                window.App.showMainDashboard();
            }
        }, 600);
    },

    // Elegant Canvas Gold Particles Explosion
    initParticleCanvas() {
        this.canvas = document.getElementById('particlesCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    explodeGoldParticles() {
        if (!this.canvas) return;
        this.particles = [];
        const count = 90;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 1.5;
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                radius: Math.random() * 3 + 1,
                color: Math.random() > 0.3 ? '#e6c875' : '#ffffff',
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008
            });
        }

        this.animateParticles();
    },

    animateParticles() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let activeCount = 0;
        this.particles.forEach(p => {
            if (p.alpha > 0) {
                activeCount++;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // soft gravity
                p.alpha -= p.decay;

                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.fillStyle = p.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#e6c875';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });

        if (activeCount > 0) {
            this.animId = requestAnimationFrame(() => this.animateParticles());
        }
    }
};
