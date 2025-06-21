// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    const contactForm = document.getElementById('contact-form');
    const playBtn = document.getElementById('play-btn');
    const volumeSlider = document.getElementById('volume-slider');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initialize components
    initializePlayer();
    initializeSchedule();
    updateCurrentShow(); // Initial call
    initializeListenerCounter();
    connectToAPI();

    // Contact form handling
    contactForm.addEventListener('submit', handleContactForm);

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.team-member, .relay-item, .network-item, .contact-item').forEach(el => {
        observer.observe(el);
    });

    // Update schedule every minute
    setInterval(updateCurrentShow, 60000);
});

//  LECTEUR AUDIO AVEC VRAI FLUX
let audioPlayer = null;
let isPlaying = false;
let currentVolume = 70;

// URLs du flux Radio Zigomar
const STREAM_URLS = [
    'https://stream.zeno.fm/ljjignydycktv',
    'https://stream.zeno.fm/ljjignydycktv.m3u8'
];

function initializePlayer() {
    const playBtn = document.getElementById('play-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    // Crer l'lment audio
    audioPlayer = new Audio();
    audioPlayer.crossOrigin = 'anonymous';
    audioPlayer.preload = 'none';
    
    // Essayer les diffrentes URLs de flux
    audioPlayer.src = STREAM_URLS[0];
    
    // ‰vnements audio
    audioPlayer.addEventListener('loadstart', () => {
        console.log(' Chargement du flux Radio Zigomar...');
    });
    
    audioPlayer.addEventListener('canplay', () => {
        console.log(' Flux prt  tre lu');
        showNotification('“ Radio Zigomar 98.3 FM - Flux connect !', 'success');
    });
    
    audioPlayer.addEventListener('playing', () => {
        console.log(' Lecture en cours');
        isPlaying = true;
        updatePlayerUI();
    });
    
    audioPlayer.addEventListener('pause', () => {
        console.log(' Lecture en pause');
        isPlaying = false;
        updatePlayerUI();
    });
    
    audioPlayer.addEventListener('error', (e) => {
        console.error(' Erreur audio:', e);
        // Essayer l'URL alternative
        if (audioPlayer.src === STREAM_URLS[0]) {
            console.log('”„ Tentative avec URL alternative...');
            audioPlayer.src = STREAM_URLS[1];
            if (isPlaying) {
                audioPlayer.play().catch(console.error);
            }
        } else {
            showNotification(' Problme de connexion au flux. Veuillez ressayer.', 'error');
        }
    });
    
    audioPlayer.addEventListener('stalled', () => {
        console.log(' Flux en attente...');
        showNotification(' Connexion au flux en cours...', 'info');
    });
    
    // Contrles
    playBtn.addEventListener('click', togglePlay);
    volumeSlider.addEventListener('input', adjustVolume);
    
    // Volume initial
    audioPlayer.volume = currentVolume / 100;
    
    // Simulate audio visualizer
    animateVisualizer();
}

function togglePlay() {
    if (!audioPlayer) return;
    
    if (isPlaying) {
        audioPlayer.pause();
        showNotification(' Radio Zigomar - Lecture en pause', 'info');
    } else {
        // Demander la permission pour l'autoplay si ncessaire
        audioPlayer.play().then(() => {
            showNotification(' Radio Zigomar 98.3 FM - En direct !', 'success');
        }).catch(error => {
            console.error('Erreur lecture:', error);
            if (error.name === 'NotAllowedError') {
                showNotification('” Cliquez pour autoriser la lecture audio', 'warning');
            } else {
                showNotification(' Erreur de connexion au flux', 'error');
            }
        });
    }
}

function updatePlayerUI() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    }
}

function adjustVolume(e) {
    currentVolume = e.target.value;
    if (audioPlayer) {
        audioPlayer.volume = currentVolume / 100;
    }
}

function animateVisualizer() {
    const bars = document.querySelectorAll('.bar');
    
    setInterval(() => {
        if (isPlaying) {
            bars.forEach(bar => {
                const height = Math.random() * 30 + 10;
                bar.style.height = height + 'px';
            });
        } else {
            bars.forEach(bar => {
                bar.style.height = '10px';
            });
        }
    }, 200);
}

//  CONNEXION API
let apiConnected = false;

