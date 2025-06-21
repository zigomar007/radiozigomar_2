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
    updateCurrentShow();
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
});

// ًںژµ LECTEUR AUDIO AVEC VRAI FLUX
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
    
    // Crأ©er l'أ©lأ©ment audio
    audioPlayer = new Audio();
    audioPlayer.crossOrigin = 'anonymous';
    audioPlayer.preload = 'none';
    
    // Essayer les diffأ©rentes URLs de flux
    audioPlayer.src = STREAM_URLS[0];
    
    // أ‰vأ©nements audio
    audioPlayer.addEventListener('loadstart', () => {
        console.log('ًںژµ Chargement du flux Radio Zigomar...');
    });
    
    audioPlayer.addEventListener('canplay', () => {
        console.log('ًںژµ Flux prأھt أ  أھtre lu');
        showNotification('ًں“» Radio Zigomar 98.3 FM - Flux connectأ© !', 'success');
    });
    
    audioPlayer.addEventListener('playing', () => {
        console.log('ًںژµ Lecture en cours');
        isPlaying = true;
        updatePlayerUI();
    });
    
    audioPlayer.addEventListener('pause', () => {
        console.log('âڈ¸ï¸ڈ Lecture en pause');
        isPlaying = false;
        updatePlayerUI();
    });
    
    audioPlayer.addEventListener('error', (e) => {
        console.error('â‌Œ Erreur audio:', e);
        // Essayer l'URL alternative
        if (audioPlayer.src === STREAM_URLS[0]) {
            console.log('ًں”„ Tentative avec URL alternative...');
            audioPlayer.src = STREAM_URLS[1];
            if (isPlaying) {
                audioPlayer.play().catch(console.error);
            }
        } else {
            showNotification('âڑ ï¸ڈ Problأ¨me de connexion au flux. Veuillez rأ©essayer.', 'error');
        }
    });
    
    audioPlayer.addEventListener('stalled', () => {
        console.log('âڈ³ Flux en attente...');
        showNotification('âڈ³ Connexion au flux en cours...', 'info');
    });
    
    // Contrأ´les
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
        showNotification('âڈ¸ï¸ڈ Radio Zigomar - Lecture en pause', 'info');
    } else {
        // Demander la permission pour l'autoplay si nأ©cessaire
        audioPlayer.play().then(() => {
            showNotification('ًںژµ Radio Zigomar 98.3 FM - En direct !', 'success');
        }).catch(error => {
            console.error('Erreur lecture:', error);
            if (error.name === 'NotAllowedError') {
                showNotification('ًں”ٹ Cliquez pour autoriser la lecture audio', 'warning');
            } else {
                showNotification('âڑ ï¸ڈ Erreur de connexion au flux', 'error');
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

// ًںŒگ CONNEXION API
let apiConnected = false;

async function connectToAPI() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            apiConnected = true;
            console.log('ًںŒگ API connectأ©e');
            loadCurrentShow();
            loadPlaylist();
            startRealTimeUpdates();
        }
    } catch (error) {
        console.log('ًں“، Mode autonome (pas de serveur Node.js)');
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
        
        // Mettre أ  jour le lecteur
        document.querySelector('.track-title').textContent = show.title;
        document.querySelector('.track-artist').textContent = 'avec ' + show.host;
    } catch (error) {
        console.error('Erreur chargement أ©mission:', error);
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
    
    // Mettre أ  jour les stats toutes les 30 secondes
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
            console.error('Erreur mise أ  jour stats:', error);
        }
    }, 30000);
}

