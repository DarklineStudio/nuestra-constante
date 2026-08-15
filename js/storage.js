/* ==========================================================================
   NUESTRA CONSTANTE — CLOUD PERSISTENCE & REALTIME STORAGE MODULE (Supabase/IndexedDB)
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
        STORY_CATEGORIES: 'nuestraconstante_storyCategories',
        SUPABASE_URL: 'nuestraconstante_supabaseUrl',
        SUPABASE_KEY: 'nuestraconstante_supabaseKey'
    },

    supabaseClient: null,

    // Initialize Supabase Cloud Connection & Realtime Listener + Heartbeat Polling
    initCloud() {
        if (window.AppConfig && AppConfig.supabase && AppConfig.supabase.url && AppConfig.supabase.url !== "YOUR_SUPABASE_URL") {
            if (window.supabase) {
                this.supabaseClient = window.supabase.createClient(AppConfig.supabase.url, AppConfig.supabase.anonKey);
                console.log('⚡ Supabase Cloud Database conectado exitosamente');
                this.syncFromCloud();
                this.subscribeToRealtime();
                this.startHeartbeatPolling();
            }
        }
    },

    startHeartbeatPolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        // Forced 2-second cloud sync polling to guarantee instant updates on mobile Safari & Android Chrome!
        this.pollingInterval = setInterval(async () => {
            await this.pollCloudState();
        }, 2000);
    },

    async pollCloudState() {
        if (!this.supabaseClient) return;

        try {
            const { data, error } = await this.supabaseClient.from('relationship_state').select('updated_at, start_date').single();
            if (data && !error) {
                const cloudUpdatedStr = data.updated_at || '';
                const cloudStartDate = data.start_date;

                const lastKnownUpdated = localStorage.getItem('nuestraconstante_lastCloudUpdated') || '';
                const localStartDate = this.getStartDate();

                const startStateChanged = (!!cloudStartDate) !== (!!localStartDate);
                const cloudDateDiffers = cloudStartDate && localStartDate && String(cloudStartDate) !== String(localStartDate);
                const contentUpdated = cloudUpdatedStr && cloudUpdatedStr !== lastKnownUpdated;

                if (startStateChanged || cloudDateDiffers || contentUpdated) {
                    console.log('⚡ Cambio detectado en tiempo real en la nube, forzando actualización...');
                    localStorage.setItem('nuestraconstante_lastCloudUpdated', cloudUpdatedStr);
                    const wasStartedBefore = !!localStartDate;
                    await this.syncFromCloud();
                    const isStartedNow = !!this.getStartDate();

                    // If YES proposal was accepted remotely on Device A, reload Device B immediately into Main App
                    if (!wasStartedBefore && isStartedNow) {
                        window.location.reload();
                        return;
                    }

                    // If reset was triggered remotely on another device, reload immediately to proposal screen
                    if (wasStartedBefore && !isStartedNow) {
                        window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now();
                        return;
                    }

                    // Otherwise refresh UI components on active screen
                    if (window.Counter) window.Counter.update();
                    if (window.Timeline) window.Timeline.render();
                    if (window.Painting) window.Painting.renderMuseumGallery();
                    if (window.Music) window.Music.render();
                }
            }
        } catch (e) {
            console.log('Polling check info:', e);
        }
    },

    // Subscribe to realtime database changes across all devices
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

    // Sync all state from Supabase Cloud to LocalStorage
    async syncFromCloud() {
        if (!this.supabaseClient) return;

        try {
            const { data, error } = await this.supabaseClient.from('relationship_state').select('*').single();
            if (data && !error) {
                // Synchronize START_DATE strictly: if null in cloud, clear local devices too!
                if (data.start_date !== undefined && data.start_date !== null && data.start_date !== '') {
                    let ts = data.start_date.toString();
                    if (!/^\d+$/.test(ts)) {
                        const parsed = Date.parse(ts);
                        if (!isNaN(parsed)) ts = parsed.toString();
                    }
                    localStorage.setItem(this.KEYS.START_DATE, ts);
                } else {
                    localStorage.removeItem(this.KEYS.START_DATE);
                    localStorage.removeItem('ourtime_relationshipStartDate');
                    localStorage.removeItem('nuestraconstante_relationshipStartDate');
                }

                if (Array.isArray(data.timeline_events)) {
                    localStorage.setItem(this.KEYS.TIMELINE_EVENTS, JSON.stringify(data.timeline_events));
                }
                if (Array.isArray(data.memories)) {
                    localStorage.setItem(this.KEYS.MEMORIES, JSON.stringify(data.memories));
                }
                if (data.painting_data !== undefined) {
                    if (data.painting_data) {
                        localStorage.setItem(this.KEYS.PAINTING, data.painting_data);
                    } else {
                        localStorage.removeItem(this.KEYS.PAINTING);
                    }
                }
                if (data.achievements_state) {
                    localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements_state));
                }
                console.log('☁️ Sincronización completa desde Supabase Cloud realizada');
            }
        } catch (e) {
            console.log('Cloud sync info:', e);
        }
    },

    // Save full state to Supabase Cloud
    async syncToCloud() {
        if (!this.supabaseClient) return;

        try {
            const payload = {
                id: 1, // Single row pair state
                start_date: this.getStartDate(),
                timeline_events: this.getTimelineEvents(),
                memories: this.getMemories(),
                painting_data: this.getPainting(),
                achievements_state: this.getAchievementsState(),
                updated_at: new Date().toISOString()
            };

            await this.supabaseClient.from('relationship_state').upsert(payload);
        } catch (e) {
            console.log('Cloud upload info:', e);
        }
    },

    ensureDataIntegrity() {
        let startDateTs = this.getStartDate();
        if (!startDateTs) return; // Never auto-generate a start date if not accepted yet!

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
            this.addTimelineEvent(initialEvent);
        }
    },

    // Start Date Management
    getStartDate() {
        const val = localStorage.getItem(this.KEYS.START_DATE);
        if (!val) return null;
        if (/^\d+$/.test(val.trim())) {
            return parseInt(val.trim(), 10);
        }
        const parsed = Date.parse(val);
        return isNaN(parsed) ? null : parsed;
    },

    setStartDate(timestamp) {
        const ts = (timestamp || Date.now()).toString();
        localStorage.setItem(this.KEYS.START_DATE, ts);
        localStorage.removeItem('ourtime_relationshipStartDate');
        this.syncToCloud();
    },

    // Timeline Events Management
    getTimelineEvents() {
        const data = localStorage.getItem(this.KEYS.TIMELINE_EVENTS) || localStorage.getItem('ourtime_timelineEvents');
        let events = [];
        try {
            events = data ? JSON.parse(data) : [];
        } catch (e) {
            events = [];
        }
        return events;
    },

    addTimelineEvent(event) {
        const events = this.getTimelineEvents();
        events.unshift(event);
        try {
            localStorage.setItem(this.KEYS.TIMELINE_EVENTS, JSON.stringify(events));
        } catch (e) {
            console.warn('LocalStorage limit reached for photos, saving event without heavy photo payload', e);
            if (event.photo && event.photo.length > 500000) {
                event.photo = null;
                localStorage.setItem(this.KEYS.TIMELINE_EVENTS, JSON.stringify(events));
            }
        }
        this.syncToCloud();
        return events;
    },

    // Photo Memories Gallery Management
    getMemories() {
        const data = localStorage.getItem(this.KEYS.MEMORIES);
        return data ? JSON.parse(data) : [];
    },

    addMemory(memory) {
        const memories = this.getMemories();
        memories.unshift(memory);
        try {
            localStorage.setItem(this.KEYS.MEMORIES, JSON.stringify(memories));
        } catch (e) {
            console.warn('LocalStorage error', e);
        }
        this.syncToCloud();
        return memories;
    },

    // Painting Canvas & Gallery Collection Management
    getPainting() {
        return localStorage.getItem(this.KEYS.PAINTING);
    },

    savePainting(dataUrl) {
        try {
            localStorage.setItem(this.KEYS.PAINTING, dataUrl);
        } catch (e) {}
        this.syncToCloud();
    },

    getPaintingGallery() {
        try {
            const data = localStorage.getItem(this.KEYS.PAINTING_GALLERY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    savePaintingToGallery(item) {
        try {
            const gallery = this.getPaintingGallery();
            gallery.unshift(item); // Insert newest at top (chronological ordering)
            localStorage.setItem(this.KEYS.PAINTING_GALLERY, JSON.stringify(gallery));
        } catch (e) {
            console.warn('LocalStorage error while saving artwork', e);
        }
        this.syncToCloud();
    },

    deletePaintingFromGallery(id) {
        try {
            let gallery = this.getPaintingGallery();
            gallery = gallery.filter(item => String(item.id) !== String(id));
            localStorage.setItem(this.KEYS.PAINTING_GALLERY, JSON.stringify(gallery));
            // Always clear legacy single painting to prevent 2-step deletion fallback bug
            localStorage.removeItem(this.KEYS.PAINTING);
        } catch (e) {}
        this.syncToCloud();
    },

    // Story Categories Management
    getStoryCategories() {
        const defaultCats = ['✈️ Viajes', '🏋️‍♂️ Gym', '🥋 Taekwondo', '🌹 Citas', '✨ Especiales'];
        try {
            const data = localStorage.getItem(this.KEYS.STORY_CATEGORIES);
            if (!data) return defaultCats;
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCats;
        } catch (e) {
            return defaultCats;
        }
    },

    addStoryCategory(category) {
        if (!category || typeof category !== 'string') return;
        const cleanCat = category.trim();
        if (!cleanCat) return;
        
        const categories = this.getStoryCategories();
        if (!categories.includes(cleanCat)) {
            categories.push(cleanCat);
            try {
                localStorage.setItem(this.KEYS.STORY_CATEGORIES, JSON.stringify(categories));
            } catch (e) {}
            this.syncToCloud();
        }
        return categories;
    },

    // Achievements State Management
    getAchievementsState() {
        const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
        return data ? JSON.parse(data) : {};
    },

    saveAchievementState(id, isUnlocked, unlockDate) {
        const state = this.getAchievementsState();
        state[id] = { unlocked: isUnlocked, date: unlockDate || new Date().toISOString() };
        try {
            localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(state));
        } catch (e) {}
        this.syncToCloud();
    },

    clearAchievements() {
        localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify({}));
        this.syncToCloud();
    },

    getCustomAchievements() {
        const data = localStorage.getItem('nuestraconstante_customAchievements');
        return data ? JSON.parse(data) : [];
    },

    addCustomAchievement(ach) {
        const list = this.getCustomAchievements();
        list.push(ach);
        localStorage.setItem('nuestraconstante_customAchievements', JSON.stringify(list));
        this.syncToCloud();
        return list;
    },

    getCustomCapsules() {
        const data = localStorage.getItem('nuestraconstante_customCapsules');
        return data ? JSON.parse(data) : [];
    },

    addCustomCapsule(capsule) {
        const list = this.getCustomCapsules();
        list.push(capsule);
        localStorage.setItem('nuestraconstante_customCapsules', JSON.stringify(list));
        this.syncToCloud();
        return list;
    },

    // Custom Letters Management
    getCustomLetters() {
        const data = localStorage.getItem(this.KEYS.CUSTOM_LETTERS);
        return data ? JSON.parse(data) : [];
    },

    addCustomLetter(letter) {
        const letters = this.getCustomLetters();
        letters.unshift(letter);
        localStorage.setItem(this.KEYS.CUSTOM_LETTERS, JSON.stringify(letters));
        this.syncToCloud();
        return letters;
    },

    // Music Dedications Management
    getMusicDedications() {
        const data = localStorage.getItem(this.KEYS.MUSIC_DEDICATIONS);
        return data ? JSON.parse(data) : [];
    },

    addMusicDedication(song) {
        const songs = this.getMusicDedications();
        songs.unshift(song);
        localStorage.setItem(this.KEYS.MUSIC_DEDICATIONS, JSON.stringify(songs));
        this.syncToCloud();
        return songs;
    },

    deleteMusicDedication(id) {
        let songs = this.getMusicDedications();
        songs = songs.filter(s => String(s.id) !== String(id));
        localStorage.setItem(this.KEYS.MUSIC_DEDICATIONS, JSON.stringify(songs));
        this.syncToCloud();
        return songs;
    },

    // Published Capsules Management (Immutability Seal)
    getPublishedCapsules() {
        const data = localStorage.getItem('nuestraconstante_publishedCapsules');
        return data ? JSON.parse(data) : [];
    },

    markCapsulePublished(id) {
        const list = this.getPublishedCapsules();
        if (!list.includes(id)) {
            list.push(id);
            localStorage.setItem('nuestraconstante_publishedCapsules', JSON.stringify(list));
            this.syncToCloud();
        }
        return list;
    },

    isCapsulePublished(id) {
        const list = this.getPublishedCapsules();
        return list.includes(id);
    },

    async resetForDelivery() {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('LocalStorage clear error:', e);
        }

        // Clear Supabase Cloud Database row as well if connected
        if (this.supabaseClient) {
            try {
                await this.supabaseClient
                    .from('relationship_state')
                    .upsert({
                        id: 1,
                        start_date: null,
                        timeline_events: [],
                        memories: [],
                        painting_data: null,
                        achievements_state: {},
                        updated_at: new Date().toISOString()
                    });
            } catch (e) {
                console.warn('Cloud reset error:', e);
            }
        }

        // Hard reload bypassing cache directly to proposal
        window.location.href = window.location.origin + window.location.pathname + '?reset=' + Date.now();
    }
};