async function connectToAPI() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            apiConnected = true;
            console.log(' API connecte');
            loadCurrentShow();
            loadPlaylist();
            startRealTimeUpdates();
        }
    } catch (error) {
        console.log('“ Mode autonome (pas de serveur Node.js)');
        apiConnected = false;
    }
}

async function loadCurrentShow() {
    if (!apiConnected) return;
    
    try {
        const response = await fetch('/api/current-show');
        const show = await response.json();
        
        document.getElementById('current-show-title').textContent = show.title;
        document.getElementById('current-host').textContent = show.host;
        document.getElementById('current-description').textContent = show.description;
        document.getElementById('listeners-count').textContent = show.listeners;
        
        // Mettre  jour le lecteur
        document.querySelector('.track-title').textContent = show.title;
        document.querySelector('.track-artist').textContent = 'avec ' + show.host;
    } catch (error) {
        console.error('Erreur chargement mission:', error);
    }
}

async function loadPlaylist() {
    if (!apiConnected) return;
    
    try {
        const response = await fetch('/api/playlist');
        const playlist = await response.json();
        
        if (playlist.currentTrack) {
            document.querySelector('.track-title').textContent = playlist.currentTrack.title;
            document.querySelector('.track-artist').textContent = playlist.currentTrack.artist;
        }
    } catch (error) {
        console.error('Erreur chargement playlist:', error);
    }
}

function startRealTimeUpdates() {
    if (!apiConnected) return;
    
    // Mettre  jour les stats toutes les 30 secondes
    setInterval(async () => {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            document.getElementById('listeners-count').textContent = stats.listeners;
            
            if (stats.currentTrack) {
                document.querySelector('.track-title').textContent = stats.currentTrack.title;
                document.querySelector('.track-artist').textContent = stats.currentTrack.artist;
            }
        } catch (error) {
            console.error('Erreur mise  jour stats:', error);
        }
    }, 30000);
}

