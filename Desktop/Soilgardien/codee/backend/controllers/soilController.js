const { Sequelize } = require('sequelize');
const db = require('../models');
const soilAnalysisService = require('../services/soilAnalysisService');

/**
 * Trouver les échantillons de sol les plus proches
 */
exports.findNearestSoil = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, limit = 5 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude et longitude sont requis'
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordonnées invalides'
      });
    }

    console.log(`🔍 Recherche de sols proches de: ${latitude}, ${longitude} (rayon: ${radius}km)`);

    const [results] = await db.sequelize.query(`
      SELECT *,
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(:lon)) + 
          sin(radians(:lat)) * sin(radians(latitude))
        )) AS distance
      FROM donnees_sols
      HAVING distance < :radius
      ORDER BY distance ASC
      LIMIT :limit
    `, {
      replacements: { 
        lat: latitude, 
        lon: longitude, 
        radius: radius,
        limit: limit 
      }
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucune donnée de sol trouvée dans un rayon de ${radius} km`,
        suggestion: 'Essayez d\'augmenter le rayon de recherche'
      });
    }

    console.log(`✅ ${results.length} échantillon(s) trouvé(s)`);

    res.status(200).json({
      success: true,
      data: {
        position_recherchee: {
          latitude,
          longitude
        },
        rayon_km: radius,
        nombre_resultats: results.length,
        echantillons: results.map(sample => ({
          id: sample.id,
          latitude: parseFloat(sample.latitude),
          longitude: parseFloat(sample.longitude),
          distance_km: parseFloat(sample.distance).toFixed(2),
          source: sample.source,
          date_analyse: sample.date_analyse
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de sols',
      error: error.message
    });
  }
};

/**
 * Analyser le sol pour une position donnée
 */
exports.analyzeSoilAtLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude et longitude sont requis'
      });
    }

    console.log(`🌱 Analyse de sol pour: ${latitude}, ${longitude}`);

    const [results] = await db.sequelize.query(`
      SELECT *,
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(:lon)) + 
          sin(radians(:lat)) * sin(radians(latitude))
        )) AS distance
      FROM donnees_sols
      HAVING distance < :radius
      ORDER BY distance ASC
      LIMIT 1
    `, {
      replacements: { 
        lat: latitude, 
        lon: longitude, 
        radius: radius 
      }
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucune donnée de sol trouvée dans un rayon de ${radius} km`
      });
    }

    const nearestSoil = results[0];
    const distance = parseFloat(nearestSoil.distance);

    console.log(`📍 Sol trouvé à ${distance.toFixed(2)} km`);
    console.log('🔍 Données brutes:', {
      ph: nearestSoil.ph,
      ce: nearestSoil.ce,
      phosphore: nearestSoil.phosphore,
      potassium: nearestSoil.potassium,
      matiere_organique: nearestSoil.matiere_organique,
      sable: nearestSoil.sable,
      limon: nearestSoil.limon,
      argile: nearestSoil.argile
    });

    // ✅ ADAPTER les données pour le service d'analyse
    const adaptedData = {
      ph: nearestSoil.ph,
      ec_s: nearestSoil.ce ? nearestSoil.ce * 1000 : null,  // Conversion dS/m en µS/cm
      p_ppm: nearestSoil.phosphore,
      k_ppm: nearestSoil.potassium,
      ca_ppm: nearestSoil.calcium,
      mg_ppm: nearestSoil.magnesium,
      ob_percent: nearestSoil.matiere_organique,
      n_percent: nearestSoil.azote_total,
      sand_percent: nearestSoil.sable,
      silt_percent: nearestSoil.limon,
      clay_percent: nearestSoil.argile
    };

    console.log('🔄 Données adaptées pour analyse:', adaptedData);

    // Effectuer l'analyse complète
    const analysis = soilAnalysisService.performCompleteAnalysis(adaptedData);
    const priorites = this.generatePriorities(analysis);

    res.status(200).json({
      success: true,
      data: {
        localisation: {
          position_demandee: { latitude, longitude },
          echantillon_utilise: {
            id: nearestSoil.id,
            latitude: parseFloat(nearestSoil.latitude),
            longitude: parseFloat(nearestSoil.longitude),
            distance_km: distance.toFixed(2),
            source: nearestSoil.source,
            date_analyse: nearestSoil.date_analyse,
            score_qualite: nearestSoil.score_qualite
          },
          precision: this.getPrecisionLevel(distance)
        },
        donnees_brutes: {
          ph: nearestSoil.ph,
          conductivite_electrique_dS_m: nearestSoil.ce,
          salinite_niveau: this.getSalinityLevel(nearestSoil.ce),
          phosphore_ppm: nearestSoil.phosphore,
          potassium_ppm: nearestSoil.potassium,
          calcium_ppm: nearestSoil.calcium,
          magnesium_ppm: nearestSoil.magnesium,
          matiere_organique_percent: nearestSoil.matiere_organique,
          carbone_organique_percent: nearestSoil.carbone_organique,
          azote_total: nearestSoil.azote_total,
          texture: {
            designation: nearestSoil.texture,
            sable_percent: nearestSoil.sable,
            limon_percent: nearestSoil.limon,
            argile_percent: nearestSoil.argile
          },
          micronutriments: {
            fer_ppm: nearestSoil.fer,
            manganese_ppm: nearestSoil.manganese,
            zinc_ppm: nearestSoil.zinc,
            cuivre_ppm: nearestSoil.cuivre,
            bore_ppm: nearestSoil.bore,
            soufre_ppm: nearestSoil.soufre
          },
          proprietes_physiques: {
            cec_cmol_kg: nearestSoil.cec,
            capacite_portante_kPa: nearestSoil.capacite_portante,
            indice_plasticite: nearestSoil.indice_plasticite,
            limite_liquidite: nearestSoil.limite_liquidite
          }
        },
        analyse: analysis,
        recommandations_prioritaires: priorites,
        usage_construction: nearestSoil.capacite_portante ? this.evaluateConstructionUse(nearestSoil) : null,
        date_analyse: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse du sol',
      error: error.message
    });
  }
};

