/* ==========================================================================
   NUESTRA CONSTANTE — DUAL SYNTH & HTML5 AUDIO ENGINE (100% iPhone Compatible)
   ========================================================================== */

const Sound = {
    audioCtx: null,

    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
        return this.audioCtx;
    },

    init() {
        const unlock = () => {
            const ctx = this.getAudioContext();
            if (ctx && ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            // Pre-play silent micro audio HTML5 element for iOS Safari
            try {
                const a = new Audio();
                a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
                a.volume = 0.01;
                a.play().catch(() => {});
            } catch (e) {}

            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('touchend', unlock);
            window.removeEventListener('click', unlock);
        };

        window.addEventListener('touchstart', unlock, { passive: true });
        window.addEventListener('touchend', unlock, { passive: true });
        window.addEventListener('click', unlock, { passive: true });

        this.bindGlobalButtonSound();
    },

    bindGlobalButtonSound() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button, .nav-item, .btn-text-gold, .btn-primary-luxury, .btn-secondary-luxury');
            if (btn) {
                this.playClick();
            }
        });
    },

    playTone(freqList, duration = 0.15, gainVal = 0.15, type = 'sine') {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const freqs = Array.isArray(freqList) ? freqList : [freqList];
            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

                gain.gain.setValueAtTime(gainVal, ctx.currentTime + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.05);
                osc.stop(ctx.currentTime + idx * 0.05 + duration);
            });
        } catch (e) {}
    },

    playClick() {
        this.playTone([840, 360], 0.06, 0.22, 'sine');
    },

    playSuccess() {
        this.playTone([523.25, 659.25, 783.99, 1046.50], 0.28, 0.25, 'sine');
    },

    playPopup() {
        this.playTone([587.33, 880.00], 0.20, 0.22, 'sine');
    },

    playDrawSparkle() {
        const freq = 1500 + Math.random() * 900;
        this.playTone([freq], 0.04, 0.06, 'sine');
    },

    playHeart() {
        this.playTone([440.00, 554.37], 0.18, 0.22, 'sine');
    },

    playDelete() {
        this.playTone([380, 160], 0.12, 0.20, 'triangle');
    }
};

window.Sound = Sound;