// Schedule data (conserv pour le mode autonome)
const scheduleData = {
    lundi: [
        { time: '06:00', show: 'Rveil Dali', host: 'Marie Dubois', description: 'Dmarrez la journe en douceur avec du jazz et des infos locales' },
        { time: '09:00', show: 'Caf Zigomar', host: 'Pierre Leroy', description: 'Dcouvertes musicales et histoires de grains' },
        { time: '12:00', show: 'Pause Djeuner', host: 'Sophie Martin', description: 'Musique relaxante pour votre pause' },
        { time: '14:00', show: 'Relais Radio wave 103 FM', host: 'Sophie Martin', description: 'Un voyage musical  travers les genres' },
        { time: '15:00', show: 'L heure du Ra', host: 'Sophie Martin', description: 'Un voyage musical  travers les genres' },
        { time: '16:00', show: ' ', host: 'Caf Milano', description: 'Direct depuis notre partenaire italien' },
        { time: '17:00', show: 'Relais Radio Nostaljinin', host: 'Marie Dubois', description: 'Les grands classiques du jazz' },
        { time: '19:00', show: 'Relais Radio Radio K_Rose', host: 'Mary-Beth Maybell', description: 'country : guitares et voix, intimit garantie' },
        { time: '20:00', show: 'Mix du Soir', host: 'Antoine Moreau', description: 'lectronique et ambiances nocturnes' },
        { time: '21:00', show: 'Nuit Caf', host: 'Programmation automatique', description: 'Musique douce pour la nuit' },
        { time: '23:00', show: 'Nuit Fernando-Italiano', host: 'Programmation automatique', description: 'Musique douce pour la nuit' }
    ],
    mardi: [
        { time: '06:00', show: 'Rveil Caf', host: 'Pierre Leroy', description: 'Dmarrez la journe avec nergie' },
        { time: '09:00', show: 'Dcouvertes', host: 'Sophie Martin', description: 'Nouveauts et talents mergents' },
        { time: '12:00', show: 'Pause Djeuner', host: 'Marie Dubois', description: 'Dtente musicale' },
        { time: '14:00', show: 'Caf World', host: 'Pierre Leroy', description: 'Musiques du monde et Caf' },
        { time: '16:00', show: 'Relais So Paulo', host: 'Caf Brasileiro', description: 'Saveurs brsiliennes en direct' },
        { time: '17:00', show: 'Bossa & Caf', host: 'Sophie Martin', description: 'Douceur brsilienne' },
        { time: '19:00', show: 'Rock Caf', host: 'Antoine Moreau', description: 'Rock et Caf, le mlange parfait' },
        { time: '21:00', show: '‰lectro Lounge', host: 'Antoine Moreau', description: 'lectronique chille' },
        { time: '23:00', show: 'Nuit Caf', host: 'Programmation automatique', description: 'Ambiances nocturnes' }
    ],
    mercredi: [
        { time: '06:00', show: 'Rveil Caf', host: 'Sophie Martin', description: 'Mercredi en musique' },
        { time: '09:00', show: 'Caf Vintage', host: 'Marie Dubois', description: 'Classiques intemporels' },
        { time: '12:00', show: 'Pause Djeuner', host: 'Pierre Leroy', description: 'Musique de midi' },
        { time: '14:00', show: 'Folk & Caf', host: 'Marie Dubois', description: 'Authenticit et simplicit' },
        { time: '16:00', show: 'Relais Brooklyn', host: 'Brooklyn Roasters', description: 'New York en direct' },
        { time: '17:00', show: 'Blues Caf', host: 'Pierre Leroy', description: 'Le blues dans tous ses tats' },
        { time: '19:00', show: 'Indie Session', host: 'Sophie Martin', description: 'Indpendants et cratifs' },
        { time: '21:00', show: 'Deep House', host: 'Antoine Moreau', description: 'House profonde et Caf' },
        { time: '23:00', show: 'Nuit Caf', host: 'Programmation automatique', description: 'Nuit en douceur' }
    ],
    jeudi: [
        { time: '06:00', show: 'Rveil Caf', host: 'Antoine Moreau', description: 'Jeudi lectronique' },
        { time: '09:00', show: 'Reggae Caf', host: 'Pierre Leroy', description: 'Vibrations jamacaines' },
        { time: '12:00', show: 'Pause Djeuner', host: 'Sophie Martin', description: 'Pause musicale' },
        { time: '14:00', show: 'Caf Latino', host: 'Sophie Martin', description: 'Rythmes latins' },
        { time: '16:00', show: 'Relais Tokyo', host: 'Tokyo Coffee House', description: 'Japon en direct' },
        { time: '17:00', show: 'Ambient Caf', host: 'Marie Dubois', description: 'Ambiances et textures' },
        { time: '19:00', show: 'Funk Session', host: 'Antoine Moreau', description: 'Groove et Caf' },
        { time: '21:00', show: 'Techno Caf', host: 'Antoine Moreau', description: 'Techno et espresso' },
        { time: '23:00', show: 'Nuit Caf', host: 'Programmation automatique', description: 'Nuit lectronique' }
    ],
    vendredi: [
        { time: '06:00', show: 'Rveil Caf', host: 'Marie Dubois', description: 'Vendredi jazz' },
        { time: '09:00', show: 'Soul Caf', host: 'Pierre Leroy', description: 'Soul et Caf' },
        { time: '12:00', show: 'Pause Djeuner', host: 'Antoine Moreau', description: 'Pause du vendredi' },
        { time: '14:00', show: 'Hip-Hop Caf', host: 'Antoine Moreau', description: 'Beats et Caf' },
        { time: '16:00', show: 'Relais Melbourne', host: 'Melbourne Beans', description: 'Australie en direct' },
        { time: '17:00', show: 'R&B Session', host: 'Sophie Martin', description: 'Rhythm and Blues' },
        { time: '19:00', show: 'Weekend Warm-up', host: 'Tous les animateurs', description: 'Prparation du weekend' },
        { time: '21:00', show: 'Party Mix', host: 'Antoine Moreau', description: 'Mix festif' },
        { time: '23:00', show: 'Nuit Caf', host: 'Programmation automatique', description: 'Nuit de fte' }
    ],
    samedi: [
        { time: '06:00', show: 'Rveil Dali', host: 'Marie Dubois', description: 'Dmarrez la journe en douceur avec du jazz et des infos locales' },
        { time: '09:00', show: 'Caf Zigomar', host: 'Pierre Leroy', description: 'Dcouvertes musicales et histoires de grains' },
        { time: '12:00', show: 'Pause Djeuner', host: 'Sophie Martin', description: 'Musique relaxante pour votre pause' },
        { time: '14:00', show: 'Relais Radio wave 103 FM', host: 'Sophie Martin', description: 'Un voyage musical  travers les genres' },
        { time: '15:00', show: 'L heure du Ra', host: 'Sophie Martin', description: 'Un voyage musical  travers les genres' },
        { time: '16:00', show: ' ', host: 'Caf Milano', description: 'Direct depuis notre partenaire italien' },
        { time: '17:00', show: 'Relais Radio Nostaljinin', host: 'Marie Dubois', description: 'Les grands classiques du jazz' },
        { time: '19:00', show: 'Relais Radio Radio K_Rose', host: 'Mary-Beth Maybell', description: 'country : guitares et voix, intimit garantie' },
        { time: '20:00', show: 'Mix du Soir', host: 'Antoine Moreau', description: 'lectronique et ambiances nocturnes' },
        { time: '21:00', show: 'Nuit Caf', host: 'Programmation automatique', description: 'Musique douce pour la nuit' },
        { time: '23:00', show: 'Nuit Fernando-Italiano', host: 'Programmation automatique', description: 'Musique douce pour la nuit' }
    ],
    dimanche: [
        { time: '09:00', show: 'Dimanche Caf', host: 'Marie Dubois', description: 'Dimanche en douceur' },
        { time: '11:00', show: 'Gospel & Caf', host: 'Pierre Leroy', description: 'Spiritualit musicale' },
        { time: '13:00', show: 'Caf Classique', host: 'Marie Dubois', description: 'Musique classique' },
        { time: '15:00', show: 'World Music', host: 'Sophie Martin', description: 'Tour du monde musical' },
        { time: '17:00', show: 'Caf Nostalgie', host: 'Pierre Leroy', description: 'Souvenirs musicaux' },
        { time: '19:00', show: 'Sunday Session', host: 'Tous les animateurs', description: 'Session collective' },
        { time: '20:00', show: 'Chill Out', host: 'Antoine Moreau', description: 'Dtente dominicale' },
        { time: '23:00', show: 'Nuit Caf', host: 'Programmation automatique', description: 'Nuit paisible' }
    ]
};