/**
 * Obtenir un rapport détaillé
 */
exports.getDetailedReport = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, culture_souhaitee, usage = 'agriculture' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude et longitude sont requis'
      });
    }

    const [results] = await db.sequelize.query(`
      SELECT *,
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(:lon)) + 
          sin(radians(:lat)) * sin(radians(latitude))
        )) AS distance
      FROM donnees_sols
      HAVING distance < :radius
      ORDER BY distance ASC
      LIMIT 1
    `, {
      replacements: { lat: latitude, lon: longitude, radius }
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune donnée trouvée'
      });
    }

    const soilData = results[0];
    
    // Adapter pour analyse
    const adaptedData = {
      ph: soilData.ph,
      ec_s: soilData.ce ? soilData.ce * 1000 : null,
      p_ppm: soilData.phosphore,
      k_ppm: soilData.potassium,
      ob_percent: soilData.matiere_organique,
      sand_percent: soilData.sable,
      silt_percent: soilData.limon,
      clay_percent: soilData.argile
    };
    
    const analysis = soilAnalysisService.performCompleteAnalysis(adaptedData);

    // Rapport complet
    const rapport = {
      titre: usage === 'construction' ? 'RAPPORT GÉOTECHNIQUE' : 'RAPPORT D\'ANALYSE DE SOL AGRICOLE',
      sous_titre: 'Soil Guardian - Diagnostic Intelligent des Sols',
      date: new Date().toLocaleDateString('fr-FR'),
      
      section_1_localisation: {
        titre: '1. LOCALISATION DE LA PARCELLE',
        coordonnees_gps: {
          latitude: latitude,
          longitude: longitude
        },
        echantillon_reference: {
          id: soilData.id,
          latitude: parseFloat(soilData.latitude),
          longitude: parseFloat(soilData.longitude),
          distance_km: parseFloat(soilData.distance).toFixed(2),
          source: soilData.source || 'INP Sénégal',
          date_analyse: soilData.date_analyse,
          score_qualite: soilData.score_qualite ? `${soilData.score_qualite}/10` : 'N/A'
        }
      },
      
      section_2_resultats: {
        titre: '2. RÉSULTATS D\'ANALYSE PHYSICOCHIMIQUE',
        proprietes_chimiques: {
          pH: {
            valeur: soilData.ph,
            interpretation: analysis.ph?.niveau,
            statut: analysis.ph?.optimal ? '✅ Optimal' : '⚠️ À corriger'
          },
          conductivite_electrique: {
            valeur: soilData.ce,
            unite: 'dS/m',
            interpretation: analysis.salinite?.niveau,
            statut: analysis.salinite?.optimal ? '✅ Non salin' : '⚠️ Présence de sel'
          },
          matiere_organique: {
            valeur: soilData.matiere_organique,
            carbone_organique: soilData.carbone_organique,
            unite: '%',
            interpretation: analysis.matiere_organique?.niveau,
            statut: analysis.matiere_organique?.optimal ? '✅ Bon' : '⚠️ À améliorer'
          },
          nutriments_majeurs: {
            azote: { valeur: soilData.azote_total, unite: 'kg/ha' },
            phosphore: { 
              valeur: soilData.phosphore, 
              unite: 'ppm',
              niveau: analysis.phosphore?.niveau,
              statut: analysis.phosphore?.optimal ? '✅' : '⚠️'
            },
            potassium: { 
              valeur: soilData.potassium, 
              unite: 'ppm',
              niveau: analysis.potassium?.niveau,
              statut: analysis.potassium?.optimal ? '✅' : '⚠️'
            }
          },
          nutriments_secondaires: {
            calcium: { valeur: soilData.calcium, unite: 'ppm' },
            magnesium: { valeur: soilData.magnesium, unite: 'ppm' },
            soufre: { valeur: soilData.soufre, unite: 'ppm' }
          },
          oligo_elements: {
            fer: { valeur: soilData.fer, unite: 'ppm' },
            manganese: { valeur: soilData.manganese, unite: 'ppm' },
            zinc: { valeur: soilData.zinc, unite: 'ppm' },
            cuivre: { valeur: soilData.cuivre, unite: 'ppm' },
            bore: { valeur: soilData.bore, unite: 'ppm' }
          }
        },
        proprietes_physiques: {
          texture: {
            designation: soilData.texture || analysis.texture?.texture,
            sable: soilData.sable,
            limon: soilData.limon,
            argile: soilData.argile,
            interpretation: analysis.texture?.interpretation
          },
          capacite_echange_cationique: {
            valeur: soilData.cec,
            unite: 'cmol/kg',
            interpretation: this.interpretCEC(soilData.cec)
          }
        }
      },
      
      section_3_agriculture: usage === 'agriculture' ? {
        titre: '3. ÉVALUATION POUR L\'AGRICULTURE',
        score_fertilite: {
          score: analysis.score_fertilite?.score,
          niveau: analysis.score_fertilite?.niveau,
          jauge: '█'.repeat(Math.floor(analysis.score_fertilite?.score / 10)) + '░'.repeat(10 - Math.floor(analysis.score_fertilite?.score / 10))
        },
        cultures_recommandees: analysis.cultures_suggerees || [],
        culture_demandee: culture_souhaitee ? {
          nom: culture_souhaitee,
          evaluation: this.evaluateCropFeasibility(culture_souhaitee, adaptedData)
        } : null
      } : null,
      
      section_3_construction: usage === 'construction' ? {
        titre: '3. ÉVALUATION POUR LA CONSTRUCTION',
        capacite_portante: {
          valeur: soilData.capacite_portante,
          unite: 'kPa',
          interpretation: this.interpretBearingCapacity(soilData.capacite_portante)
        },
        proprietes_geotechniques: {
          indice_plasticite: {
            valeur: soilData.indice_plasticite,
            interpretation: this.interpretPlasticity(soilData.indice_plasticite)
          },
          limite_liquidite: {
            valeur: soilData.limite_liquidite,
            interpretation: this.interpretLiquidLimit(soilData.limite_liquidite)
          }
        },
        risques: this.evaluateConstructionRisks(soilData),
        recommandations_construction: this.getConstructionRecommendations(soilData)
      } : null,
      
      section_4_recommandations: {
        titre: '4. PLAN D\'ACTION RECOMMANDÉ',
        priorites: this.generatePriorities(analysis)
      },
      
      footer: {
        source_donnees: soilData.source || 'Institut National de Pédologie (INP) - Sénégal',
        note: 'Ce rapport est basé sur l\'échantillon le plus proche de votre position.',
        contact: 'Soil Guardian - Diagnostic Intelligent des Sols',
        date_generation: new Date().toISOString()
      }
    };

    res.status(200).json({
      success: true,
      data: rapport
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport',
      error: error.message
    });
  }
};

