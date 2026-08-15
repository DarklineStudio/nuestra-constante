/* ==========================================================================
   NUESTRA CONSTANTE — PURE CLOUD-FIRST PERSISTENCE MODULE (Supabase API)
   ========================================================================== */

const Storage = {
    KEYS: {
        START_DATE: 'nuestraconstante_relationshipStartDate',
        TIMELINE_EVENTS: 'nuestraconstante_timelineEvents',
        MEMORIES: 'nuestraconstante_memories',
        PAINTING: 'nuestraconstante_paintingData',
        PAINTING_GALLERY: 'nuestraconstante_paintingGallery',
        ACHIEVEMENTS: 'nuestraconstante_achievementsState',
        CUSTOM_LETTERS: 'nuestraconstante_customLetters',
        MUSIC_DEDICATIONS: 'nuestraconstante_musicDedications',
        STORY_CATEGORIES: 'nuestraconstante_storyCategories'
    },

    supabaseClient: null,
    pollingInterval: null,

    // Single Source of Truth Cloud Memory State
    cloudState: {
        start_date: null,
        timeline_events: [],
        memories: [],
        painting_data: null,
        achievements_state: {},
        custom_letters: [],
        music_dedications: [],
        published_capsules: []
    },

    // Initialize Connection & Polling
    async initCloud() {
        if (window.AppConfig && AppConfig.supabase && AppConfig.supabase.url && AppConfig.supabase.url !== "YOUR_SUPABASE_URL") {
            if (window.supabase) {
                try {
                    this.supabaseClient = window.supabase.createClient(AppConfig.supabase.url, AppConfig.supabase.anonKey);
                } catch (e) {}
            }
        }

        // Mandatory Direct Cloud Sync before anything is rendered
        await this.syncFromCloud();
        this.subscribeToRealtime();
        this.startHeartbeatPolling();
    },

    startHeartbeatPolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        this.pollingInterval = setInterval(async () => {
            await this.pollCloudState();
        }, 2000);
    },

    // Direct Native Anti-Cache HTTP Fetch Engine for Supabase REST API
    async fetchCloudDirect() {
        try {
            const url = `https://lssecgytpirrplzdgiyk.supabase.co/rest/v1/relationship_state?select=*&_t=${Date.now()}`;
            const headers = {
                'apikey': 'sb_publishable_ho9eFiczRfwDzG6UCBwOUQ_li6AEl91',
                'Authorization': 'Bearer sb_publishable_ho9eFiczRfwDzG6UCBwOUQ_li6AEl91',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            };
            const response = await fetch(url, { method: 'GET', headers, cache: 'no-store' });
            if (response.ok) {
                const list = await response.json();
                if (Array.isArray(list) && list.length > 0) {
                    return list[0];
                }
            }
        } catch (e) {
            console.warn('Cloud fetch error:', e);
        }
        return null;
    },

    async saveCloudDirect(payload) {
        try {
            const url = `https://lssecgytpirrplzdgiyk.supabase.co/rest/v1/relationship_state`;
            const headers = {
                'apikey': 'sb_publishable_ho9eFiczRfwDzG6UCBwOUQ_li6AEl91',
                'Authorization': 'Bearer sb_publishable_ho9eFiczRfwDzG6UCBwOUQ_li6AEl91',
                'Prefer': 'resolution=merge-duplicates',
                'Content-Type': 'application/json'
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errText = await response.text();
                console.error('❌ Error al guardar en Supabase Cloud:', response.status, errText);
            } else {
                console.log('☁️ Sincronización exitosa en Supabase Cloud');
            }
        } catch (e) {
            console.warn('Direct save error:', e);
        }
    },

    async pollCloudState() {
        try {
            const data = await this.fetchCloudDirect();
            if (data) {
                const cloudUpdatedStr = data.updated_at || '';
                const cloudStartDate = data.start_date || null;

                const lastKnownUpdated = localStorage.getItem('nuestraconstante_lastCloudUpdated') || '';
                const localStartDate = this.getStartDate();

                const startStateChanged = (!!cloudStartDate) !== (!!localStartDate);
                const cloudDateDiffers = cloudStartDate && localStartDate && String(cloudStartDate) !== String(localStartDate);
                const contentUpdated = cloudUpdatedStr && cloudUpdatedStr !== lastKnownUpdated;

                if (startStateChanged || cloudDateDiffers || contentUpdated) {
                    console.log('⚡ Cambio en la nube detectado, sincronizando...');
                    localStorage.setItem('nuestraconstante_lastCloudUpdated', cloudUpdatedStr);
                    const wasStartedBefore = !!localStartDate;
                    await this.syncFromCloud();
                    const isStartedNow = !!this.getStartDate();

                    if (!wasStartedBefore && isStartedNow) {
                        window.location.reload();
                        return;
                    }

                    if (wasStartedBefore && !isStartedNow) {
                        window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now();
                        return;
                    }

                    if (window.Counter) window.Counter.update();
                    if (window.Timeline) window.Timeline.render();
                    if (window.Painting) window.Painting.renderMuseumGallery();
                    if (window.Music) window.Music.render();
                }
            }
        } catch (e) {
            console.log('Polling error:', e);
        }
    },

    subscribeToRealtime() {
        if (!this.supabaseClient) return;
        try {
            this.supabaseClient
                .channel('public:relationship_state')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'relationship_state' }, async () => {
                    await this.pollCloudState();
                })
                .subscribe();
        } catch (e) {
            console.warn('Realtime subscription info:', e);
        }
    },

    // Sync from Supabase Cloud directly into Cloud State Memory
    async syncFromCloud() {
        try {
            let data = await this.fetchCloudDirect();
            if (!data && this.supabaseClient) {
                const res = await this.supabaseClient.from('relationship_state').select('*').single();
                if (res && res.data) data = res.data;
            }

            if (data && data.start_date !== null && data.start_date !== undefined && data.start_date !== '') {
                let ts = data.start_date.toString();
                if (!/^\d+$/.test(ts)) {
                    const parsed = Date.parse(ts);
                    if (!isNaN(parsed)) ts = parsed.toString();
                }
                this.cloudState.start_date = ts;
                this.cloudState.timeline_events = Array.isArray(data.timeline_events) ? data.timeline_events : [];
                this.cloudState.memories = Array.isArray(data.memories) ? data.memories : [];
                this.cloudState.painting_data = data.painting_data || null;
                this.cloudState.achievements_state = data.achievements_state || {};
                
                // Secondary mirror to local storage
                localStorage.setItem(this.KEYS.START_DATE, ts);
                localStorage.setItem(this.KEYS.TIMELINE_EVENTS, JSON.stringify(this.cloudState.timeline_events));
            } else {
                // Cloud DB is RESET or NULL
                this.cloudState.start_date = null;
                this.cloudState.timeline_events = [];
                this.cloudState.memories = [];
                this.cloudState.painting_data = null;
                this.cloudState.achievements_state = {};
                try {
                    localStorage.clear();
                } catch (e) {}
            }
            console.log('☁️ Memoria central cargada desde Supabase Cloud');
        } catch (e) {
            console.log('Cloud sync info:', e);
        }
    },

    async syncToCloud() {
        try {
            const payload = {
                id: 1,
                start_date: this.cloudState.start_date,
                timeline_events: this.cloudState.timeline_events,
                memories: this.cloudState.memories,
                painting_data: this.cloudState.painting_data,
                achievements_state: this.cloudState.achievements_state,
                updated_at: new Date().toISOString()
            };

            await this.saveCloudDirect(payload);
        } catch (e) {
            console.log('Cloud upload info:', e);
        }
    },

    ensureDataIntegrity() {
        let startDateTs = this.getStartDate();
        if (!startDateTs) return;

        let events = this.getTimelineEvents();
        if (!events || events.length === 0) {
            const startDateObj = new Date(startDateTs);
            const initialEvent = {
                id: 'event_begin',
                title: 'El comienzo',
                date: startDateObj.toISOString().split('T')[0],
                time: startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: 'El día en que comenzó nuestro tiempo y nuestra historia vital.',
                isInitial: true
            };
            this.cloudState.timeline_events.push(initialEvent);
            this.syncToCloud();
        }
    },

    // Getters & Setters read directly from Cloud State Memory
    getStartDate() {
        if (!this.cloudState.start_date) return null;
        const val = this.cloudState.start_date.toString();
        if (/^\d+$/.test(val.trim())) {
            return parseInt(val.trim(), 10);
        }
        const parsed = Date.parse(val);
        return isNaN(parsed) ? null : parsed;
    },

    async setStartDate(timestamp) {
        const ts = (timestamp || Date.now()).toString();
        this.cloudState.start_date = ts;
        localStorage.setItem(this.KEYS.START_DATE, ts);
        await this.syncToCloud();
    },

    getTimelineEvents() {
        return this.cloudState.timeline_events || [];
    },

    async addTimelineEvent(event) {
        this.cloudState.timeline_events.unshift(event);
        await this.syncToCloud();
        return this.cloudState.timeline_events;
    },

    async deleteTimelineEvent(id) {
        this.cloudState.timeline_events = this.cloudState.timeline_events.filter(e => String(e.id) !== String(id));
        await this.syncToCloud();
        return this.cloudState.timeline_events;
    },

    getMemories() {
        return this.cloudState.memories || [];
    },

    async addMemory(memory) {
        this.cloudState.memories.unshift(memory);
        await this.syncToCloud();
        return this.cloudState.memories;
    },

    getPainting() {
        return this.cloudState.painting_data || null;
    },

    async savePainting(paintingData) {
        this.cloudState.painting_data = paintingData;
        await this.syncToCloud();
    },

    getAchievementsState() {
        return this.cloudState.achievements_state || {};
    },

    async saveAchievementState(achievementId, isUnlocked, unlockedAt) {
        if (!this.cloudState.achievements_state) this.cloudState.achievements_state = {};
        this.cloudState.achievements_state[achievementId] = { isUnlocked, unlockedAt };
        await this.syncToCloud();
    },

    getStoryCategories() {
        const defaultCategories = ['✨ Especiales', '✈️ Viajes & Citas', '🏋️ Deporte & Entrenamiento', '🌹 San Valentín & Fechas'];
        const saved = localStorage.getItem(this.KEYS.STORY_CATEGORIES);
        if (!saved) return defaultCategories;
        try {
            const list = JSON.parse(saved);
            return Array.from(new Set([...defaultCategories, ...list]));
        } catch (e) {
            return defaultCategories;
        }
    },

    addStoryCategory(category) {
        const current = this.getStoryCategories();
        if (!current.includes(category)) {
            current.push(category);
            localStorage.setItem(this.KEYS.STORY_CATEGORIES, JSON.stringify(current));
        }
        return current;
    },

    getCustomLetters() {
        return this.cloudState.custom_letters || [];
    },

    async addCustomLetter(letter) {
        this.cloudState.custom_letters.unshift(letter);
        await this.syncToCloud();
        return this.cloudState.custom_letters;
    },

    getMusicDedications() {
        return this.cloudState.music_dedications || [];
    },

    async addMusicDedication(song) {
        this.cloudState.music_dedications.unshift(song);
        await this.syncToCloud();
        return this.cloudState.music_dedications;
    },

    async deleteMusicDedication(id) {
        this.cloudState.music_dedications = this.cloudState.music_dedications.filter(s => String(s.id) !== String(id));
        await this.syncToCloud();
        return this.cloudState.music_dedications;
    },

    async resetForDelivery() {
        this.cloudState.start_date = null;
        this.cloudState.timeline_events = [];
        this.cloudState.memories = [];
        this.cloudState.painting_data = null;
        this.cloudState.achievements_state = {};
        this.cloudState.custom_letters = [];
        this.cloudState.music_dedications = [];

        try {
            localStorage.clear();
        } catch (e) {}

        await this.saveCloudDirect({
            id: 1,
            start_date: null,
            timeline_events: [],
            memories: [],
            painting_data: null,
            achievements_state: {},
            updated_at: new Date().toISOString()
        });

        window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now();
    }
};

window.Storage = Storage;
