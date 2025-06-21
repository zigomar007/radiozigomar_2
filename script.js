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

// Audio Player functionality
let isPlaying = false;
let currentVolume = 70;

function initializePlayer() {
    const playBtn = document.getElementById('play-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    playBtn.addEventListener('click', togglePlay);
    volumeSlider.addEventListener('input', adjustVolume);
    
    // Simulate audio visualizer
    animateVisualizer();
}

function togglePlay() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
        showNotification('ًںژµ Lecture en cours - Radio Zigomar 89.3 FM', 'success');
    } else {
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
        showNotification('âڈ¸ï¸ڈ Lecture en pause', 'info');
    }
}

function adjustVolume(e) {
    currentVolume = e.target.value;
    // In a real implementation, this would control actual audio volume
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

// Schedule data
const scheduleData = {
    lundi: [
        { time: '06:00', show: 'Rأ©veil Dali', host: 'Marie Dubois', description: 'Dأ©marrez la journأ©e en douceur avec du jazz et des infos locales' },
        { time: '09:00', show: 'Cafأ© Zigomar', host: 'Pierre Leroy', description: 'Dأ©couvertes musicales et histoires de grains' },
        { time: '12:00', show: 'Pause Dأ©jeuner', host: 'Sophie Martin', description: 'Musique relaxante pour votre pause' },
        { time: '14:00', show: 'Relais Radio wave 103 FM', host: 'Sophie Martin', description: 'Un voyage musical أ  travers les genres' },
		{ time: '15:00', show: 'L'heure du Raî', host: 'Sophie Martin', description: 'Un voyage musical أ  travers les genres' },
        { time: '16:00', show: 'نوار عشية', host: 'Cafأ© Milano', description: 'Direct depuis notre partenaire italien' },
        { time: '17:00', show: 'Relais Radio K_Rose', host: 'Marie Dubois', description: 'Les grands classiques du jazz' },
        { time: '19:00', show: 'Relais Radio Nostaljinin', host: 'Pierre Leroy', description: 'Guitares et voix, intimitأ© garantie' },
        { time: '21:00', show: 'Mix du Soir', host: 'Antoine Moreau', description: 'أ‰lectronique et ambiances nocturnes' },
        { time: '23:00', show: 'Nuit Cafأ©', host: 'Programmation automatique', description: 'Musique douce pour la nuit' },
		{ time: '20:00', show: 'Nuit Fernando-Italiano', host: 'Programmation automatique', description: 'Musique douce pour la nuit' }
    ],
    mardi: [
        { time: '06:00', show: 'Rأ©veil Cafأ©', host: 'Pierre Leroy', description: 'Dأ©marrez la journأ©e avec أ©nergie' },
        { time: '09:00', show: 'Dأ©couvertes', host: 'Sophie Martin', description: 'Nouveautأ©s et talents أ©mergents' },
        { time: '12:00', show: 'Pause Dأ©jeuner', host: 'Marie Dubois', description: 'Dأ©tente musicale' },
        { time: '14:00', show: 'Cafأ© World', host: 'Pierre Leroy', description: 'Musiques du monde et cafأ©' },
        { time: '16:00', show: 'Relais Sأ£o Paulo', host: 'Cafأ© Brasileiro', description: 'Saveurs brأ©siliennes en direct' },
        { time: '17:00', show: 'Bossa & Cafأ©', host: 'Sophie Martin', description: 'Douceur brأ©silienne' },
        { time: '19:00', show: 'Rock Cafأ©', host: 'Antoine Moreau', description: 'Rock et cafأ©, le mأ©lange parfait' },
        { time: '21:00', show: 'أ‰lectro Lounge', host: 'Antoine Moreau', description: 'أ‰lectronique chillأ©e' },
        { time: '23:00', show: 'Nuit Cafأ©', host: 'Programmation automatique', description: 'Ambiances nocturnes' }
    ],
    mercredi: [
        { time: '06:00', show: 'Rأ©veil Cafأ©', host: 'Sophie Martin', description: 'Mercredi en musique' },
        { time: '09:00', show: 'Cafأ© Vintage', host: 'Marie Dubois', description: 'Classiques intemporels' },
        { time: '12:00', show: 'Pause Dأ©jeuner', host: 'Pierre Leroy', description: 'Musique de midi' },
        { time: '14:00', show: 'Folk & Cafأ©', host: 'Marie Dubois', description: 'Authenticitأ© et simplicitأ©' },
        { time: '16:00', show: 'Relais Brooklyn', host: 'Brooklyn Roasters', description: 'New York en direct' },
        { time: '17:00', show: 'Blues Cafأ©', host: 'Pierre Leroy', description: 'Le blues dans tous ses أ©tats' },
        { time: '19:00', show: 'Indie Session', host: 'Sophie Martin', description: 'Indأ©pendants et crأ©atifs' },
        { time: '21:00', show: 'Deep House', host: 'Antoine Moreau', description: 'House profonde et cafأ©' },
        { time: '23:00', show: 'Nuit Cafأ©', host: 'Programmation automatique', description: 'Nuit en douceur' }
    ],
    jeudi: [
        { time: '06:00', show: 'Rأ©veil Cafأ©', host: 'Antoine Moreau', description: 'Jeudi أ©lectronique' },
        { time: '09:00', show: 'Reggae Cafأ©', host: 'Pierre Leroy', description: 'Vibrations jamaأ¯caines' },
        { time: '12:00', show: 'Pause Dأ©jeuner', host: 'Sophie Martin', description: 'Pause musicale' },
        { time: '14:00', show: 'Cafأ© Latino', host: 'Sophie Martin', description: 'Rythmes latins' },
        { time: '16:00', show: 'Relais Tokyo', host: 'Tokyo Coffee House', description: 'Japon en direct' },
        { time: '17:00', show: 'Ambient Cafأ©', host: 'Marie Dubois', description: 'Ambiances et textures' },
        { time: '19:00', show: 'Funk Session', host: 'Antoine Moreau', description: 'Groove et cafأ©' },
        { time: '21:00', show: 'Techno Cafأ©', host: 'Antoine Moreau', description: 'Techno et espresso' },
        { time: '23:00', show: 'Nuit Cafأ©', host: 'Programmation automatique', description: 'Nuit أ©lectronique' }
    ],
    vendredi: [
        { time: '06:00', show: 'Rأ©veil Cafأ©', host: 'Marie Dubois', description: 'Vendredi jazz' },
        { time: '09:00', show: 'Soul Cafأ©', host: 'Pierre Leroy', description: 'Soul et cafأ©' },
        { time: '12:00', show: 'Pause Dأ©jeuner', host: 'Antoine Moreau', description: 'Pause du vendredi' },
        { time: '14:00', show: 'Hip-Hop Cafأ©', host: 'Antoine Moreau', description: 'Beats et cafأ©' },
        { time: '16:00', show: 'Relais Melbourne', host: 'Melbourne Beans', description: 'Australie en direct' },
        { time: '17:00', show: 'R&B Session', host: 'Sophie Martin', description: 'Rhythm and Blues' },
        { time: '19:00', show: 'Weekend Warm-up', host: 'Tous les animateurs', description: 'Prأ©paration du weekend' },
        { time: '21:00', show: 'Party Mix', host: 'Antoine Moreau', description: 'Mix festif' },
        { time: '23:00', show: 'Nuit Cafأ©', host: 'Programmation automatique', description: 'Nuit de fأھte' }
    ],
    samedi: [
        { time: '08:00', show: 'Weekend Cafأ©', host: 'Sophie Martin', description: 'Samedi dأ©tendu' },
        { time: '10:00', show: 'Cafأ© Famille', host: 'Marie Dubois', description: 'Musique pour tous' },
        { time: '12:00', show: 'Brunch Musical', host: 'Pierre Leroy', description: 'Accompagnement brunch' },
        { time: '14:00', show: 'Cafأ© Dأ©couverte', host: 'Sophie Martin', description: 'Nouveaux talents' },
        { time: '16:00', show: 'Relais Montrأ©al', host: 'Montrأ©al Cafأ©', description: 'Canada en direct' },
        { time: '17:00', show: 'Classic Rock', host: 'Pierre Leroy', description: 'Grands classiques rock' },
        { time: '19:00', show: 'Saturday Night', host: 'Antoine Moreau', description: 'Soirأ©e du samedi' },
        { time: '21:00', show: 'Dance Floor', host: 'Antoine Moreau', description: 'Pour danser' },
        { time: '23:00', show: 'Nuit Cafأ©', host: 'Programmation automatique', description: 'Nuit dansante' }
    ],
    dimanche: [
        { time: '09:00', show: 'Dimanche Cafأ©', host: 'Marie Dubois', description: 'Dimanche en douceur' },
        { time: '11:00', show: 'Gospel & Cafأ©', host: 'Pierre Leroy', description: 'Spiritualitأ© musicale' },
        { time: '13:00', show: 'Cafأ© Classique', host: 'Marie Dubois', description: 'Musique classique' },
        { time: '15:00', show: 'World Music', host: 'Sophie Martin', description: 'Tour du monde musical' },
        { time: '17:00', show: 'Cafأ© Nostalgie', host: 'Pierre Leroy', description: 'Souvenirs musicaux' },
        { time: '19:00', show: 'Sunday Session', host: 'Tous les animateurs', description: 'Session collective' },
        { time: '21:00', show: 'Chill Out', host: 'Antoine Moreau', description: 'Dأ©tente dominicale' },
        { time: '23:00', show: 'Nuit Cafأ©', host: 'Programmation automatique', description: 'Nuit paisible' }
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
            title: 'Rأ©veil Dali',
            host: 'Marie Dubois',
            description: 'Dأ©marrez votre journأ©e avec les plus belles mأ©lodies jazz, accompagnأ©es des meilleurs cafأ©s du monde.',
            time: '06:00 - 09:00'
        },
        {
            title: 'Relais Radio wave 103 FM',
            host: 'Sophie Martin',
            description: 'Un voyage musical أ  travers les genres, accompagnأ© des meilleurs cafأ©s du monde. Dأ©couvertes musicales et histoires de grains.',
            time: '14:00 - 15:00'
        },
		{
            title: 'Relais Radio K_Rose',
            host: 'Sophie Martin',
            description: 'Un voyage musical أ  travers les genres, accompagnأ© des meilleurs cafأ©s du monde. Dأ©couvertes musicales et histoires de grains.',
            time: '17:00 - 18:00'
        },
        {
            title: 'Soirأ©e Acoustique',
            host: 'Pierre Leroy',
            description: 'Guitares et voix dans l\'intimitأ© du studio. Musique acoustique et cafأ© artisanal.',
            time: '19:00 - 21:00'
        },
        {
            title: 'Mix du Soir',
            host: 'Antoine Moreau',
            description: 'أ‰lectronique et ambiances nocturnes pour accompagner vos soirأ©es cafأ©.',
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
            title: 'Nuit Cafأ©',
            host: 'Programmation Automatique',
            description: 'Musique douce et ambiances nocturnes pour accompagner vos nuits cafأ©.',
            time: '23:00 - 06:00'
        };
    }
    
    // Update current show display
    document.getElementById('current-show-title').textContent = currentShow.title;
    document.getElementById('current-host').textContent = currentShow.host;
    document.getElementById('current-description').textContent = currentShow.description;
    document.querySelector('.show-time').textContent = currentShow.time;
    
    // Update track info in player
    document.querySelector('.track-title').textContent = currentShow.title;
    document.querySelector('.track-artist').textContent = 'avec ' + currentShow.host;
}

// Listener counter simulation
function initializeListenerCounter() {
    const listenerCount = document.getElementById('listeners-count');
    let baseCount = 247;
    
    setInterval(() => {
        // Simulate listener count changes
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
        baseCount = Math.max(200, Math.min(300, baseCount + change));
        listenerCount.textContent = baseCount;
    }, 10000); // Update every 10 seconds
}

// Contact form handling
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    if (name && email && subject && message) {
        // Show success message
        showNotification('ًں“، Merci pour votre message ! L\'أ©quipe de Radio Zigomar vous rأ©pondra rapidement.', 'success');
        
        // Reset form
        e.target.reset();
        
        // In a real application, you would send this data to a server
        console.log('Radio contact form submitted:', { name, email, subject, message });
    } else {
        showNotification('âڑ ï¸ڈ Veuillez remplir tous les champs du formulaire.', 'error');
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
    const shareText = encodeURIComponent(text || 'أ‰coutez Radio Zigomar 89.3 FM - La voix du cafأ© !');
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
    console.log('ًںژµ Radio Zigomar 89.3 FM - Site web chargأ© avec succأ¨s !');
    
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