// Fonctions helper (suite dans le prochain message...)
exports.generatePriorities = (analysis) => {
  const priorities = [];
  
  if (analysis.ph && !analysis.ph.optimal) {
    priorities.push({
      ordre: 1,
      categorie: 'URGENT',
      action: 'Correction du pH',
      raison: analysis.ph.interpretation,
      details: analysis.ph.recommandations[0]
    });
  }
  
  if (analysis.salinite && !analysis.salinite.optimal) {
    priorities.push({
      ordre: 2,
      categorie: 'URGENT',
      action: 'Gestion de la salinité',
      raison: analysis.salinite.interpretation,
      details: analysis.salinite.recommandations[0]
    });
  }
  
  if (analysis.matiere_organique && !analysis.matiere_organique.optimal) {
    priorities.push({
      ordre: 3,
      categorie: 'IMPORTANT',
      action: 'Apport de matière organique',
      raison: analysis.matiere_organique.interpretation,
      details: analysis.matiere_organique.recommandations[0]
    });
  }
  
  if (analysis.phosphore && !analysis.phosphore.optimal) {
    priorities.push({
      ordre: 4,
      categorie: 'IMPORTANT',
      action: 'Fertilisation phosphatée',
      raison: analysis.phosphore.interpretation,
      details: analysis.phosphore.recommandations[0]
    });
  }
  
  if (analysis.potassium && !analysis.potassium.optimal) {
    priorities.push({
      ordre: 5,
      categorie: 'IMPORTANT',
      action: 'Fertilisation potassique',
      raison: analysis.potassium.interpretation,
      details: analysis.potassium.recommandations[0]
    });
  }
  
  return priorities.slice(0, 5);
};

