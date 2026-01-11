require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+00:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'cree_le',
      updatedAt: 'modifie_le'
    }
  }
};