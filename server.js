import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import cron from 'node-cron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Servir les fichiers statiques du site web
app.use(express.static('.'));

// Configuration des chemins de données
const DATA_DIR = path.join(__dirname, 'data');
const PLAYLIST_FILE = path.join(DATA_DIR, 'playlist.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const CURRENT_SHOW_FILE = path.join(DATA_DIR, 'current-show.json');

// Créer le dossier data s'il n'existe pas
await fs.ensureDir(DATA_DIR);

// Initialiser les fichiers de données
const initializeDataFiles = async () => {
    // Playlist par défaut
    const defaultPlaylist = {
        currentTrack: {
            title: "Jazz Matinal",
            artist: "Marie Dubois",
            album: "Radio Zigomar Sessions",
            duration: "03:45",
            startTime: new Date().toISOString()
        },
        queue: [
            {
                title: "Café Blues",
                artist: "Pierre Leroy",
                album: "Acoustic Sessions",
                duration: "04:12"
            },
            {
                title: "Morning Brew",
                artist: "Sophie Martin",
                album: "Coffee House Classics",
                duration: "03:28"
            },
            {
                title: "Espresso Dreams",
                artist: "Antoine Moreau",
                album: "Electronic Café",
                duration: "05:15"
            }
        ],
        history: []
    };

    // Émission actuelle par défaut
    const defaultCurrentShow = {
        title: "Jazz Matinal",
        host: "Marie Dubois",
        description: "Démarrez votre journée avec les plus belles mélodies jazz",
        startTime: "06:00",
        endTime: "09:00",
        listeners: 247,
        genre: "Jazz",
        mood: "Relaxant"
    };

    // Messages par défaut
    const defaultMessages = {
        messages: [],
        dedicaces: [],
        suggestions: []
    };

    // Créer les fichiers s'ils n'existent pas
    if (!await fs.pathExists(PLAYLIST_FILE)) {
        await fs.writeJson(PLAYLIST_FILE, defaultPlaylist, { spaces: 2 });
    }
    
    if (!await fs.pathExists(CURRENT_SHOW_FILE)) {
        await fs.writeJson(CURRENT_SHOW_FILE, defaultCurrentShow, { spaces: 2 });
    }
    
    if (!await fs.pathExists(MESSAGES_FILE)) {
        await fs.writeJson(MESSAGES_FILE, defaultMessages, { spaces: 2 });
    }
};

await initializeDataFiles();

// Routes API

// 🎵 GESTION DE LA PLAYLIST
app.get('/api/playlist', async (req, res) => {
    try {
        const playlist = await fs.readJson(PLAYLIST_FILE);
        res.json(playlist);
    } catch (error) {
        console.error('Erreur lecture playlist:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/playlist/add', async (req, res) => {
    try {
        const { title, artist, album, duration } = req.body;
        
        if (!title || !artist) {
            return res.status(400).json({ error: 'Titre et artiste requis' });
        }

        const playlist = await fs.readJson(PLAYLIST_FILE);
        const newTrack = {
            id: Date.now(),
            title,
            artist,
            album: album || 'Single',
            duration: duration || '03:00',
            addedAt: new Date().toISOString()
        };

        playlist.queue.push(newTrack);
        await fs.writeJson(PLAYLIST_FILE, playlist, { spaces: 2 });

        res.json({ success: true, track: newTrack });
    } catch (error) {
        console.error('Erreur ajout piste:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/playlist/next', async (req, res) => {
    try {
        const playlist = await fs.readJson(PLAYLIST_FILE);
        
        if (playlist.queue.length === 0) {
            return res.status(400).json({ error: 'Aucune piste en attente' });
        }

        // Déplacer la piste actuelle vers l'historique
        if (playlist.currentTrack) {
            playlist.history.unshift({
                ...playlist.currentTrack,
                playedAt: new Date().toISOString()
            });
            
            // Garder seulement les 50 dernières pistes
            playlist.history = playlist.history.slice(0, 50);
        }

        // Prendre la prochaine piste
        const nextTrack = playlist.queue.shift();
        playlist.currentTrack = {
            ...nextTrack,
            startTime: new Date().toISOString()
        };

        await fs.writeJson(PLAYLIST_FILE, playlist, { spaces: 2 });
        res.json({ success: true, currentTrack: playlist.currentTrack });
    } catch (error) {
        console.error('Erreur piste suivante:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 🎙️ GESTION DE L'ÉMISSION ACTUELLE
app.get('/api/current-show', async (req, res) => {
    try {
        const currentShow = await fs.readJson(CURRENT_SHOW_FILE);
        res.json(currentShow);
    } catch (error) {
        console.error('Erreur lecture émission:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/current-show/update', async (req, res) => {
    try {
        const showData = req.body;
        await fs.writeJson(CURRENT_SHOW_FILE, showData, { spaces: 2 });
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur mise à jour émission:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 📧 GESTION DES MESSAGES
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await fs.readJson(MESSAGES_FILE);
        res.json(messages);
    } catch (error) {
        console.error('Erreur lecture messages:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/messages/add', async (req, res) => {
    try {
        const { name, email, subject, message, type = 'message' } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Nom, email et message requis' });
        }

        const messages = await fs.readJson(MESSAGES_FILE);
        const newMessage = {
            id: Date.now(),
            name,
            email,
            subject: subject || 'Message général',
            message,
            type, // 'message', 'dedicace', 'suggestion'
            timestamp: new Date().toISOString(),
            read: false,
            replied: false
        };

        // Ajouter dans la catégorie appropriée
        if (type === 'dedicace') {
            messages.dedicaces.unshift(newMessage);
        } else if (type === 'suggestion') {
            messages.suggestions.unshift(newMessage);
        } else {
            messages.messages.unshift(newMessage);
        }

        await fs.writeJson(MESSAGES_FILE, messages, { spaces: 2 });
        
        console.log(`📧 Nouveau ${type} reçu de ${name}: ${message.substring(0, 50)}...`);
        res.json({ success: true, message: 'Message reçu avec succès!' });
    } catch (error) {
        console.error('Erreur ajout message:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/messages/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await fs.readJson(MESSAGES_FILE);
        
        // Chercher dans toutes les catégories
        const categories = ['messages', 'dedicaces', 'suggestions'];
        let found = false;
        
        for (const category of categories) {
            const messageIndex = messages[category].findIndex(m => m.id === parseInt(id));
            if (messageIndex !== -1) {
                messages[category][messageIndex].read = true;
                found = true;
                break;
            }
        }
        
        if (!found) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }
        
        await fs.writeJson(MESSAGES_FILE, messages, { spaces: 2 });
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur marquage lu:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 📊 STATISTIQUES
app.get('/api/stats', async (req, res) => {
    try {
        const messages = await fs.readJson(MESSAGES_FILE);
        const playlist = await fs.readJson(PLAYLIST_FILE);
        const currentShow = await fs.readJson(CURRENT_SHOW_FILE);
        
        const stats = {
            listeners: currentShow.listeners || 247,
            totalMessages: messages.messages.length + messages.dedicaces.length + messages.suggestions.length,
            unreadMessages: [
                ...messages.messages,
                ...messages.dedicaces,
                ...messages.suggestions
            ].filter(m => !m.read).length,
            playlistLength: playlist.queue.length,
            currentTrack: playlist.currentTrack,
            uptime: process.uptime()
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 🎯 DÉDICACES EN DIRECT
app.get('/api/dedicaces/live', async (req, res) => {
    try {
        const messages = await fs.readJson(MESSAGES_FILE);
        const liveDedicaces = messages.dedicaces
            .filter(d => !d.played)
            .slice(0, 5); // 5 prochaines dédicaces
        
        res.json(liveDedicaces);
    } catch (error) {
        console.error('Erreur dédicaces live:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/dedicaces/:id/played', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await fs.readJson(MESSAGES_FILE);
        
        const dedicaceIndex = messages.dedicaces.findIndex(d => d.id === parseInt(id));
        if (dedicaceIndex === -1) {
            return res.status(404).json({ error: 'Dédicace non trouvée' });
        }
        
        messages.dedicaces[dedicaceIndex].played = true;
        messages.dedicaces[dedicaceIndex].playedAt = new Date().toISOString();
        
        await fs.writeJson(MESSAGES_FILE, messages, { spaces: 2 });
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur dédicace jouée:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 🕒 TÂCHES AUTOMATIQUES
// Mise à jour automatique du nombre d'auditeurs
cron.schedule('*/30 * * * * *', async () => {
    try {
        const currentShow = await fs.readJson(CURRENT_SHOW_FILE);
        const variation = Math.floor(Math.random() * 10) - 5; // -5 à +5
        currentShow.listeners = Math.max(200, Math.min(350, currentShow.listeners + variation));
        await fs.writeJson(CURRENT_SHOW_FILE, currentShow, { spaces: 2 });
    } catch (error) {
        console.error('Erreur mise à jour auditeurs:', error);
    }
});

// Nettoyage automatique des anciens messages (tous les jours à minuit)
cron.schedule('0 0 * * *', async () => {
    try {
        const messages = await fs.readJson(MESSAGES_FILE);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Garder seulement les messages du dernier mois
        messages.messages = messages.messages.filter(m => new Date(m.timestamp) > oneMonthAgo);
        messages.dedicaces = messages.dedicaces.filter(d => new Date(d.timestamp) > oneMonthAgo);
        messages.suggestions = messages.suggestions.filter(s => new Date(s.timestamp) > oneMonthAgo);
        
        await fs.writeJson(MESSAGES_FILE, messages, { spaces: 2 });
        console.log('🧹 Nettoyage automatique des anciens messages effectué');
    } catch (error) {
        console.error('Erreur nettoyage:', error);
    }
});

// Route pour servir le site web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`
🎙️ ========================================
   📻 RADIO ZIGOMAR 89.3 FM - SERVEUR ACTIF
🎙️ ========================================

🌐 Site web: http://localhost:${PORT}
📡 API: http://localhost:${PORT}/api
📊 Stats: http://localhost:${PORT}/api/stats

🎵 Fonctionnalités actives:
   • Gestion playlist automatique
   • Réception messages auditeurs
   • Système de dédicaces
   • Statistiques en temps réel
   • Nettoyage automatique

📻 La voix du café est en ligne !
    `);
});

export default app;