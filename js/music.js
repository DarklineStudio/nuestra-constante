/* ==========================================================================
   NUESTRA CONSTANTE — MUSIC DEDICATIONS MODULE ("Nuestra Música")
   ========================================================================== */

const Music = {
    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const btnAdd = document.getElementById('btnAddMusicDedication');
        const modal = document.getElementById('musicModal');
        const btnClose = document.getElementById('btnCloseMusicModal');
        const form = document.getElementById('formAddMusicDedication');

        if (btnAdd && modal) {
            btnAdd.addEventListener('click', () => {
                form.reset();
                modal.classList.remove('hidden');
            });
        }

        if (btnClose && modal) {
            btnClose.addEventListener('click', () => modal.classList.add('hidden'));
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    },

    getNativeSpotifyUri(url, title, artist) {
        if (!url) {
            return `spotify:search:${encodeURIComponent(title + ' ' + artist)}`;
        }
        
        if (url.startsWith('spotify:')) {
            return url.trim();
        }

        if (url.includes('spotify.com/track/')) {
            const trackId = url.split('track/')[1].split('?')[0];
            return `spotify:track:${trackId}`;
        }

        if (url.includes('spotify.com/album/')) {
            const albumId = url.split('album/')[1].split('?')[0];
            return `spotify:album:${albumId}`;
        }

        if (url.includes('spotify.com/playlist/')) {
            const playlistId = url.split('playlist/')[1].split('?')[0];
            return `spotify:playlist:${playlistId}`;
        }

        // Search query protocol URI for app
        const query = encodeURIComponent(`${title} ${artist}`);
        return `spotify:search:${query}`;
    },

    formatSpotifyUrl(rawUrl, title, artist) {
        if (rawUrl && (rawUrl.includes('open.spotify.com/track/') || rawUrl.includes('open.spotify.com/album/') || rawUrl.includes('open.spotify.com/playlist/') || rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be') || rawUrl.startsWith('spotify:'))) {
            return rawUrl.trim();
        }
        // Fallback: Direct Spotify Deep-Link Search Query for exact song & artist
        const query = encodeURIComponent(`${title} ${artist}`);
        return `https://open.spotify.com/search/${query}`;
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('songTitle').value.trim();
        const artist = document.getElementById('songArtist').value.trim();
        const message = document.getElementById('songMessage').value.trim();
        const rawUrl = document.getElementById('songUrl').value.trim();

        const formattedUrl = this.formatSpotifyUrl(rawUrl, title, artist);

        const newSong = {
            id: 'music_' + Date.now(),
            title,
            artist,
            message,
            url: formattedUrl,
            date: new Date().toISOString().split('T')[0],
            likes: 1,
            isLiked: true
        };

        Storage.addMusicDedication(newSong);
        this.render();
        document.getElementById('musicModal').classList.add('hidden');

        showLuxuryNotice({
            icon: '🎵',
            title: '¡CANCIÓN DEDICADA!',
            message: `<strong>"${title}"</strong> de ${artist} ha sido dedicada y agregada a nuestra banda sonora. ❤️`
        });
    },

    toggleLike(id) {
        const songs = Storage.getMusicDedications();
        const song = songs.find(s => s.id === id);
        if (!song) return;

        song.isLiked = !song.isLiked;
        song.likes = (song.likes || 0) + (song.isLiked ? 1 : -1);
        if (song.likes < 0) song.likes = 0;

        localStorage.setItem(Storage.KEYS.MUSIC_DEDICATIONS, JSON.stringify(songs));
        Storage.syncToCloud();
        this.render();
    },

    async deleteSong(id) {
        const confirmed = await showLuxuryConfirm({
            icon: '🗑️',
            title: 'ELIMINAR DEDICATORIA',
            message: '¿Deseas retirar esta canción de vuestra banda sonora?',
            confirmText: 'Sí, retirar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            let songs = Storage.getMusicDedications();
            songs = songs.filter(s => s.id !== id);
            localStorage.setItem(Storage.KEYS.MUSIC_DEDICATIONS, JSON.stringify(songs));
            Storage.syncToCloud();
            this.render();
        }
    },

    extractSpotifyTrackId(url) {
        if (!url) return null;
        const match = url.match(/track\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    },

    render() {
        const container = document.getElementById('musicFeedList');
        const statCount = document.getElementById('musicStatCount');
        if (!container) return;

        let songs = Storage.getMusicDedications();

        // Initial default dedication if empty
        if (songs.length === 0) {
            const initialSong = {
                id: 'music_initial',
                title: 'Perfect',
                artist: 'Ed Sheeran',
                message: 'Esta canción suena en mi mente cada vez que pienso en ti. La primera de muchas canciones de nuestra historia. 🎵❤️',
                url: 'https://open.spotify.com/search/Perfect%20Ed%20Sheeran',
                date: new Date().toISOString().split('T')[0],
                likes: 1,
                isLiked: true,
                isInitial: true
            };
            Storage.addMusicDedication(initialSong);
            songs = [initialSong];
        }

        if (statCount) statCount.textContent = songs.length;

        container.innerHTML = songs.map(song => {
            const formattedDate = new Date(song.date + 'T00:00:00').toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Ensure URL is always a valid track or search link
            let playUrl = song.url;
            if (!playUrl || playUrl === 'https://open.spotify.com' || playUrl === 'https://spotify.com' || !playUrl.includes('/')) {
                playUrl = this.formatSpotifyUrl(song.url, song.title, song.artist);
            }

            const nativeUri = this.getNativeSpotifyUri(song.url, song.title, song.artist);

            return `
                <div class="music-card glass-panel">
                    <div class="music-vinyl-box">
                        <div class="vinyl-disc spinning">
                            <div class="vinyl-center"></div>
                        </div>
                        <div class="music-info-meta">
                            <span class="music-tag">BANDA SONORA</span>
                            <h3 class="music-song-title">${song.title}</h3>
                            <span class="music-artist-name">${song.artist}</span>
                        </div>
                        ${!song.isInitial ? `
                            <button class="post-opt-btn" onclick="Music.deleteSong('${song.id}')" style="position:absolute; top:12px; right:12px;" title="Eliminar">🗑️</button>
                        ` : ''}
                    </div>

                    <div class="music-quote-box">
                        <p class="music-quote">"${song.message || 'Una canción dedicada con todo el corazón.'}"</p>
                        <span class="music-date-stamp">Dedicada el ${formattedDate}</span>
                    </div>

                    <div class="music-action-bar">
                        <a href="${nativeUri}" target="_blank" rel="noopener noreferrer" class="btn-primary-luxury btn-sm" style="text-decoration:none;">
                            <span>▶️ Abrir en App de Spotify</span>
                        </a>
                        <button class="post-like-btn ${song.isLiked ? 'liked' : ''}" onclick="Music.toggleLike('${song.id}')">
                            <span class="heart-icon">${song.isLiked ? '❤️' : '🤍'}</span>
                            <span class="like-count">${song.likes || 1}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
};