// Initialize schedule
function initializeSchedule() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const day = this.dataset.day;
            showSchedule(day);
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Show Monday schedule by default
    showSchedule('lundi');
}

function showSchedule(day) {
    const scheduleContent = document.getElementById('schedule-content');
    const daySchedule = scheduleData[day];
    
    scheduleContent.innerHTML = '';
    
    daySchedule.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <div class="schedule-time">${item.time}</div>
            <div class="schedule-show">
                <h4>${item.show}</h4>
                <p><strong>avec ${item.host}</strong> - ${item.description}</p>
            </div>
        `;
        scheduleContent.appendChild(scheduleItem);
    });
}

// Current show updates
function updateCurrentShow() {
    if (apiConnected) {
        loadCurrentShow();
        return;
    }

    // Get current day in French
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const currentDayIndex = new Date().getDay();
    const currentDay = days[currentDayIndex];

    // Get shows for the current day
    const dayShows = scheduleData[currentDay];
    if (!dayShows || dayShows.length === 0) {
        updateUIWithDefaultNightShow();
        return;
    }

    // Sort shows by start time
    const sortedShows = [...dayShows].sort((a, b) => parseTime(a.time) - parseTime(b.time));

    // Current time in minutes
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let currentShow = null;
    let currentShowIndex = -1;

    // Find the current show
    for (let i = 0; i < sortedShows.length; i++) {
        const show = sortedShows[i];
        const start = parseTime(show.time);
        let end;
        if (i < sortedShows.length - 1) {
            end = parseTime(sortedShows[i + 1].time);
        } else {
            end = 24 * 60; // midnight
        }

        if (currentMinutes >= start && currentMinutes < end) {
            currentShow = show;
            currentShowIndex = i;
            break;
        }
    }

    if (currentShow) {
        // Update UI with current show
        document.getElementById('current-show-title').textContent = currentShow.title;
        document.getElementById('current-host').textContent = currentShow.host;
        document.getElementById('current-description').textContent = currentShow.description;

        // Format time range
        const startTime = parseTime(currentShow.time);
        let endTime;
        if (currentShowIndex < sortedShows.length - 1) {
            endTime = parseTime(sortedShows[currentShowIndex + 1].time);
        } else {
            endTime = 24 * 60;
        }
        const startStr = formatTime(startTime);
        const endStr = formatTime(endTime);
        document.querySelector('.show-time').textContent = `${startStr} - ${endStr}`;

        // Update player track info
        document.querySelector('.track-title').textContent = currentShow.title;
        document.querySelector('.track-artist').textContent = 'avec ' + currentShow.host;
    } else {
        // No show found, show default
        updateUIWithDefaultNightShow();
    }
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}h${mins.toString().padStart(2, '0')}`;
}