// Schedule data (conservأ© pour le mode autonome)
const scheduleData = {
    lundi: [
        { time: '06:00', show: 'Réveil Dali', host: 'Marie Dubois', description: 'Dأ©marrez la journأ©e en douceur avec du jazz et des infos locales' },
        { time: '09:00', show: 'Café Zigomar', host: 'Pierre Leroy', description: 'Dأ©couvertes musicales et histoires de grains' },
        { time: '12:00', show: 'Pause Déjeuner', host: 'Sophie Martin', description: 'Musique relaxante pour votre pause' },
        { time: '14:00', show: 'Relais Radio wave 103 FM', host: 'Sophie Martin', description: 'Un voyage musical أ  travers les genres' },
		{ time: '15:00', show: 'L heure du Raî', host: 'Sophie Martin', description: 'Un voyage musical أ  travers les genres' },
        { time: '16:00', show: 'نوار عشية', host: 'Café Milano', description: 'Direct depuis notre partenaire italien' },
        { time: '17:00', show: 'Relais Radio K_Rose', host: 'Marie Dubois', description: 'Les grands classiques du jazz' },
        { time: '19:00', show: 'Relais Radio Nostaljinin', host: 'Pierre Leroy', description: 'Guitares et voix, intimitأ© garantie' },
        { time: '21:00', show: 'Mix du Soir', host: 'Antoine Moreau', description: 'Électronique et ambiances nocturnes' },
        { time: '23:00', show: 'Nuit Café', host: 'Programmation automatique', description: 'Musique douce pour la nuit' },
		{ time: '20:00', show: 'Nuit Fernando-Italiano', host: 'Programmation automatique', description: 'Musique douce pour la nuit' }
    ],
    mardi: [
        { time: '06:00', show: 'Réveil Café', host: 'Pierre Leroy', description: 'Dأ©marrez la journأ©e avec أ©nergie' },
        { time: '09:00', show: 'Dأ©couvertes', host: 'Sophie Martin', description: 'Nouveautأ©s et talents أ©mergents' },
        { time: '12:00', show: 'Pause Déjeuner', host: 'Marie Dubois', description: 'Dأ©tente musicale' },
        { time: '14:00', show: 'Café World', host: 'Pierre Leroy', description: 'Musiques du monde et Café' },
        { time: '16:00', show: 'Relais Sأ£o Paulo', host: 'Café Brasileiro', description: 'Saveurs brأ©siliennes en direct' },
        { time: '17:00', show: 'Bossa & Café', host: 'Sophie Martin', description: 'Douceur brأ©silienne' },
        { time: '19:00', show: 'Rock Café', host: 'Antoine Moreau', description: 'Rock et Café, le mأ©lange parfait' },
        { time: '21:00', show: 'أ‰lectro Lounge', host: 'Antoine Moreau', description: 'Électronique chillée' },
        { time: '23:00', show: 'Nuit Café', host: 'Programmation automatique', description: 'Ambiances nocturnes' }
    ],
    mercredi: [
        { time: '06:00', show: 'Réveil Café', host: 'Sophie Martin', description: 'Mercredi en musique' },
        { time: '09:00', show: 'Café Vintage', host: 'Marie Dubois', description: 'Classiques intemporels' },
        { time: '12:00', show: 'Pause Déjeuner', host: 'Pierre Leroy', description: 'Musique de midi' },
        { time: '14:00', show: 'Folk & Café', host: 'Marie Dubois', description: 'Authenticitأ© et simplicitأ©' },
        { time: '16:00', show: 'Relais Brooklyn', host: 'Brooklyn Roasters', description: 'New York en direct' },
        { time: '17:00', show: 'Blues Café', host: 'Pierre Leroy', description: 'Le blues dans tous ses أ©tats' },
        { time: '19:00', show: 'Indie Session', host: 'Sophie Martin', description: 'Indأ©pendants et crأ©atifs' },
        { time: '21:00', show: 'Deep House', host: 'Antoine Moreau', description: 'House profonde et Café' },
        { time: '23:00', show: 'Nuit Café', host: 'Programmation automatique', description: 'Nuit en douceur' }
    ],
    jeudi: [
        { time: '06:00', show: 'Réveil Café', host: 'Antoine Moreau', description: 'Jeudi أ©lectronique' },
        { time: '09:00', show: 'Reggae Café', host: 'Pierre Leroy', description: 'Vibrations jamaأ¯caines' },
        { time: '12:00', show: 'Pause Déjeuner', host: 'Sophie Martin', description: 'Pause musicale' },
        { time: '14:00', show: 'Café Latino', host: 'Sophie Martin', description: 'Rythmes latins' },
        { time: '16:00', show: 'Relais Tokyo', host: 'Tokyo Coffee House', description: 'Japon en direct' },
        { time: '17:00', show: 'Ambient Café', host: 'Marie Dubois', description: 'Ambiances et textures' },
        { time: '19:00', show: 'Funk Session', host: 'Antoine Moreau', description: 'Groove et Café' },
        { time: '21:00', show: 'Techno Café', host: 'Antoine Moreau', description: 'Techno et espresso' },
        { time: '23:00', show: 'Nuit Café', host: 'Programmation automatique', description: 'Nuit أ©lectronique' }
    ],
    vendredi: [
        { time: '06:00', show: 'Réveil Café', host: 'Marie Dubois', description: 'Vendredi jazz' },
        { time: '09:00', show: 'Soul Café', host: 'Pierre Leroy', description: 'Soul et Café' },
        { time: '12:00', show: 'Pause Déjeuner', host: 'Antoine Moreau', description: 'Pause du vendredi' },
        { time: '14:00', show: 'Hip-Hop Café', host: 'Antoine Moreau', description: 'Beats et Café' },
        { time: '16:00', show: 'Relais Melbourne', host: 'Melbourne Beans', description: 'Australie en direct' },
        { time: '17:00', show: 'R&B Session', host: 'Sophie Martin', description: 'Rhythm and Blues' },
        { time: '19:00', show: 'Weekend Warm-up', host: 'Tous les animateurs', description: 'Prأ©paration du weekend' },
        { time: '21:00', show: 'Party Mix', host: 'Antoine Moreau', description: 'Mix festif' },
        { time: '23:00', show: 'Nuit Café', host: 'Programmation automatique', description: 'Nuit de fأھte' }
    ],
    samedi: [
        { time: '08:00', show: 'Weekend Café', host: 'Sophie Martin', description: 'Samedi dأ©tendu' },
        { time: '10:00', show: 'Café Famille', host: 'Marie Dubois', description: 'Musique pour tous' },
        { time: '12:00', show: 'Brunch Musical', host: 'Pierre Leroy', description: 'Accompagnement brunch' },
        { time: '14:00', show: 'Café Dأ©couverte', host: 'Sophie Martin', description: 'Nouveaux talents' },
        { time: '16:00', show: 'Relais Montrأ©al', host: 'Montrأ©al Café', description: 'Canada en direct' },
        { time: '17:00', show: 'Classic Rock', host: 'Pierre Leroy', description: 'Grands classiques rock' },
        { time: '19:00', show: 'Saturday Night', host: 'Antoine Moreau', description: 'Soirأ©e du samedi' },
        { time: '21:00', show: 'Dance Floor', host: 'Antoine Moreau', description: 'Pour danser' },
        { time: '23:00', show: 'Nuit Café', host: 'Programmation automatique', description: 'Nuit dansante' }
    ],
    dimanche: [
        { time: '09:00', show: 'Dimanche Café', host: 'Marie Dubois', description: 'Dimanche en douceur' },
        { time: '11:00', show: 'Gospel & Café', host: 'Pierre Leroy', description: 'Spiritualitأ© musicale' },
        { time: '13:00', show: 'Café Classique', host: 'Marie Dubois', description: 'Musique classique' },
        { time: '15:00', show: 'World Music', host: 'Sophie Martin', description: 'Tour du monde musical' },
        { time: '17:00', show: 'Café Nostalgie', host: 'Pierre Leroy', description: 'Souvenirs musicaux' },
        { time: '19:00', show: 'Sunday Session', host: 'Tous les animateurs', description: 'Session collective' },
        { time: '21:00', show: 'Chill Out', host: 'Antoine Moreau', description: 'Dأ©tente dominicale' },
        { time: '23:00', show: 'Nuit Café', host: 'Programmation automatique', description: 'Nuit paisible' }
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
    const shows = [
        {
            title: 'Réveil Dali',
            host: 'Marie Dubois',
            description: 'Dأ©marrez votre journأ©e avec les plus belles mأ©lodies jazz, accompagnأ©es des meilleurs cafés du monde.',
            time: '06:00 - 09:00'
        },
        {
            title: 'Relais Radio wave 103 FM',
            host: 'Sophie Martin',
            description: 'Un voyage musical أ  travers les genres, accompagnأ© des meilleurs cafés du monde. Dأ©couvertes musicales et histoires de grains.',
            time: '14:00 - 15:00'
        },
		{
            title: 'Relais Radio K_Rose',
            host: 'Sophie Martin',
            description: 'Un voyage musical أ  travers les genres, accompagnأ© des meilleurs cafés du monde. Dأ©couvertes musicales et histoires de grains.',
            time: '17:00 - 18:00'
        },
        {
            title: 'Soirأ©e Acoustique',
            host: 'Pierre Leroy',
            description: 'Guitares et voix dans l\'intimitأ© du studio. Musique acoustique et Café artisanal.',
            time: '19:00 - 21:00'
        },
        {
            title: 'Mix du Soir',
            host: 'Antoine Moreau',
            description: 'Électronique et ambiances nocturnes pour accompagner vos soirأ©es Café.',
            time: '21:00 - 23:00'
        }
    ];
    
    // Simulate current show based on time
    const currentHour = new Date().getHours();
    let currentShow;
    
    if (currentHour >= 6 && currentHour < 9) {
        currentShow = shows[0];
    } else if (currentHour >= 14 && currentHour < 16) {
        currentShow = shows[1];
    } else if (currentHour >= 19 && currentHour < 21) {
        currentShow = shows[2];
    } else if (currentHour >= 21 && currentHour < 23) {
        currentShow = shows[3];
    } else {
        currentShow = {
            title: 'Nuit Café',
            host: 'Programmation Automatique',
            description: 'Musique douce et ambiances nocturnes pour accompagner vos nuits Café.',
            time: '23:00 - 06:00'
        };
    }
    
    // Update current show display (seulement si pas connectأ© أ  l'API)
    if (!apiConnected) {
        document.getElementById('current-show-title').textContent = currentShow.title;
        document.getElementById('current-host').textContent = currentShow.host;
        document.getElementById('current-description').textContent = currentShow.description;
        document.querySelector('.show-time').textContent = currentShow.time;
        
        // Update track info in player
        document.querySelector('.track-title').textContent = currentShow.title;
        document.querySelector('.track-artist').textContent = 'avec ' + currentShow.host;
    }
}

// Listener counter simulation
function initializeListenerCounter() {
    if (apiConnected) return; // L'API gأ¨re dأ©jأ  cela
    
    const listenerCount = document.getElementById('listeners-count');
    let baseCount = 247;
    
    setInterval(() => {
        // Simulate listener count changes
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
        baseCount = Math.max(200, Math.min(300, baseCount + change));
        listenerCount.textContent = baseCount;
    }, 10000); // Update every 10 seconds
}

// ًں“§ GESTION FORMULAIRE CONTACT AMأ‰LIORأ‰E
async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const messageData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Dأ©terminer le type de message
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
                    showNotification('ًں“، Message envoyأ© avec succأ¨s ! L\'أ©quipe vous rأ©pondra rapidement.', 'success');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Erreur envoi message:', error);
                showNotification('âڑ ï¸ڈ Erreur lors de l\'envoi. Veuillez rأ©essayer.', 'error');
                return;
            }
        } else {
            // Mode autonome - simulation
            showNotification('ًں“، Merci pour votre message ! L\'أ©quipe de Radio Zigomar vous rأ©pondra rapidement.', 'success');
            console.log('ًں“§ Message reأ§u (mode autonome):', messageData);
        }
        
        // Reset form
        e.target.reset();
    } else {
        showNotification('âڑ ï¸ڈ Veuillez remplir tous les champs du formulaire.', 'error');
    }
}

// Show notification (fonction conservأ©e)
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

// Utility function for smooth scrolling to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
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
    
    // Update current show every hour
    setInterval(updateCurrentShow, 3600000); // 1 hour
    
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
    const shareText = encodeURIComponent(text || 'أ‰coutez Radio Zigomar 98.3 FM - La voix du Café !');
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
    console.log('ًںژµ Radio Zigomar 98.3 FM - Site web chargأ© avec succأ¨s !');
    console.log('ًں“» Flux audio: https://stream.zeno.fm/ljjignydycktv');
    
    // Add some easter eggs
    let clickCount = 0;
    document.querySelector('.radio-icon').addEventListener('click', function() {
        clickCount++;
        if (clickCount === 5) {
            showNotification('ًںژ‰ Vous avez trouvأ© l\'easter egg ! Merci d\'أ©couter Radio Zigomar !', 'success');
            clickCount = 0;
        }
    });
});
