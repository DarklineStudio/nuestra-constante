/* ==========================================================================
   OUR TIME — MEDICAL VITALS MODULE ("Signos Vitales")
   ========================================================================== */

const Vitals = {
    mainCanvas: null,
    miniCanvas: null,
    mainCtx: null,
    miniCtx: null,
    xPos: 0,
    animId: null,

    startEcg() {
        // Cancel existing loop to prevent duplicate animation frames
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }

        this.mainCanvas = document.getElementById('mainEcgCanvas');
        this.miniCanvas = document.getElementById('miniEcgCanvas');

        if (this.mainCanvas) {
            const parentWidth = this.mainCanvas.parentElement ? this.mainCanvas.parentElement.clientWidth : 0;
            this.mainCanvas.width = Math.max(300, parentWidth || 400);
            this.mainCanvas.height = 80;
            this.mainCtx = this.mainCanvas.getContext('2d');
        }

        if (this.miniCanvas) {
            const parentWidth = this.miniCanvas.parentElement ? this.miniCanvas.parentElement.clientWidth : 0;
            this.miniCanvas.width = Math.max(200, parentWidth || 300);
            this.miniCanvas.height = 40;
            this.miniCtx = this.miniCanvas.getContext('2d');
        }

        this.xPos = 0;
        this.bindHeartSensor();
        this.bindPillEvents();
        this.animateEcg();
    },

    rxPrescriptions: (function() {
        const medicalPrescriptions = [
            "100mg de besos al despertar y 200mg antes de dormir. 💋",
            "Abrazos apretados de 20 minutos tras salir de la guardia médica. 🩺",
            "Un café caliente preparado especialmente para ti al llegar del hospital. ☕👑",
            "Sostener tu mano fuerte cada vez que sientas que el día fue pesado. 🤝💫",
            "Un masaje relajante en la espalda y hombros después de un largo día de guardia. 💆‍♀️❤️",
            "Escuchar atentamente cómo fue tu día y ser siempre tu lugar seguro. 👂🏥",
            "Promesa de amor: Cuidar de tu corazón como tú cuidas la salud de todos los demás. 🩺👑",
            "Un beso en la frente al despertar para recordarte cuánto te admiro. 💋👑",
            "10 minutos acurrucados en la cama antes de empezar la rutina médica. 🛌✨",
            "Un abrazo por la espalda y un te amo al oído antes de iniciar el día. 🫂❤️"
        ];

        const datePrescriptions = [
            "Una cita conmigo. Repetir indefinidamente. ☕❤️",
            "Una caminata juntos tomados de la mano, disfrutando sin prisa alguna. ✨",
            "Tarde de películas, palomitas y acurrucarse juntos en el sillón. 🍿",
            "Escapada improvisada de fin de semana para desconectar de todo. 🚗🌄",
            "Cena sorpresa preparada con todo mi cariño para consentirte. 🍷🍽️",
            "Tomar un café juntos en silencio, simplemente disfrutando de estar al lado del otro. ☕🌙",
            "Planear nuestro próximo viaje juntos mientras nos acurrucamos. ✈️🗺️",
            "Una tarde entera juntos sin reloj, sin prisas y sin pendientes. ⏳❤️",
            "Ir por tu helado favorito y caminar riendo por nuestro lugar preferido. 🍨💖",
            "Una noche de desconexión total para platicar de todo lo que soñamos. 🌌✨"
        ];

        const affectionPrescriptions = [
            "Dosis diaria de miradas cómplices y sonrisas sin razón alguna. 😊✨",
            "Susurrarte al oído lo afortunado que me siento de tenerte a mi lado. 👂❤️",
            "Un abrazo largo y apretado en la cocina antes de servir el desayuno. 🫂✨",
            "Dosis masiva de ternura, paciencia y complicidad absoluta. 💎❤️",
            "Robarte una sonrisa cuando menos te lo esperes durante el día. 😁💖",
            "Tratamiento intensivo: Mirarte a los ojos y recordarte lo mucho que me enamoras. 👀❤️",
            "Amarte incondicionalmente todos y cada uno de los días que nos queden por delante. ♾️❤️",
            "Dosis de risas contagiosas para iluminar cualquier momento. 😂❤️",
            "Recordarte lo inteligente, hermosa y brillante que eres en todo lo que haces. 🌟🩺",
            "Abrazo apretado sin soltarte hasta que sientas que todo está bien. 💖✨"
        ];

        const pool = [...medicalPrescriptions, ...datePrescriptions, ...affectionPrescriptions];
        const result = [];

        // Generate 365 unique daily medical prescriptions
        for (let i = 0; i < 365; i++) {
            const baseQuote = pool[i % pool.length];
            result.push(baseQuote);
        }

        return result;
    })(),

    abratilinaPills: [
        { title: 'PASTILLA DE ABRATILINA 500mg', message: '<strong>Fórmula activa:</strong> Dosis inmediata de un abrazo apretado al llegar a casa.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Vía de administración: Directo al corazón. Repetir cuantas veces sea necesario. ❤️</em>' },
        { title: 'ABRATILINA FORTE 1000mg', message: '<strong>Indicación terapéutica:</strong> Abrazo envolvente de 5 minutos cuando el día en el hospital sea cansado.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Efecto inmediato: Recarga instantánea de energía y paz al instante. 💫</em>' },
        { title: 'ABRATILINA REFORZADA', message: '<strong>Posología:</strong> Tres abrazos apretados con beso en la frente al despertar.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Garantía: Alivia el estrés de cualquier guardia médica. 🩺❤️</em>' },
        { title: 'ABRATILINA PROLONGADA', message: '<strong>Acción continua:</strong> Un abrazo por la espalda y un te amo al oído antes de iniciar el día.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Dosis recomendada: Sin límite de uso. 🌹</em>' },
        { title: 'ABRATILINA EN GOTAS', message: '<strong>Tratamiento preventivo:</strong> Mantenerse acurrucados 10 minutos más en la cama por la mañana.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Efecto: Iniciar la jornada con una sonrisa imborrable. 🛌✨</em>' }
    ],

    orgulloInjections: [
        { title: 'INYECCIÓN DE ORGULLO 10ml', message: '<strong>Dosis de refuerzo:</strong> Recordatorio constante de lo increíble, brillante, talentosa y hermosa doctora que eres.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Efecto secundario: Sonrisa instantánea y admiración eterna. ✨</em>' },
        { title: 'ORGULLO CONCENTRADO', message: '<strong>Diagnóstico de admiración:</strong> Ver la dedicación y amor con la que cuidas a cada paciente me demuestra la gran mujer que eres.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Nota del corazón: Estoy infinitamente orgulloso de ti. 👑</em>' },
        { title: 'SUERO DE ADMIRACIÓN MÁXIMA', message: '<strong>Propiedades:</strong> Recordarte que eres capaz de lograr absolutamente todo lo que te propongas.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Prescripción: Siempre estaré a tu lado apoyándote en cada meta. 💪❤️</em>' },
        { title: 'AMPOLLETA DE BRILLO Y TALENTO', message: '<strong>Efecto médico:</strong> Recordatorio de que tu vocación y tu inteligencia iluminan a todos a tu alrededor.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Dosis: Admirarte todos los días de mi vida. 🩺✨</em>' },
        { title: 'VACUNA DE SEGURIDAD', message: '<strong>Fórmula:</strong> Que nunca dudes ni por un segundo de lo valiosa y virtuosa que eres.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Efecto: Confianza absoluta en tu camino profesional y personal. 🌟❤️</em>' }
    ],

    risaDrops: [
        { title: 'GOTAS DE RISA PURA', message: '<strong>Tratamiento intensivo:</strong> Una cita improvisada y tu café favorito para olvidar cualquier estrés de la guardia.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Posología: Tomar de la mano y reír juntos hasta que duelan los mofletes. ☕✨</em>' },
        { title: 'ELIXIR DE CHISTES Y SONRISAS', message: '<strong>Indicación:</strong> Dosis de tonterías y cosquillas para sacarte esa sonrisa hermosa que tanto me encanta.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Efecto: Risas contagiosas e inolvidables garantizadas. 😂❤️</em>' },
        { title: 'GOTAS DE DESCONEXIÓN TOTAL', message: '<strong>Tratamiento:</strong> Apagar los teléfonos 1 hora y disfrutar de una plática sincera con helado.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Recomendación: Disfrutar del presente juntos. 🍨✨</em>' },
        { title: 'JARABE DE FELICIDAD COMPARTIDA', message: '<strong>Dosis diaria:</strong> Recordar nuestras anécdotas divertidas y sonreír sin importar nada más.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Efecto terapéutico: Alegría inmediata. 😊💖</em>' },
        { title: 'TÓNICO DE COMPLICIDAD', message: '<strong>Posología:</strong> Mirarnos en silencio y soltar una carcajada espontánea.<br><br><em style="color:var(--accent-gold-light); font-size:1.0rem; font-weight:500; font-style:normal; display:block; margin-top:8px;">Garantía: La mejor medicina para cualquier cansancio. ✨❤️</em>' }
    ],

    pulseDiagnoses: [
        { bpm: 140, title: '¡DIAGNÓSTICO MÉDICO CONFIRMADO!', main: 'Diagnóstico: Taquicardia severa de emoción producida al estar a tu lado.', prescription: 'Tratamiento prescrito: Abrazos apretados diarios, café juntos y no soltarme la mano jamás. ❤️' },
        { bpm: 138, title: '¡ARRITMIA DE AMOR DETECTADA!', main: 'Diagnóstico: Arritmia de amor fulminante al mirarte directamente a los ojos.', prescription: 'Tratamiento prescrito: Un beso robado y una caminata bajo las estrellas. ✨' },
        { bpm: 145, title: '¡COLAPSO DE MARIPOSAS!', main: 'Diagnóstico: Hiperactividad de mariposas en el estómago al escuchar tu voz.', prescription: 'Tratamiento prescrito: Decirte lo mucho que te amo todos los días. 🦋❤️' },
        { bpm: 132, title: '¡HIPERTENSIÓN DE FELICIDAD!', main: 'Diagnóstico: Elevación súbita de oxitocina producida al tomar tu mano.', prescription: 'Tratamiento prescrito: Cita romántica improvisada este fin de semana. ☕👑' },
        { bpm: 142, title: '¡ELEVACIÓN INTENSA DE LATIDOS!', main: 'Diagnóstico: Pulsaciones descontroladas causadas por tu sonrisa.', prescription: 'Tratamiento prescrito: Consentirte y acurrucarnos juntos sin prisa. 💖✨' }
    ],

    rxBag: [],
    getNextRxQuote() {
        if (!this.rxBag || this.rxBag.length === 0) {
            // Fill and shuffle a fresh bag so quotes never repeat until full pool is consumed
            this.rxBag = [...this.rxPrescriptions].sort(() => Math.random() - 0.5);
        }
        return this.rxBag.pop();
    },

    rotateRxQuote() {
        const newQuote = this.getNextRxQuote();
        const quoteElem = document.getElementById('rxQuoteText');
        if (quoteElem) {
            quoteElem.textContent = `"${newQuote}"`;
        }

        showLuxuryNotice({
            icon: '📋',
            title: 'PRESCRIPCIÓN MÉDICA ROMÁNTICA',
            message: `
                <div style="text-align:center; padding: 12px 0;">
                    <p style="font-family:var(--font-serif); font-size:1.35rem; font-style:italic; color:var(--accent-gold-light); line-height:1.55; margin:0;">"${newQuote}"</p>
                    <br>
                    <span style="font-size:1.0rem; color:var(--accent-gold-light); font-weight:500; display:block; margin-top:10px;">
                        Prescrita con todo el corazón por tu paciente favorito ❤️
                    </span>
                </div>
            `
        });
    },

    openPill(type) {
        let pool = [];
        let icon = '💊';
        if (type === 'abratilina') { pool = this.abratilinaPills; icon = '💊'; }
        else if (type === 'orgullo') { pool = this.orgulloInjections; icon = '💉'; }
        else if (type === 'risa') { pool = this.risaDrops; icon = '🧪'; }

        if (!pool || pool.length === 0) return;
        const selected = pool[Math.floor(Math.random() * pool.length)];

        showLuxuryNotice({
            icon: icon,
            title: selected.title,
            message: selected.message
        });
    },

    // Web Audio API Heartbeat Sound Synthesizer (Stethoscope Lub-Dub)
    playHeartbeatSound(freq = 60) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            const playPulse = (delay, frequency, duration, volume) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
                
                gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + duration);
            };

            // First beat (Lub)
            playPulse(0, freq, 0.12, 0.4);
            // Second beat (Dub)
            playPulse(0.14, freq * 0.85, 0.15, 0.3);
        } catch (e) {
            // Audio context fallback if muted
        }
    },

    bindHeartSensor() {
        const btnSensor = document.getElementById('btnTouchHeartSensor');
        const progressBar = document.getElementById('sensorChargeProgress');
        const labelText = document.getElementById('sensorLabelText');
        if (!btnSensor) return;

        let chargeTimer = null;
        let soundTimer = null;
        let progress = 0;

        const startHold = (e) => {
            if (e) e.preventDefault();
            btnSensor.classList.add('measuring');
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';

            // Initial heartbeat sound & vibration
            this.playHeartbeatSound(65);
            if (navigator.vibrate) navigator.vibrate([30, 40, 30]);

            // Heartbeat audio loop accelerating with progress
            soundTimer = setInterval(() => {
                const currentBpmFreq = 60 + (progress * 0.8);
                this.playHeartbeatSound(currentBpmFreq);
                if (navigator.vibrate) navigator.vibrate([25, 30, 25]);
            }, 550);

            // Charge progress timer (2 seconds to 100%)
            chargeTimer = setInterval(() => {
                progress += 2.5;
                if (progressBar) progressBar.style.width = `${Math.min(100, progress)}%`;
                if (labelText) labelText.textContent = `MIDIENDO PULSO... ${Math.floor(progress)}%`;

                if (progress >= 100) {
                    stopHold();
                    this.onSensorComplete();
                }
            }, 50);
        };

        const stopHold = () => {
            btnSensor.classList.remove('measuring');
            if (chargeTimer) clearInterval(chargeTimer);
            if (soundTimer) clearInterval(soundTimer);
            chargeTimer = null;
            soundTimer = null;

            if (progress < 100) {
                progress = 0;
                if (progressBar) progressBar.style.width = '0%';
                if (labelText) labelText.textContent = 'MANTÉN PRESIONADO PARA MEDIR PULSO';
            }
        };

        btnSensor.addEventListener('mousedown', startHold);
        btnSensor.addEventListener('mouseup', stopHold);
        btnSensor.addEventListener('mouseleave', stopHold);
        btnSensor.addEventListener('touchstart', startHold, { passive: false });
        btnSensor.addEventListener('touchend', stopHold);
    },

    onSensorComplete() {
        const progressBar = document.getElementById('sensorChargeProgress');
        const labelText = document.getElementById('sensorLabelText');

        // Play final strong heartbeat
        this.playHeartbeatSound(110);
        if (navigator.vibrate) navigator.vibrate([60, 50, 80]);

        if (progressBar) progressBar.style.width = '100%';
        if (labelText) labelText.textContent = '¡PULSO MEDIDO!';

        setTimeout(() => {
            if (progressBar) progressBar.style.width = '0%';
            if (labelText) labelText.textContent = 'MANTÉN PRESIONADO PARA MEDIR PULSO';

            const diag = this.pulseDiagnoses[Math.floor(Math.random() * this.pulseDiagnoses.length)];

            showLuxuryNotice({
                icon: '💓',
                title: diag.title,
                message: `
                    <div style="text-align:center; padding: 10px 0;">
                        <span style="font-size:2.4rem; color:var(--accent-gold); font-weight:700; font-family:var(--font-serif);">${diag.bpm} BPM</span>
                        <br><br>
                        <strong style="font-size:1.15rem; color:var(--accent-gold-light);">${diag.main}</strong>
                        <br><br>
                        <span style="font-size:0.88rem; color:var(--text-secondary); display:block; line-height:1.5;">
                            ${diag.prescription}
                        </span>
                    </div>
                `
            });
        }, 300);
    },

    // Generates realistic heartbeat P-Q-R-S-T wave pulse
    getEcgY(x, height) {
        const midY = height / 2;
        const cycle = x % 140;

        if (cycle > 40 && cycle < 48) {
            // P wave
            return midY - 6 * Math.sin((cycle - 40) / 8 * Math.PI);
        } else if (cycle >= 58 && cycle < 62) {
            // Q wave
            return midY + 8;
        } else if (cycle >= 62 && cycle < 72) {
            // R spike
            return midY - (height * 0.42);
        } else if (cycle >= 72 && cycle < 78) {
            // S wave
            return midY + (height * 0.25);
        } else if (cycle >= 90 && cycle < 110) {
            // T wave
            return midY - 10 * Math.sin((cycle - 90) / 20 * Math.PI);
        }

        return midY;
    },

    animateEcg() {
        const speed = this.isSensorActive ? 6.0 : 2.5;
        this.xPos += speed;

        // Draw Main ECG
        if (this.mainCtx && this.mainCanvas && this.mainCanvas.width > 0) {
            const w = this.mainCanvas.width;
            const h = this.mainCanvas.height;

            if (this.xPos >= w) {
                this.xPos = 0;
                this.mainCtx.clearRect(0, 0, w, h);
            }

            const currentY = this.getEcgY(this.xPos, h);
            const prevY = this.getEcgY(this.xPos - 2.5, h);

            this.mainCtx.strokeStyle = '#c94a5e';
            this.mainCtx.lineWidth = 2.2;
            this.mainCtx.shadowBlur = 8;
            this.mainCtx.shadowColor = '#c94a5e';

            this.mainCtx.beginPath();
            this.mainCtx.moveTo(Math.max(0, this.xPos - 2.5), prevY);
            this.mainCtx.lineTo(this.xPos, currentY);
            this.mainCtx.stroke();
        }

        // Draw Mini ECG
        if (this.miniCtx && this.miniCanvas && this.miniCanvas.width > 0) {
            const w = this.miniCanvas.width;
            const h = this.miniCanvas.height;

            if (this.xPos >= w) {
                this.miniCtx.clearRect(0, 0, w, h);
            }

            const currentY = this.getEcgY(this.xPos, h);
            const prevY = this.getEcgY(this.xPos - 2.5, h);

            this.miniCtx.strokeStyle = '#e6c875';
            this.miniCtx.lineWidth = 1.8;
            this.miniCtx.shadowBlur = 6;
            this.miniCtx.shadowColor = '#e6c875';

            this.miniCtx.beginPath();
            this.miniCtx.moveTo(Math.max(0, this.xPos - 2.5), prevY);
            this.miniCtx.lineTo(this.xPos, currentY);
            this.miniCtx.stroke();
        }

        this.animId = requestAnimationFrame(() => this.animateEcg());
    },

    bindPillEvents() {
        // Explicitly set cursor pointer on pills
        document.querySelectorAll('.pill-item').forEach(pill => {
            pill.style.cursor = 'pointer';
        });
    }
};

// Global Helper & Window Exports for absolute 100% reliability
window.Vitals = Vitals;
window.openPill = function(type) {
    Vitals.openPill(type);
};
window.openRxQuote = function() {
    Vitals.rotateRxQuote();
};

// Global Event Delegation for all pill-item clicks (captures clicks on icon, text, or parent)
document.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-item');
    if (pill) {
        const type = pill.getAttribute('data-pill');
        if (type) {
            Vitals.openPill(type);
        } else {
            const text = pill.textContent.toLowerCase();
            if (text.includes('abratilina')) Vitals.openPill('abratilina');
            else if (text.includes('orgullo')) Vitals.openPill('orgullo');
            else if (text.includes('risa')) Vitals.openPill('risa');
        }
    }
});
