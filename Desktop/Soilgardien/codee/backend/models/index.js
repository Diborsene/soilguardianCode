const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialiser Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    logging: false // Mettre à true pour voir les requêtes SQL
  }
);

// Importer les modèles
const User = require('./user')(sequelize);

// Exporter les modèles et sequelize
module.exports = {
  sequelize,
  Sequelize,
  User
};
