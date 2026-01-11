const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    mot_de_passe_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nom_complet: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type_utilisateur: {
      type: DataTypes.ENUM('agriculteur', 'promoteur', 'collectivite'),
      allowNull: true,
      defaultValue: 'agriculteur'
    },
    role: {
      type: DataTypes.ENUM('utilisateur', 'expert', 'admin', 'super_admin'),
      allowNull: true,
      defaultValue: 'utilisateur'
    },
    url_avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null
    },
    organisation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      comment: "Nom de l'entreprise/coopérative"
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    pays: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Sénégal'
    },
    langue: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'fr',
      comment: 'fr, wo, en, pul'
    },
    notifications_activees: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1
    },
    type_abonnement: {
      type: DataTypes.ENUM('gratuit', 'basique', 'premium', 'entreprise'),
      allowNull: true,
      defaultValue: 'gratuit'
    },
    date_debut_abonnement: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null
    },
    date_fin_abonnement: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null
    },
    est_actif: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1
    },
    est_verifie: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    },
    email_verifie_le: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    token_verification: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    token_reinitialisation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    token_reinitialisation_expire_le: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    cree_le: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    modifie_le: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    derniere_connexion_le: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'utilisateurs',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le',
    hooks: {
      // Hash le mot de passe avant la création
      beforeCreate: async (user) => {
        if (user.mot_de_passe_hash) {
          const salt = await bcrypt.genSalt(10);
          user.mot_de_passe_hash = await bcrypt.hash(user.mot_de_passe_hash, salt);
        }
      },
      // Hash le mot de passe avant la mise à jour si modifié
      beforeUpdate: async (user) => {
        if (user.changed('mot_de_passe_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.mot_de_passe_hash = await bcrypt.hash(user.mot_de_passe_hash, salt);
        }
      }
    }
  });

  // Méthode pour comparer les mots de passe
  User.prototype.comparePassword = async function(motDePasse) {
    return await bcrypt.compare(motDePasse, this.mot_de_passe_hash);
  };

  // Méthode pour cacher le mot de passe dans les réponses JSON
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.mot_de_passe_hash;
    delete values.token_verification;
    delete values.token_reinitialisation;
    delete values.token_reinitialisation_expire_le;
    return values;
  };

  return User;
};