exports.getPrecisionLevel = (distance) => {
  if (distance < 1) return 'Très élevée';
  if (distance < 5) return 'Élevée';
  if (distance < 10) return 'Moyenne';
  if (distance < 20) return 'Faible';
  return 'Très faible';
};

exports.getSalinityLevel = (ce) => {
  if (!ce) return 'Non mesuré';
  if (ce < 2) return 'Non salin';
  if (ce < 4) return 'Légèrement salin';
  if (ce < 8) return 'Modérément salin';
  if (ce < 16) return 'Très salin';
  return 'Extrêmement salin';
};

exports.evaluateCropFeasibility = (crop, soilData) => {
  const cropRequirements = {
    'tomate': { ph_min: 6.0, ph_max: 7.0, ec_max: 2.5, om_min: 2 },
    'oignon': { ph_min: 6.0, ph_max: 7.5, ec_max: 1.8, om_min: 2 },
    'maïs': { ph_min: 5.8, ph_max: 7.5, ec_max: 1.7, om_min: 1.5 },
    'arachide': { ph_min: 5.5, ph_max: 6.5, ec_max: 1.5, om_min: 1 },
    'riz': { ph_min: 5.0, ph_max: 7.0, ec_max: 3.0, om_min: 2 },
    'mil': { ph_min: 6.0, ph_max: 8.0, ec_max: 4.0, om_min: 0.5 },
    'sorgho': { ph_min: 6.0, ph_max: 8.5, ec_max: 4.0, om_min: 0.5 }
  };
  
  const req = cropRequirements[crop.toLowerCase()];
  if (!req) {
    return { faisabilite: 'Indéterminée', raison: 'Culture non référencée' };
  }
  
  const ph = soilData.ph || 7;
  const ec = (soilData.ec_s || 0) / 1000;
  const om = soilData.ob_percent || 0;
  
  const issues = [];
  
  if (ph < req.ph_min || ph > req.ph_max) {
    issues.push(`pH non adapté (optimal: ${req.ph_min}-${req.ph_max})`);
  }
  if (ec > req.ec_max) {
    issues.push(`Salinité trop élevée (max: ${req.ec_max} dS/m)`);
  }
  if (om < req.om_min) {
    issues.push(`Matière organique insuffisante (min: ${req.om_min}%)`);
  }
  
  if (issues.length === 0) {
    return { faisabilite: '✅ Excellente', raison: 'Sol bien adapté' };
  } else if (issues.length === 1) {
    return { faisabilite: '⚠️ Possible avec corrections', raison: issues[0] };
  } else {
    return { faisabilite: '❌ Difficile', raison: issues.join(', ') };
  }
};