function updateUIWithDefaultNightShow() {
    const defaultShow = {
        title: 'Nuit Caf',
        host: 'Programmation Automatique',
        description: 'Musique douce et ambiances nocturnes pour accompagner vos nuits Caf.'
    };
    document.getElementById('current-show-title').textContent = defaultShow.title;
    document.getElementById('current-host').textContent = defaultShow.host;
    document.getElementById('current-description').textContent = defaultShow.description;
    document.querySelector('.show-time').textContent = '23h00 - 06h00';
    document.querySelector('.track-title').textContent = defaultShow.title;
    document.querySelector('.track-artist').textContent = 'avec ' + defaultShow.host;
}

// Listener counter simulation
function initializeListenerCounter() {
    if (apiConnected) return; // L'API gère déjà cela
    
    const listenerCount = document.getElementById('listeners-count');
    let baseCount = 247;
    
    setInterval(() => {
        // Simulate listener count changes
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
        baseCount = Math.max(200, Math.min(300, baseCount + change));
        listenerCount.textContent = baseCount;
    }, 10000); // Update every 10 seconds
}

// “ GESTION FORMULAIRE CONTACT AM‰LIOR‰E
async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const messageData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Dterminer le type de message
    let type = 'message';
    if (messageData.subject === 'dedicace') {
        type = 'dedicace';
    } else if (messageData.subject === 'programmation') {
        type = 'suggestion';
    }
    
    if (messageData.name && messageData.email && messageData.subject && messageData.message) {
        // Essayer d'envoyer via l'API si disponible
        if (apiConnected) {
            try {
                const response = await fetch('/api/messages/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...messageData,
                        type
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('“ Message envoy avec succs ! L\'quipe vous rpondra rapidement.', 'success');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Erreur envoi message:', error);
                showNotification(' Erreur lors de l\'envoi. Veuillez ressayer.', 'error');
                return;
            }
        } else {
            // Mode autonome - simulation
            showNotification('“ Merci pour votre message ! L\'quipe de Radio Zigomar vous rpondra rapidement.', 'success');
            console.log('“ Message reu (mode autonome):', messageData);
        }
        
        // Reset form
        e.target.reset();
    } else {
        showNotification(' Veuillez remplir tous les champs du formulaire.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#ffd700',
        warning: '#ff9800'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: ${type === 'info' ? '#1a1a1a' : 'white'};
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 350px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    notification.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to buttons
    document.querySelectorAll('button, .cta-button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add loading animation for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';
    });
    
    // Add click effects to interactive elements
    document.querySelectorAll('.team-member, .relay-item, .network-item').forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Space bar to play/pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        togglePlay();
    }
    
    // Arrow keys for volume
    if (e.code === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
        adjustVolume({ target: volumeSlider });
    }
    
    if (e.code === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
        adjustVolume({ target: volumeSlider });
    }
});

// Add social media sharing functionality
function shareOnSocial(platform, text, url) {
    const shareText = encodeURIComponent(text || '‰coutez Radio Zigomar 98.3 FM - La voix du Caf !');
    const shareUrl = encodeURIComponent(url || window.location.href);
    
    let shareLink = '';
    
    switch(platform) {
        case 'facebook':
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
            break;
        case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
            break;
        case 'whatsapp':
            shareLink = `https://wa.me/?text=${shareText} ${shareUrl}`;
            break;
    }
    
    if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Radio Zigomar 98.3 FM - Site web charg avec succs !');
    console.log('“ Flux audio: https://stream.zeno.fm/ljjignydycktv');
    
    // Add some easter eggs
    let clickCount = 0;
    document.querySelector('.radio-icon').addEventListener('click', function() {
        clickCount++;
        if (clickCount === 5) {
            showNotification('‰ Vous avez trouv l\'easter egg ! Merci d\'couter Radio Zigomar !', 'success');
            clickCount = 0;
        }
    });
});
