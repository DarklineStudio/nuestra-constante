/* ==========================================================================
   OUR TIME — LUXURY CLOCK COUNTER MODULE
   ========================================================================== */

const Counter = {
    timerId: null,
    bound: false,

    start() {
        this.update();
        if (!this.bound) {
            this.bound = true;
            this.bindPoeticClicks();
        }
        if (this.timerId) clearInterval(this.timerId);
        this.timerId = setInterval(() => this.update(), 1000);
    },

    bindPoeticClicks() {
        const daysElem = document.querySelector('.clock-days-wrapper');
        const hoursItem = document.getElementById('counterHours')?.parentElement;
        const minutesItem = document.getElementById('counterMinutes')?.parentElement;
        const secondsItem = document.getElementById('counterSeconds')?.parentElement;

        const totalHoursItem = document.getElementById('counterTotalHours')?.parentElement;
        const totalMinutesItem = document.getElementById('counterTotalMinutes')?.parentElement;
        const totalSecondsItem = document.getElementById('counterTotalSeconds')?.parentElement;

        const showDaysMessage = () => {
            const days = document.getElementById('counterDays')?.textContent || '0';
            showLuxuryNotice({
                icon: '✨',
                title: 'DÍAS JUNTOS',
                message: `Esos <strong>${days} días</strong> equivalen a ${days} amaneceres despertando sabiendo que eres mi novia. ❤️`
            });
        };

        const showHoursMessage = () => {
            const hours = document.getElementById('counterTotalHours')?.textContent || '0';
            showLuxuryNotice({
                icon: '⏱️',
                title: 'HORAS COMPARTIDAS',
                message: `Cada una de esas <strong>${hours} horas</strong> compartiendo sueños, risas y crecimiento ha valido absolutamente la pena. ✨`
            });
        };

        const showMinutesMessage = () => {
            const mins = document.getElementById('counterTotalMinutes')?.textContent || '0';
            showLuxuryNotice({
                icon: '💫',
                title: 'MINUTOS JUNTOS',
                message: `Construyendo nuestro futuro juntos, <strong>${mins} minutos</strong> acumulados de amor. ❤️`
            });
        };

        const showSecondsMessage = () => {
            const secs = document.getElementById('counterTotalSeconds')?.textContent || '0';
            showLuxuryNotice({
                icon: '💓',
                title: 'SEGUNDOS DE AMOR',
                message: `Más de <strong>${secs} latidos</strong> del corazón dedicados únicamente a ti. ✨`
            });
        };

        if (daysElem) daysElem.addEventListener('click', showDaysMessage);
        
        if (hoursItem) hoursItem.addEventListener('click', showHoursMessage);
        if (totalHoursItem) totalHoursItem.addEventListener('click', showHoursMessage);

        if (minutesItem) minutesItem.addEventListener('click', showMinutesMessage);
        if (totalMinutesItem) totalMinutesItem.addEventListener('click', showMinutesMessage);

        if (secondsItem) secondsItem.addEventListener('click', showSecondsMessage);
        if (totalSecondsItem) totalSecondsItem.addEventListener('click', showSecondsMessage);
    },

    update() {
        const startDateTimestamp = Storage.getStartDate();
        if (!startDateTimestamp) return;

        const now = Date.now();
        const diffMs = Math.max(0, now - startDateTimestamp);

        // Calculations
        const totalSeconds = Math.floor(diffMs / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.floor(totalHours / 24);

        const remainingHours = totalHours % 24;
        const remainingMinutes = totalMinutes % 60;
        const remainingSeconds = totalSeconds % 60;

        // Render Primary Counter
        const elemDays = document.getElementById('counterDays');
        const elemHours = document.getElementById('counterHours');
        const elemMinutes = document.getElementById('counterMinutes');
        const elemSeconds = document.getElementById('counterSeconds');

        if (elemDays) elemDays.textContent = String(days).padStart(3, '0');
        if (elemHours) elemHours.textContent = String(remainingHours).padStart(2, '0');
        if (elemMinutes) elemMinutes.textContent = String(remainingMinutes).padStart(2, '0');
        if (elemSeconds) elemSeconds.textContent = String(remainingSeconds).padStart(2, '0');

        // Render Breakdown Stats
        const elemTotalHours = document.getElementById('counterTotalHours');
        const elemTotalMinutes = document.getElementById('counterTotalMinutes');
        const elemTotalSeconds = document.getElementById('counterTotalSeconds');

        if (elemTotalHours) elemTotalHours.textContent = totalHours.toLocaleString('es-MX');
        if (elemTotalMinutes) elemTotalMinutes.textContent = totalMinutes.toLocaleString('es-MX');
        if (elemTotalSeconds) elemTotalSeconds.textContent = totalSeconds.toLocaleString('es-MX');

        // Render Start Date Stamp & Moon Phase (cached once per timestamp)
        const elemStamp = document.getElementById('startDateStamp');
        if (elemStamp && this.lastStampTs !== startDateTimestamp) {
            this.lastStampTs = startDateTimestamp;
            const startDate = new Date(startDateTimestamp);
            const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
            const dateStr = startDate.toLocaleDateString('es-MX', optionsDate);
            const timeStr = startDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            elemStamp.textContent = `Nuestra historia comenzó el ${dateStr} a las ${timeStr}`;
            
            this.updateMoonPhase(startDate);
        }
    },

    updateMoonPhase(date) {
        const moonTitle = document.getElementById('moonPhaseTitle');
        const iconElem = document.querySelector('.moon-icon-graphic');
        if (!moonTitle) return;

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // Approximate astronomical Moon phase index (0 to 7)
        const c = Math.floor(3.6525 * year);
        const e = Math.floor(30.6 * month);
        const jd = c + e + day - 694039.09; // Julian days from known new moon
        const b = jd / 29.5305882; // Moon synodic cycle
        const phase = Math.round((b - Math.floor(b)) * 8) % 8;

        const phases = [
            { title: 'Luna Nueva Dorada', icon: '🌑' },
            { title: 'Luna Creciente', icon: '🌒' },
            { title: 'Cuarto Creciente', icon: '🌓' },
            { title: 'Luna Gibosa Creciente', icon: '🌔' },
            { title: 'Luna Llena Dorada', icon: '🌕' },
            { title: 'Luna Gibosa Menguante', icon: '🌖' },
            { title: 'Cuarto Menguante', icon: '🌗' },
            { title: 'Luna Menguante', icon: '🌘' }
        ];

        const currentMoon = phases[phase] || phases[4];
        moonTitle.textContent = currentMoon.title;
        if (iconElem) iconElem.textContent = currentMoon.icon;
    }
};
