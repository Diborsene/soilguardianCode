const express = require('express');
const app = express();
require('dotenv').config();
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS pour permettre les requêtes depuis React Native
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const soilRoutes = require('./routes/soil');  
const reportRoutes = require('./routes/reports');


// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API SoilGardien - Serveur actif',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      soil: '/api/soil'
    }
  });
});

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/soil', soilRoutes);  
app.use('/api/reports', reportRoutes);

// Synchroniser la base de données et démarrer le serveur
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données établie avec succès.');
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('✅ Base de données synchronisée');
    
    // Démarrage du serveur
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
      console.log(`✅ Accessible depuis le réseau sur http:// 192.168.1.8:${PORT}`);
      console.log(`\n📋 Routes disponibles:`);
      console.log(`   - POST /api/auth/connexion`);
      console.log(`   - POST /api/auth/inscription`);
      console.log(`   - POST /api/soil/find-nearest`);
      console.log(`   - POST /api/soil/analyze`);
      console.log(`   - POST /api/soil/report`);
    });
  })
  .catch(err => {
    console.error('❌ Impossible de se connecter à la base de données:', err);
  });