const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DonneesSols = sequelize.define('DonneesSols', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    localisation: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    altitude: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Altitude en mètres'
    },
    ph: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'pH du sol (0-14)'
    },
    ce: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Conductivité électrique en dS/m (salinité)'
    },
    matiere_organique: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Pourcentage de matière organique'
    },
    carbone_organique: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Pourcentage de carbone organique'
    },
    azote_total: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Azote total en kg/ha ou ppm'
    },
    phosphore: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Phosphore assimilable (Bray P1) en ppm'
    },
    potassium: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Potassium échangeable en ppm'
    },
    calcium: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Calcium en ppm'
    },
    magnesium: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Magnésium en ppm'
    },
    soufre: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Soufre en ppm'
    },
    fer: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Fer en ppm'
    },
    manganese: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Manganèse en ppm'
    },
    zinc: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Zinc en ppm'
    },
    cuivre: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Cuivre en ppm'
    },
    bore: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Bore en ppm'
    },
    texture: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Sableuse, Limoneuse, Argileuse, etc.'
    },
    sable: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Pourcentage de sable'
    },
    limon: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Pourcentage de limon'
    },
    argile: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Pourcentage d\'argile'
    },
    cec: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'CEC en cmol/kg'
    },
    capacite_portante: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Capacité portante en kPa'
    },
    indice_plasticite: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Indice de plasticité'
    },
    limite_liquidite: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Limite de liquidité'
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'RSFMP, Dundël Suuf, PNAT, Analyse Lab, etc.'
    },
    url_source: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    score_qualite: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: 'Score de fiabilité 1-10'
    },
    date_analyse: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    profondeur_echantillon: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Profondeur en cm'
    },
    metadonnees: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Données additionnelles en JSON'
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
    }
  }, {
    tableName: 'donnees_sols',
    timestamps: false, // On utilise cree_le et modifie_le manuellement
    indexes: [
      {
        name: 'idx_latitude_longitude',
        fields: ['latitude', 'longitude']
      },
      {
        type: 'SPATIAL',
        name: 'idx_localisation',
        fields: ['localisation']
      }
    ]
  });

  return DonneesSols;
};