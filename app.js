// RapidAPI Configuration
const API_CONFIG = {
  host: 'radio-world-75-000-worldwide-fm-radio-stations.p.rapidapi.com',
  key: 'd2d344209emsh82d5daaafdb504ap196b97jsn3f6a5ed06b43'
};

// Fallback tracks
const fallbackTracks = [
  { title: 'Midnight City', artist: 'M83', genre: 'Electronic', duration: '4:03', cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=85', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'A Walk', artist: 'Tycho', genre: 'Electronic', duration: '5:21', cover: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=85', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'Weightless', artist: 'Marconi Union', genre: 'Jazz', duration: '4:48', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=85', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { title: 'Sunset Lover', artist: 'Petit Biscuit', genre: 'Chill', duration: '3:58', cover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=400&q=85', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { title: 'The Less I Know', artist: 'Tame Impala', genre: 'Rock', duration: '3:36', cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=400&q=85', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' }
];

let tracks = [...fallbackTracks];
let currentIndex = 0;
let isShuffled = false;
let repeatMode = false;

// DOM Elements
const audio = document.querySelector('#audio');
const playBtn = document.querySelector('#playBtn');
const playIcon = document.querySelector('#playIcon');
const bgBlur = document.getElementById('bgBlur');
const stationList = document.querySelector('#stationList');

// Initialize
async function init() {
  console.log('Initializing Sonora player...');
  await loadGlobalStations();
  loadTrack(0);
  setupEventListeners();
}

// Fetch global radio stations
async function loadGlobalStations() {
  try {
    console.log('Fetching global radio stations...');
    const response = await fetch('https://radio-world-75-000-worldwide-fm-radio-stations.p.rapidapi.com/get_quotes.php?limit=20&page=1', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': API_CONFIG.host,
        'x-rapidapi-key': API_CONFIG.key
      }
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    console.log('Radio data received:', data);
    
    if (data && Array.isArray(data)) {
      const apiTracks = data.slice(0, 12).map((station, i) => ({
        title: station.station_name || `Global Station ${i + 1}`,
        artist: station.country || 'Worldwide',
        genre: ['Pop', 'Rock', 'Jazz', 'Electronic', 'Classical', 'Hip-Hop'][i % 6],
        duration: '3:00',
        cover: [
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=85',
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=85',
          'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?auto=format&fit=crop&w=400&q=85',
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=85',
        ][i % 4],
        src: fallbackTracks[i % fallbackTracks.length].src
      }));
      
      tracks = [...apiTracks, ...fallbackTracks];
      displayStations();
    }
  } catch (error) {
    console.warn('Radio API error, using fallback:', error);
    displayStations();
  }
}

function displayStations() {
  stationList.innerHTML = '';
  
  tracks.slice(0, 10).forEach((track, idx) => {
    const item = document.createElement('div');
    item.className = 'station-item' + (idx === currentIndex ? ' active' : '');
    item.textContent = `${track.title} • ${track.artist}`;
    item.onclick = () => {
      currentIndex = idx;
      loadTrack(currentIndex, true);
    };
    stationList.appendChild(item);
  });
}

function loadTrack(index = 0, autoplay = false) {
  currentIndex = index % tracks.length;
  const track = tracks[currentIndex];
  
  if (!track) return;
  
  // Update audio
  audio.src = track.src;
  
  // Update display
  document.querySelector('#cover').src = track.cover;
  document.querySelector('#title').textContent = track.title;
  document.querySelector('#artist').textContent = track.artist;
  document.querySelector('#queueTitle').textContent = track.title;
  document.querySelector('#queueDesc').textContent = `${track.artist} • ${track.genre}`;
  document.querySelector('#queueImg').src = track.cover;
  
  // Update background blur
  bgBlur.style.backgroundImage = `url('${track.cover}')`;
  
  // Update active station
  displayStations();
  
  if (autoplay) {
    audio.play().catch(e => console.log('Autoplay blocked:', e));
  }
  
  updatePlayButton();
}

function updatePlayButton() {
  playIcon.textContent = audio.paused ? '▶' : '⏸';
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function nextTrack() {
  if (isShuffled) {
    currentIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentIndex = (currentIndex + 1) % tracks.length;
  }
  loadTrack(currentIndex, true);
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex, true);
}

function setupEventListeners() {
  // Play/Pause
  playBtn.onclick = () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };
  
  // Audio events
  audio.onplay = updatePlayButton;
  audio.onpause = updatePlayButton;
  
  audio.onended = () => {
    if (repeatMode) {
      audio.currentTime = 0;
      audio.play();
    } else {
      nextTrack();
    }
  };
  
  audio.ontimeupdate = () => {
    if (audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      document.querySelector('#progressFill').style.width = percent + '%';
      document.querySelector('#currentTime').textContent = formatTime(audio.currentTime);
      document.querySelector('#duration').textContent = formatTime(audio.duration);
    }
  };
  
  // Wheel controls
  document.querySelector('#nextBtn').onclick = nextTrack;
  document.querySelector('#prevBtn').onclick = prevTrack;
  
  document.querySelector('#shuffleBtn').onclick = () => {
    isShuffled = !isShuffled;
    const btn = document.querySelector('#shuffleBtn');
    btn.style.color = isShuffled ? '#0f0' : '#888';
  };
  
  document.querySelector('#repeatBtn').onclick = () => {
    repeatMode = !repeatMode;
    const btn = document.querySelector('#repeatBtn');
    btn.style.color = repeatMode ? '#0f0' : '#888';
  };
  
  // Progress bar click to seek
  document.querySelector('.progress-bar').onclick = (e) => {
    if (audio.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audio.currentTime = percent * audio.duration;
    }
  };
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      playBtn.click();
    }
    if (e.code === 'ArrowRight') nextTrack();
    if (e.code === 'ArrowLeft') prevTrack();
  });
}

// Start!
init();
