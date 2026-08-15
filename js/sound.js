/* ==========================================================================
   NUESTRA CONSTANTE — SUBTLE LUXURY AUDIO SYSTEM (Web Audio API Synthesizer)
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
            this.audioCtx.resume();
        }
        return this.audioCtx;
    },

    init() {
        // Unlock Web Audio API on first user touch/click interaction
        const unlock = () => {
            this.getAudioContext();
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('touchstart', unlock, { passive: true });
        window.addEventListener('click', unlock, { passive: true });

        this.bindGlobalButtonSound();
    },

    bindGlobalButtonSound() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button, .nav-item, .btn-text-gold, .btn-primary-luxury, .btn-secondary-luxury');
            if (btn) {
                this.playClick();
            }
        }, { passive: true });
    },

    playClick() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(780, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.035, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) {}
    },

    playSuccess() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Luxury Chord)
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.045, ctx.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.06);
                osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
            });
        } catch (e) {}
    },

    playPopup() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const notes = [587.33, 880.00]; // D5, A5 soft duo bell
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

                gain.gain.setValueAtTime(0.035, ctx.currentTime + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.18);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.05);
                osc.stop(ctx.currentTime + idx * 0.05 + 0.18);
            });
        } catch (e) {}
    },

    playDrawSparkle() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const freq = 1600 + Math.random() * 800; // 1600Hz - 2400Hz soft magic sparkle
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.03);

            gain.gain.setValueAtTime(0.012, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.03);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.03);
        } catch (e) {}
    },

    playHeart() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const notes = [440.00, 554.37]; // A4, C#5 warm duo
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

                gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.14);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.04);
                osc.stop(ctx.currentTime + idx * 0.04 + 0.14);
            });
        } catch (e) {}
    },

    playDelete() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(360, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.035, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {}
    }
};

window.Sound = Sound;
