/* ==========================================================================
   OUR TIME — DIGITAL LETTER MODULE ("Desde aquel momento...")
   ========================================================================== */

const Letter = {
    init() {
        this.updateCard();
        this.bindEvents();
    },

    getTodayLetter() {
        const customLetters = Storage.getCustomLetters();
        if (customLetters && customLetters.length > 0) {
            return customLetters[0]; // Newest user custom written letter
        }

        const letters = AppConfig.dailyLetters || [];
        if (letters.length === 0) {
            return {
                title: "Desde aquel momento...",
                line1: "No sé cuánto tiempo tendremos para escribir esta historia.",
                line2: "Pero sí sé con quién quiero escribirla."
            };
        }

        // Days since Unix Epoch to rotate letter every single day at midnight
        const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const index = dayIndex % letters.length;
        return letters[index];
    },

    updateCard() {
        const todayLetter = this.getTodayLetter();
        const cardTitle = document.querySelector('.letter-card-title');
        const cardSnippet = document.querySelector('.letter-card-snippet');
        const cardBadge = document.querySelector('.letter-badge');

        if (cardTitle) cardTitle.textContent = `"${todayLetter.title}"`;
        if (cardSnippet) cardSnippet.textContent = `${todayLetter.line1} ${todayLetter.line2}`;
        if (cardBadge) cardBadge.textContent = `Carta de hoy ✨`;
    },

    async promptWriteCustomLetter() {
        const letterModal = document.getElementById('letterModal');
        if (letterModal) letterModal.classList.add('hidden');

        const res = await showLuxuryPrompt();
        if (!res || !res.title || !res.text) return;

        Storage.addCustomLetter({
            title: res.title,
            line1: res.text,
            line2: "— Escrito especialmente para ti con todo mi amor. ❤️"
        });

        this.updateCard();
        showLuxuryNotice({
            icon: '💌',
            title: '¡MENSAJE GUARDADO!',
            message: 'Tu carta personalizada ha sido guardada en la nube y se mostrará en la pantalla principal. ❤️'
        });
    },

    bindEvents() {
        const modal = document.getElementById('letterModal');
        const btnClose = document.getElementById('btnCloseLetter');
        const btnOpenTop = document.getElementById('btnOpenLetterTop');
        const cardEntry = document.getElementById('cardDigitalLetter');
        const btnOpenFooter = document.getElementById('btnOpenLetterFooter');

        const btnSeal = document.getElementById('btnPressWaxSeal');
        const sealWrapper = document.getElementById('waxSealWrapper');
        const textContent = document.getElementById('letterParagraphsBox');

        const openModal = () => {
            if (modal) {
                // Populate today's letter content
                const todayLetter = this.getTodayLetter();
                const modalTag = modal.querySelector('.letter-modal-tag');
                const line1 = modal.querySelector('.letter-p.line-1');
                const line2 = modal.querySelector('.letter-p.line-2');

                if (modalTag) modalTag.textContent = todayLetter.title;
                if (line1) line1.textContent = `"${todayLetter.line1}"`;
                if (line2) line2.textContent = `"${todayLetter.line2}"`;

                // Reset seal state
                if (sealWrapper) sealWrapper.classList.remove('hidden');
                if (textContent) textContent.classList.add('hidden');
                modal.classList.remove('hidden');
            }
        };

        if (btnSeal) {
            btnSeal.addEventListener('click', () => {
                if (sealWrapper) sealWrapper.classList.add('hidden');
                if (textContent) textContent.classList.remove('hidden');
            });
        }

        const closeModal = () => {
            if (modal) modal.classList.add('hidden');
        };

        const btnWriteCustom = document.getElementById('btnWriteCustomLetter');
        if (btnWriteCustom) {
            btnWriteCustom.addEventListener('click', () => this.promptWriteCustomLetter());
        }

        if (btnOpenTop) btnOpenTop.addEventListener('click', openModal);
        if (cardEntry) cardEntry.addEventListener('click', openModal);
        if (btnOpenFooter) btnOpenFooter.addEventListener('click', openModal);
        if (btnClose) btnClose.addEventListener('click', closeModal);

        if (modal) {
            const backdrop = modal.querySelector('.modal-backdrop');
            if (backdrop) backdrop.addEventListener('click', closeModal);
        }
    }
};