exports.evaluateConstructionUse = (soilData) => {
  if (!soilData.capacite_portante) return null;
  
  let evaluation = '';
  let risques = [];
  let recommandations = [];
  
  if (soilData.capacite_portante < 50) {
    evaluation = 'Non adapté';
    risques = ['Tassement excessif', 'Affaissement'];
    recommandations = ['Fondations profondes obligatoires'];
  } else if (soilData.capacite_portante < 100) {
    evaluation = 'Faiblement adapté';
    risques = ['Tassement possible'];
    recommandations = ['Fondations renforcées'];
  } else if (soilData.capacite_portante < 200) {
    evaluation = 'Moyennement adapté';
    risques = ['Précautions standards'];
    recommandations = ['Fondations classiques'];
  } else {
    evaluation = 'Bien adapté';
    risques = ['Aucun risque majeur'];
    recommandations = ['Construction standard possible'];
  }
  
  return { evaluation, risques, recommandations };
};

exports.interpretCEC = (cec) => {
  if (!cec) return 'Non mesuré';
  if (cec < 5) return 'Très faible';
  if (cec < 15) return 'Faible à moyenne';
  if (cec < 25) return 'Moyenne à bonne';
  return 'Élevée';
};

exports.interpretBearingCapacity = (cp) => {
  if (!cp) return 'Non mesuré';
  if (cp < 50) return 'Très faible';
  if (cp < 100) return 'Faible';
  if (cp < 200) return 'Moyenne';
  if (cp < 300) return 'Bonne';
  return 'Excellente';
};

exports.interpretPlasticity = (ip) => {
  if (!ip) return 'Non mesuré';
  if (ip < 10) return 'Faible plasticité';
  if (ip < 20) return 'Plasticité moyenne';
  return 'Forte plasticité';
};

exports.interpretLiquidLimit = (ll) => {
  if (!ll) return 'Non mesuré';
  if (ll < 30) return 'Faible';
  if (ll < 50) return 'Moyenne';
  return 'Élevée';
};

exports.evaluateConstructionRisks = (soilData) => {
  const risks = [];
  
  if (soilData.argile > 40) {
    risks.push({
      type: 'Retrait-gonflement',
      niveau: 'Élevé',
      description: 'Sol argileux sensible aux variations'
    });
  }
  
  if (soilData.ce > 4) {
    risks.push({
      type: 'Corrosion',
      niveau: 'Moyen',
      description: 'Salinité pouvant corroder les fondations'
    });
  }
  
  if (risks.length === 0) {
    risks.push({
      type: 'Aucun',
      niveau: 'Faible',
      description: 'Pas de risque majeur'
    });
  }
  
  return risks;
};

exports.getConstructionRecommendations = (soilData) => {
  const reco = [];
  
  if (soilData.capacite_portante < 100) {
    reco.push('Fondations profondes recommandées');
  } else {
    reco.push('Fondations superficielles possibles');
  }
  
  if (soilData.argile > 30) {
    reco.push('Joints de dilatation');
    reco.push('Système de drainage');
  }
  
  if (soilData.ce > 2) {
    reco.push('Béton avec adjuvants anti-corrosion');
  }
  
  reco.push('Étude géotechnique recommandée');
  
  return reco;
};

module.exports = exports;