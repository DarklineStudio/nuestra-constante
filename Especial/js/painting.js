/* ==========================================================================
   OUR TIME — INTERACTIVE PAINTING CANVAS MODULE ("Nuestra Pintura")
   ========================================================================== */

const Painting = {
    canvas: null,
    ctx: null,
    particleCanvas: null,
    particleCtx: null,
    particles: [],
    particleAnimId: null,
    isDrawing: false,
    currentColor: '#e6c875',
    currentSize: 2,
    isEraser: false,
    lastX: 0,
    lastY: 0,
    currentCanvasMode: 'blank',

    init() {
        this.canvas = document.getElementById('paintCanvas');
        this.particleCanvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        if (this.particleCanvas) {
            this.particleCtx = this.particleCanvas.getContext('2d');
        }

        this.setupCanvasDimensions();
        this.bindEvents();
        this.switchCanvasMode('blank');
        this.renderMuseumGallery();
        this.updateRoadmap();
    },

    setupCanvasDimensions() {
        if (!this.canvas) return;
        const wrapper = this.canvas.parentElement;
        if (!wrapper) return;
        
        const rect = wrapper.getBoundingClientRect();
        const newW = rect.width > 0 ? Math.floor(rect.width) : 400;
        const newH = rect.height > 0 ? Math.floor(rect.height) : 340;

        if (this.canvas.width !== newW || this.canvas.height !== newH || newW > 0) {
            this.canvas.width = newW;
            this.canvas.height = newH;
            if (this.particleCanvas) {
                this.particleCanvas.width = newW;
                this.particleCanvas.height = newH;
            }
            this.renderStageArtwork();
        }
    },

    switchCanvasMode(mode) {
        this.currentCanvasMode = mode;

        const btnConst = document.getElementById('btnModeConstellation');
        const btnBlank = document.getElementById('btnModeBlank');
        const stageTag = document.getElementById('canvasStageTag');
        const expText = document.getElementById('canvasExplanationText');
        const roadmapBox = document.querySelector('.painting-roadmap');
        const toolbar = document.querySelector('.canvas-toolbar');

        if (mode === 'blank') {
            if (btnConst) {
                btnConst.style.background = 'transparent';
                btnConst.style.color = 'var(--text-secondary)';
                btnConst.classList.remove('active');
            }
            if (btnBlank) {
                btnBlank.style.background = 'rgba(230, 200, 117, 0.2)';
                btnBlank.style.color = 'var(--accent-gold)';
                btnBlank.classList.add('active');
            }
            if (stageTag) {
                stageTag.textContent = '🎨 LIENZO EN BLANCO ACTIVO PARA DIBUJAR';
                stageTag.style.color = 'var(--accent-gold)';
            }
            if (expText) {
                expText.innerHTML = 'Estás en el <strong>Lienzo en Blanco</strong>: Espacio libre para realizar dibujos, trazar tu pulso cardíaco real y crear obras de arte personalizadas. Toca "Guardar obra" para exhibirla en nuestra galería.';
            }
            if (roadmapBox) {
                roadmapBox.style.opacity = '0.4';
                roadmapBox.style.pointerEvents = 'none';
            }
            if (toolbar) {
                toolbar.style.opacity = '1';
                toolbar.style.pointerEvents = 'auto';
            }
            if (this.canvas) {
                this.canvas.style.cursor = 'crosshair';
            }

            this.renderBlankCanvas();
        } else {
            if (btnConst) {
                btnConst.style.background = 'rgba(230, 200, 117, 0.2)';
                btnConst.style.color = 'var(--accent-gold)';
                btnConst.classList.add('active');
            }
            if (btnBlank) {
                btnBlank.style.background = 'transparent';
                btnBlank.style.color = 'var(--text-secondary)';
                btnBlank.classList.remove('active');
            }
            if (stageTag) {
                stageTag.textContent = '🔒 CONSTELACIÓN ESTELAR (Modo Observatorio - Solo Lectura)';
                stageTag.style.color = 'var(--accent-gold)';
            }
            if (expText) {
                expText.innerHTML = 'Estás viendo el <strong>Mapa Estelar Vivo (Solo Lectura)</strong> del día en que comenzó nuestro tiempo. Cambia al "🎨 Lienzo en Blanco para Dibujar" para realizar dibujos libres.';
            }
            if (roadmapBox) {
                roadmapBox.style.opacity = '1';
                roadmapBox.style.pointerEvents = 'auto';
            }
            if (toolbar) {
                toolbar.style.opacity = '1';
                toolbar.style.pointerEvents = 'auto';
            }
            if (this.canvas) {
                this.canvas.style.cursor = 'default';
            }

            this.renderStageArtwork();
        }
    },

    renderBlankCanvas() {
        if (!this.canvas || !this.ctx) return;
        const w = this.canvas.width || 400;
        const h = this.canvas.height || 340;

        const grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0a0a0f');
        grad.addColorStop(1, '#121019');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);
    },

    showCanvasInfoModal() {
        showLuxuryNotice({
            icon: '🌌',
            title: 'EL SIGNIFICADO DE NUESTRO LIENZO',
            message: `
                <div style="text-align:left; font-size:0.88rem; line-height:1.65; color:var(--text-secondary);">
                    <p style="margin-bottom:12px;"><strong style="color:var(--accent-gold);">🌌 1. Mapa Estelar de Origen:</strong> El fondo del lienzo traza la constelación estelar viva del día en que comenzó nuestro tiempo.</p>
                    <p style="margin-bottom:12px;"><strong style="color:var(--accent-gold);">💓 2. Arte por Frecuencia Cardíaca:</strong> Al presionar "Arte por Latidos", el sistema dibuja tu pulso ECG real en ráfagas de pan de oro.</p>
                    <p style="margin-bottom:12px;"><strong style="color:var(--accent-gold);">✨ 3. Polvo de Oro Suspendido:</strong> Al trazar sobre la pantalla, el pincel desprende destellos dorados que flotan como estrellas.</p>
                    <p style="margin-bottom:12px;"><strong style="color:var(--accent-gold);">👑 4. Evolución Cósmica:</strong> A los 30 días se revela la Luna Dorada, a los 180 el Latido Central y al año la Corona de Aniversario.</p>
                    <p style="margin:0;"><strong style="color:var(--accent-gold);">🏛️ 5. Galería del Museo:</strong> Guarda nuestras obras para exponerlas en nuestro museo privado.</p>
                </div>
            `
        });
    },

    // Draws progressive base romantic artwork depending on days together
    renderStageArtwork(overrideDays = null) {
        if (!this.canvas || !this.ctx) return;
        const startDateTimestamp = Storage.getStartDate() || Date.now();
        const actualDays = Math.floor((Date.now() - startDateTimestamp) / (1000 * 60 * 60 * 24));
        const days = (overrideDays !== null) ? overrideDays : actualDays;
        const w = this.canvas.width || 400;
        const h = this.canvas.height || 340;

        // Dark Cosmic Background Gradient
        const grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0a0a0f');
        grad.addColorStop(0.5, '#121019');
        grad.addColorStop(1, '#08080c');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);

        this.ctx.save();

        // Subdued Constellation Title Watermark
        this.ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
        this.ctx.fillStyle = 'rgba(230, 200, 117, 0.4)';
        this.ctx.letterSpacing = '0.08em';
        this.ctx.fillText('✨ CONSTELACIÓN DE NUESTRA CONSTANTE', 14, 24);

        // Stage 0 Base: Golden Constellation Lines with Glow Aura
        this.ctx.strokeStyle = 'rgba(230, 200, 117, 0.35)';
        this.ctx.lineWidth = 1.8;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(230, 200, 117, 0.5)';
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.18, h * 0.35);
        this.ctx.lineTo(w * 0.35, h * 0.28);
        this.ctx.lineTo(w * 0.5, h * 0.42);
        this.ctx.lineTo(w * 0.68, h * 0.26);
        this.ctx.lineTo(w * 0.84, h * 0.38);
        this.ctx.stroke();

        // Constellation Stars with Double Aura Rings
        const starsPos = [
            {x: w*0.18, y: h*0.35}, {x: w*0.35, y: h*0.28}, {x: w*0.5, y: h*0.42},
            {x: w*0.68, y: h*0.26}, {x: w*0.84, y: h*0.38}
        ];
        starsPos.forEach(pt => {
            // Outer Aura
            this.ctx.fillStyle = 'rgba(230, 200, 117, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
            this.ctx.fill();

            // Core Star
            this.ctx.fillStyle = '#e6c875';
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = '#e6c875';
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Stage 1 (>= 30 days): Luminous Golden Crescent Moon
        if (days >= 30) {
            this.ctx.save();
            this.ctx.fillStyle = '#f5e4b3';
            this.ctx.shadowBlur = 22;
            this.ctx.shadowColor = '#e6c875';
            this.ctx.beginPath();
            this.ctx.arc(w * 0.82, h * 0.22, 24, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.shadowBlur = 0;
            this.ctx.beginPath();
            this.ctx.arc(w * 0.85, h * 0.19, 21, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Stage 2 (>= 90 days): Golden Floral Corner Vine Arches
        if (days >= 90) {
            this.ctx.save();
            this.ctx.strokeStyle = '#c94a5e';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#c94a5e';
            this.ctx.lineWidth = 2.5;

            // Bottom-Left Arch
            this.ctx.beginPath();
            this.ctx.arc(w * 0.08, h * 0.9, 32, Math.PI * 1.5, 0);
            this.ctx.stroke();

            // Top-Right Arch
            this.ctx.beginPath();
            this.ctx.arc(w * 0.92, h * 0.1, 32, Math.PI * 0.5, Math.PI);
            this.ctx.stroke();

            // Decorative Corner Leaves
            this.ctx.fillStyle = '#e6c875';
            this.ctx.shadowColor = '#e6c875';
            this.ctx.beginPath();
            this.ctx.arc(w * 0.08 + 32, h * 0.9, 4, 0, Math.PI * 2);
            this.ctx.arc(w * 0.92 - 32, h * 0.1, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Stage 3 (>= 180 days): Glowing Heartbeat Core
        if (days >= 180) {
            this.ctx.save();
            this.ctx.fillStyle = '#c94a5e';
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = '#c94a5e';
            this.ctx.font = '34px serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('❤️', w * 0.5, h * 0.55);

            // Pulsing Ring around Heart
            this.ctx.strokeStyle = 'rgba(230, 200, 117, 0.6)';
            this.ctx.lineWidth = 1.5;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = '#e6c875';
            this.ctx.beginPath();
            this.ctx.arc(w * 0.5, h * 0.55, 28, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Stage 4 (>= 365 days): Golden Filigree Crown Frame
        if (days >= 365) {
            this.ctx.save();
            this.ctx.strokeStyle = '#e6c875';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#e6c875';
            this.ctx.strokeRect(12, 12, w - 24, h - 24);

            // Corner Crown Jewels
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('👑', w * 0.5, 24);
            this.ctx.restore();
        }

        this.ctx.restore();
    },

    bindEvents() {
        // Pointer / Touch / Mouse Drawing Events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(touch);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw(touch);
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Color Picker Buttons
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const colorVal = btn.getAttribute('data-color');
                if (colorVal === 'eraser') {
                    this.isEraser = true;
                } else {
                    this.isEraser = false;
                    this.currentColor = colorVal;
                }
            });
        });

        // Custom Wheel Color Picker Input
        const customColorInput = document.getElementById('inputCustomColor');
        const customColorBtn = document.getElementById('btnCustomColor');
        if (customColorInput) {
            const handleCustomColor = (e) => {
                const hexColor = e.target.value;
                this.isEraser = false;
                this.currentColor = hexColor;

                colorBtns.forEach(b => b.classList.remove('active'));
                if (customColorBtn) {
                    customColorBtn.classList.add('active');
                    customColorBtn.style.background = hexColor;
                    customColorBtn.setAttribute('data-color', hexColor);
                }
            };
            customColorInput.addEventListener('input', handleCustomColor);
            customColorInput.addEventListener('change', handleCustomColor);
        }

        // Brush Size Slider
        const brushSlider = document.getElementById('brushSize');
        const brushValLabel = document.getElementById('brushSizeVal');
        if (brushSlider) {
            brushSlider.addEventListener('input', (e) => {
                this.currentSize = parseFloat(e.target.value);
                if (brushValLabel) brushValLabel.textContent = `${this.currentSize}px`;
            });
        }

        // Roadmap Step Click Preview Handlers (Real-Time Locked)
        const roadmapMap = [
            { 
                id: 'stepRoadmap0', 
                days: 0, 
                daysName: 'día inicial',
                title: 'Lienzo Inicial',
                label: '✨ Etapa 1: Constelación de Nuestro Origen',
                desc: 'Estás viendo el <strong>Lienzo Inicial</strong>: La base traza la <strong>Constelación Estelar Viva del Cielo</strong> del día en que comenzó nuestro tiempo juntos.' 
            },
            { 
                id: 'stepRoadmap1', 
                days: 30, 
                daysName: '1 Mes',
                title: 'Luna Dorada de 1 Mes',
                label: '🌙 Etapa 2: Luna Dorada de 1 Mes',
                desc: '¡Etapa de 1 Mes desbloqueada! El cielo de nuestro lienzo revela la <strong>Luna Dorada Cresciente 🌙</strong>, iluminando nuestro cuadro de recuerdos.' 
            },
            { 
                id: 'stepRoadmap3', 
                days: 90, 
                daysName: '3 Meses',
                title: 'Detalles Florales de 3 Meses',
                label: '🌸 Etapa 3: Detalles Florales de 3 Meses',
                desc: '¡Etapa de 3 Meses desbloqueada! Se develan las <strong>Enredaderas Florales de Pan de Oro 🌸</strong> en las esquinas de nuestro cuadro.' 
            },
            { 
                id: 'stepRoadmap6', 
                days: 180, 
                daysName: '6 Meses',
                title: 'Latido Central de 6 Meses',
                label: '❤️ Etapa 4: Latido Central de 6 Meses',
                desc: '¡Etapa de 6 Meses desbloqueada! El mapa estelar revela el <strong>Latido Central Pulsante ❤️</strong> latiendo al ritmo de nuestro amor.' 
            },
            { 
                id: 'stepRoadmap12', 
                days: 365, 
                daysName: '1 Año',
                title: 'Marco Real de 1 Año',
                label: '👑 Etapa 5: Marco Real de 1 Año',
                desc: '¡Etapa de 1 Año alcanzada! El cuadro se completa con el <strong>Marco Real de Aniversario y Corona de Oro 👑</strong> para celebrar un año inolvidable.' 
            }
        ];

        roadmapMap.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                el.addEventListener('click', () => {
                    const startDateTimestamp = Storage.getStartDate();
                    const actualDays = startDateTimestamp ? Math.max(0, Math.floor((Date.now() - startDateTimestamp) / (1000 * 60 * 60 * 24))) : 0;

                    if (actualDays < item.days) {
                        const remaining = item.days - actualDays;
                        showLuxuryNotice({
                            icon: '🔒',
                            title: `ETAPA BLOQUEADA: ${item.title.toUpperCase()}`,
                            message: `Esta evolución del lienzo se revelará automáticamente en tiempo real al cumplir <strong>${item.daysName}</strong> juntos.<br><br>⏳ Faltan <strong>${remaining} ${remaining === 1 ? 'día' : 'días'}</strong> para desbloquear esta etapa.`
                        });
                        return;
                    }

                    document.querySelectorAll('.roadmap-step').forEach(s => s.classList.remove('current'));
                    el.classList.add('current');
                    this.renderStageArtwork(item.days);

                    const stageTag = document.getElementById('canvasStageTag');
                    if (stageTag) {
                        stageTag.textContent = item.label;
                        stageTag.style.color = 'var(--accent-gold)';
                    }

                    const expText = document.getElementById('canvasExplanationText');
                    if (expText) {
                        expText.innerHTML = item.desc;
                    }
                });
            }
        });

        // Canvas Mode Switch Buttons
        const btnConst = document.getElementById('btnModeConstellation');
        const btnBlank = document.getElementById('btnModeBlank');
        if (btnConst) {
            btnConst.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchCanvasMode('constellation');
            });
        }
        if (btnBlank) {
            btnBlank.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchCanvasMode('blank');
            });
        }

        // Action Buttons
        const btnClear = document.getElementById('btnClearCanvas');
        const btnSave = document.getElementById('btnSaveCanvas');

        if (btnClear) {
            btnClear.addEventListener('click', () => this.clearCanvas());
        }

        if (btnSave) {
            btnSave.addEventListener('click', () => this.saveCanvas());
        }
    },

    getCanvasCoordinates(e) {
        if (!this.canvas) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width > 0 ? (this.canvas.width / rect.width) : 1;
        const scaleY = rect.height > 0 ? (this.canvas.height / rect.height) : 1;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },

    startDrawing(e) {
        if (this.currentCanvasMode === 'constellation') {
            this.isDrawing = false;
            showLuxuryNotice({
                icon: '🔒',
                title: 'MODO OBSERVATORIO ESTELAR',
                message: 'El Mapa Estelar de la Constelación es solo de lectura para observar nuestra historia.<br><br>Para dibujar libremente, activa el botón <strong>"🎨 Lienzo en Blanco para Dibujar"</strong> arriba.'
            });
            return;
        }
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.ctx.beginPath();
        this.ctx.moveTo(coords.x, coords.y);
    },

    draw(e) {
        if (!this.isDrawing || !this.ctx || this.currentCanvasMode === 'constellation') return;
        const coords = this.getCanvasCoordinates(e);

        this.ctx.save();
        this.ctx.lineWidth = this.currentSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (this.isEraser) {
            // Eraser mode: restore background area
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.beginPath();
            this.ctx.arc(coords.x, coords.y, this.currentSize * 1.8, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Crisp Glowing Metallic Permanent Stroke on paintCanvas
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = this.currentColor;

            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(coords.x, coords.y);
            this.ctx.stroke();

            // Permanent micro-stardust particles on paintCanvas
            this.spawnStardust(coords.x, coords.y);

            // Dynamic Animated Floating Particles while drawing (on particleCanvas)
            this.spawnFloatingParticles(coords.x, coords.y);

            // Subtle magic sparkle sound while drawing
            if (Math.random() < 0.22 && window.Sound) {
                window.Sound.playDrawSparkle();
            }
        }

        this.ctx.restore();

        this.lastX = coords.x;
        this.lastY = coords.y;
    },

    spawnStardust(x, y) {
        if (!this.ctx) return;
        this.ctx.save();

        const particleCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (this.currentSize * 1.2);
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            const radius = Math.random() * 1.8 + 0.6;
            const color = (Math.random() > 0.35) ? (this.currentColor || '#e6c875') : '#ffffff';

            this.ctx.fillStyle = color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = color;
            this.ctx.beginPath();
            this.ctx.arc(px, py, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    },

    spawnFloatingParticles(x, y) {
        if (this.isEraser || !this.particleCtx) return;
        const count = Math.min(6, Math.max(3, Math.floor(this.currentSize * 1.2)));

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2.5 + 0.8;
            this.particles.push({
                x: x + (Math.random() - 0.5) * (this.currentSize * 1.5),
                y: y + (Math.random() - 0.5) * (this.currentSize * 1.5),
                vx: Math.cos(angle) * speed * 0.6,
                vy: (Math.sin(angle) * speed * 0.6) - (Math.random() * 1.4 + 0.8), // floating upward physics!
                radius: Math.random() * (Math.max(1, this.currentSize * 0.45)) + 1.2,
                color: (Math.random() > 0.3) ? (this.currentColor || '#e6c875') : '#ffffff',
                alpha: 1.0,
                decay: Math.random() * 0.025 + 0.015,
                sparkle: Math.random() > 0.6
            });
        }

        this.startParticleLoop();
    },

    startParticleLoop() {
        if (this.particleAnimId) return;

        const renderLoop = () => {
            if (!this.particleCtx || !this.particleCanvas) return;
            const w = this.particleCanvas.width;
            const h = this.particleCanvas.height;

            this.particleCtx.clearRect(0, 0, w, h);

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
                p.radius *= 0.96;

                if (p.alpha <= 0 || p.radius <= 0.2) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.particleCtx.save();
                this.particleCtx.globalAlpha = Math.max(0, p.alpha);
                this.particleCtx.fillStyle = p.color;
                this.particleCtx.shadowBlur = 12;
                this.particleCtx.shadowColor = p.color;
                this.particleCtx.beginPath();
                this.particleCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.particleCtx.fill();

                if (p.sparkle) {
                    this.particleCtx.strokeStyle = '#ffffff';
                    this.particleCtx.lineWidth = 0.8;
                    this.particleCtx.beginPath();
                    this.particleCtx.moveTo(p.x - 4, p.y);
                    this.particleCtx.lineTo(p.x + 4, p.y);
                    this.particleCtx.moveTo(p.x, p.y - 4);
                    this.particleCtx.lineTo(p.x, p.y + 4);
                    this.particleCtx.stroke();
                }
                this.particleCtx.restore();
            }

            if (this.particles.length > 0) {
                this.particleAnimId = requestAnimationFrame(renderLoop);
            } else {
                this.particleAnimId = null;
            }
        };

        this.particleAnimId = requestAnimationFrame(renderLoop);
    },

    generateHeartbeatArt() {
        if (!this.canvas || !this.ctx) return;
        const w = this.canvas.width || 400;
        const h = this.canvas.height || 340;
        const midY = h / 2;

        this.ctx.save();
        this.ctx.strokeStyle = '#e6c875';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#e6c875';

        // Draw Heartbeat Wave
        this.ctx.beginPath();
        this.ctx.moveTo(0, midY);

        for (let x = 0; x < w; x += 5) {
            let y = midY;
            const cycle = x % 120;
            if (cycle > 40 && cycle < 48) y -= 12;
            else if (cycle >= 58 && cycle < 62) y += 15;
            else if (cycle >= 62 && cycle < 72) y -= (h * 0.35);
            else if (cycle >= 72 && cycle < 78) y += (h * 0.2);
            else if (cycle >= 90 && cycle < 110) y -= 18;

            this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();

        // Draw Gold Pulse Stars Burst
        for (let i = 0; i < 25; i++) {
            const rx = Math.random() * w;
            const ry = midY + (Math.random() - 0.5) * (h * 0.6);
            this.spawnStardust(rx, ry);
        }

        this.ctx.restore();
        this.saveCanvas();

        showLuxuryNotice({
            icon: '💓',
            title: 'ARTE POR LATIDOS',
            message: '¡Frecuencia cardíaca trazada! Se ha dibujado tu latido dorado sobre el lienzo.'
        });
    },

    stopDrawing() {
        if (this.isDrawing && this.ctx) {
            this.isDrawing = false;
            this.ctx.closePath();
        }
    },

    async clearCanvas() {
        const confirmed = await showLuxuryConfirm({
            icon: '🧹',
            title: 'LIMPIAR LIENZO',
            message: '¿Desean limpiar sus trazos para volver a pintar sobre el lienzo estelar base?',
            confirmText: 'Sí, limpiar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            if (this.particleCtx && this.particleCanvas) {
                this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            }
            this.particles = [];
            this.renderStageArtwork();
            Storage.savePainting(this.canvas.toDataURL('image/png'));
            this.renderMuseumGallery();

            // Clear visual feedback confirmation tag
            const stageTag = document.getElementById('canvasStageTag');
            if (stageTag) {
                const originalText = stageTag.textContent;
                stageTag.textContent = '🧹 ¡Lienzo limpiado exitosamente!';
                stageTag.style.color = '#c94a5e';
                setTimeout(() => {
                    stageTag.textContent = originalText;
                    stageTag.style.color = '';
                }, 3000);
            }
        }
    },

    saveCanvas() {
        if (!this.canvas) return;
        const dataUrl = this.canvas.toDataURL('image/png');
        const timestamp = Date.now();
        const newArt = {
            id: 'art_' + timestamp,
            dataUrl: dataUrl,
            timestamp: timestamp,
            mode: this.currentCanvasMode
        };

        Storage.savePaintingToGallery(newArt);
        try { localStorage.removeItem(Storage.KEYS.PAINTING); } catch (e) {}
        this.renderMuseumGallery();
        if (window.Sound) window.Sound.playSuccess();
        
        // Show Explicit Luxury Notice Confirmation Popup
        showLuxuryNotice({
            icon: '🖼️',
            title: 'OBRA GUARDADA EN EL MUSEO',
            message: '¡Tu pintura ha sido expuesta exitosamente en nuestra galería privada del museo! ❤️'
        });

        // Update button feedback
        const btnSave = document.getElementById('btnSaveCanvas');
        if (btnSave) {
            const originalText = btnSave.innerHTML;
            btnSave.innerHTML = '<span>✨ ¡Guardado!</span>';
            setTimeout(() => {
                btnSave.innerHTML = originalText;
            }, 2500);
        }
    },

    renderMuseumGallery() {
        const grid = document.getElementById('museumGrid');
        if (!grid) return;

        // Attach event delegation if not bound
        if (!grid.dataset.bound) {
            grid.dataset.bound = "true";
            grid.addEventListener('click', (e) => {
                // ALWAYS check delete button FIRST!
                const deleteBtn = e.target.closest('[data-delete-id]');
                if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = deleteBtn.getAttribute('data-delete-id');
                    this.deleteMuseumItem(id);
                    return;
                }

                // Check preview button SECOND!
                const previewBtn = e.target.closest('[data-preview-id]');
                if (previewBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = previewBtn.getAttribute('data-preview-id');
                    this.previewMuseumItem(id);
                    return;
                }
            });
        }

        let gallery = Storage.getPaintingGallery();
        if (!gallery || gallery.length === 0) {
            const legacyImg = Storage.getPainting();
            if (!legacyImg) {
                grid.innerHTML = `<p style="font-size: 0.78rem; color: var(--text-muted); grid-column: 1/-1; text-align: center;">Dibuja en el lienzo y toca "Guardar obra" para exponer tu primer cuadro en la galería.</p>`;
                return;
            }
            gallery = [{
                id: 'art_legacy',
                dataUrl: legacyImg,
                timestamp: Date.now(),
                mode: 'constellation'
            }];
        }

        // Sort chronologically: newest first!
        gallery.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        grid.innerHTML = gallery.map((item, index) => {
            const d = new Date(item.timestamp || Date.now());
            const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            const formattedDate = `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
            const safeId = item.id || ('art_' + index);

            return `
                <div class="museum-frame glass-panel" style="position:relative; overflow:hidden; border-radius:var(--radius-md); padding:12px; border:1px solid var(--border-gold-subtle); background:rgba(18, 16, 25, 0.9); display:flex; flex-direction:column; gap:10px;">
                    <!-- Canvas Image Preview -->
                    <div style="width:100%; aspect-ratio:4/3; background:#0f0f14; border-radius:var(--radius-sm); overflow:hidden; border:1px solid rgba(255,255,255,0.1); cursor:pointer; position:relative;" data-preview-id="${safeId}">
                        <img src="${item.dataUrl}" style="width:100%; height:100%; object-fit:contain; display:block;" alt="Obra de Arte">
                    </div>
                    
                    <!-- Highly Legible Metallic Brass Title Plaque -->
                    <div class="museum-plate" style="background: linear-gradient(135deg, #f5e4b3, #e6c875); color: #0a0a0f; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.05em; padding: 5px 8px; border-radius: 4px; text-align: center; border: 1px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.6); text-transform: uppercase; text-shadow: none;">
                        ✨ Nuestra Constante № ${gallery.length - index}
                    </div>

                    <!-- Clear Single Line Date & Time -->
                    <div style="font-size:0.75rem; color:var(--text-muted); text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        📅 ${formattedDate}
                    </div>

                    <!-- Prominent Interactive Action Buttons -->
                    <div style="display:flex; align-items:center; justify-content:center; gap:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">
                        <button type="button" class="btn-primary-luxury btn-sm" data-preview-id="${safeId}" style="padding:6px 14px; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px; cursor:pointer;">
                            <span>🔍 Ver obra</span>
                        </button>
                        <button type="button" class="btn-secondary-luxury btn-sm" data-delete-id="${safeId}" style="padding:6px 12px; font-size:0.78rem; border-color:rgba(201, 74, 94, 0.5); color:var(--accent-rose); display:inline-flex; align-items:center; gap:4px; cursor:pointer;">
                            <span>🗑️ Eliminar</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    previewMuseumItem(id) {
        const gallery = Storage.getPaintingGallery();
        let item = gallery.find(i => String(i.id) === String(id));
        if (!item) {
            const legacyImg = Storage.getPainting();
            if (legacyImg) {
                item = { id: 'art_legacy', dataUrl: legacyImg, timestamp: Date.now() };
            }
        }
        if (!item) return;

        const formattedDate = new Date(item.timestamp || Date.now()).toLocaleString('es-MX', {
            dateStyle: 'full',
            timeStyle: 'short'
        });

        showLuxuryNotice({
            icon: '🖼️',
            title: 'EXPOSICIÓN DE ARTE EN MUSEO',
            message: `
                <div style="text-align:center; padding:6px 0;">
                    <img src="${item.dataUrl}" style="width:100%; max-height:55vh; object-fit:contain; border-radius:8px; border:2px solid var(--accent-gold); margin-bottom:12px; box-shadow:0 0 25px rgba(230, 200, 117, 0.3);" alt="Obra de Arte Ampliada">
                    <span style="font-size:0.82rem; color:var(--accent-gold); font-weight:600; display:block;">📅 Exposición guardada el ${formattedDate} ❤️</span>
                </div>
            `
        });
    },

    async deleteMuseumItem(id) {
        const confirmed = await showLuxuryConfirm({
            icon: '🗑️',
            title: 'ELIMINAR OBRA DEL MUSEO',
            message: '¿Desean retirar esta obra de la galería de recuerdos?',
            confirmText: 'Sí, retirar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            Storage.deletePaintingFromGallery(id);
            try { localStorage.removeItem(Storage.KEYS.PAINTING); } catch (e) {}
            if (window.Sound) window.Sound.playDelete();
            this.renderMuseumGallery();

            showLuxuryNotice({
                icon: '🧹',
                title: 'OBRA RETIRADA',
                message: 'La obra ha sido retirada exitosamente de nuestra galería privada.'
            });
        }
    },

    loadSavedPainting() {
        // Obsolete overwrite: gallery handles saved paintings
        this.renderMuseumGallery();
    },

    updateRoadmap() {
        const startDateTimestamp = Storage.getStartDate();
        const days = startDateTimestamp ? Math.max(0, Math.floor((Date.now() - startDateTimestamp) / (1000 * 60 * 60 * 24))) : 0;
        const stageTag = document.getElementById('canvasStageTag');

        const steps = [
            { id: 'stepRoadmap0', daysRequired: 0, tag: 'Nuestra primera pincelada & constelación' },
            { id: 'stepRoadmap1', daysRequired: 30, tag: 'Etapa 1: Luna Llena (1 Mes)' },
            { id: 'stepRoadmap3', daysRequired: 90, tag: 'Etapa 2: Marco Dorado (3 Meses)' },
            { id: 'stepRoadmap6', daysRequired: 180, tag: 'Etapa 3: Latido Central (6 Meses)' },
            { id: 'stepRoadmap12', daysRequired: 365, tag: 'Etapa 4: Obra Maestra (1 Año)' }
        ];

        let activeStepId = 'stepRoadmap0';
        let activeTagText = 'Nuestra primera pincelada & constelación';

        steps.forEach(step => {
            const el = document.getElementById(step.id);
            if (!el) return;

            if (days >= step.daysRequired) {
                el.classList.remove('locked');
                el.style.opacity = '1';
                el.style.cursor = 'pointer';
                activeStepId = step.id;
                activeTagText = step.tag;
            } else {
                el.classList.add('locked');
                el.style.opacity = '0.4';
                el.style.cursor = 'not-allowed';
                el.title = `Bloqueado hasta cumplir ${step.daysRequired} días juntos`;
            }
        });

        // Set active current step
        document.querySelectorAll('.roadmap-step').forEach(s => s.classList.remove('current'));
        const currentEl = document.getElementById(activeStepId);
        if (currentEl) currentEl.classList.add('current');
        if (stageTag && this.currentCanvasMode === 'constellation') {
            stageTag.textContent = activeTagText;
        }
    }
};
