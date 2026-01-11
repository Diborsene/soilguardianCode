/**
 * Service d'analyse des sols basé sur les grilles d'interprétation
 * des propriétés physiques, chimiques et biologiques
 */

class SoilAnalysisService {
  
  /**
   * Analyse le pH du sol
   */
  analyzePH(ph) {
    if (!ph) return null;
    
    let interpretation = '';
    let niveau = '';
    let recommandations = [];
    
    if (ph < 5.5) {
      niveau = 'Très acide';
      interpretation = 'Sol fortement acide, risque de toxicité aluminique et carence en nutriments';
      recommandations = [
        'Apport de chaux calcique ou dolomitique',
        'Dose : 2-4 tonnes/ha selon texture du sol',
        'Fractionner l\'apport sur plusieurs campagnes'
      ];
    } else if (ph >= 5.5 && ph < 6.5) {
      niveau = 'Acide';
      interpretation = 'Sol acide, favorable aux cultures acidophiles';
      recommandations = [
        'Chaulage modéré si culture exigeante',
        'Dose : 1-2 tonnes/ha',
        'Privilégier les cultures tolérantes (arachide, riz, ananas)'
      ];
    } else if (ph >= 6.5 && ph <= 7.5) {
      niveau = 'Neutre (Optimal)';
      interpretation = 'pH optimal pour la plupart des cultures';
      recommandations = [
        'Maintenir le pH par apports organiques',
        'Pas de chaulage nécessaire'
      ];
    } else if (ph > 7.5 && ph <= 8.5) {
      niveau = 'Alcalin';
      interpretation = 'Sol alcalin, risque de blocage du phosphore et micronutriments';
      recommandations = [
        'Apport de matière organique',
        'Utilisation d\'engrais acidifiants (sulfate d\'ammonium)',
        'Privilégier cultures tolérantes (mil, sorgho)'
      ];
    } else {
      niveau = 'Très alcalin';
      interpretation = 'Sol fortement alcalin, carences multiples probables';
      recommandations = [
        'Apport massif de matière organique',
        'Soufre élémentaire : 200-500 kg/ha',
        'Chélates de fer pour corriger chlorose'
      ];
    }
    
    return {
      valeur: ph,
      niveau,
      interpretation,
      recommandations,
      optimal: ph >= 6.5 && ph <= 7.5
    };
  }

  /**
   * Analyse la conductivité électrique (salinité)
   */
  analyzeEC(ec) {
    if (!ec) return null;
    
    // Conversion uS/cm en dS/m (1 dS/m = 1000 uS/cm)
    const ec_dsm = ec ;
    
    let niveau = '';
    let interpretation = '';
    let recommandations = [];
    
    if (ec_dsm < 2) {
      niveau = 'Non salin';
      interpretation = 'Pas de contrainte saline';
      recommandations = ['Sol adapté à toutes cultures'];
    } else if (ec_dsm >= 2 && ec_dsm < 4) {
      niveau = 'Légèrement salin';
      interpretation = 'Salinité faible, cultures sensibles peuvent être affectées';
      recommandations = [
        'Irrigation de lessivage (10-15% en plus des besoins)',
        'Éviter cultures très sensibles (haricot, fraisier)',
        'Privilégier orge, tomate, luzerne'
      ];
    } else if (ec_dsm >= 4 && ec_dsm < 8) {
      niveau = 'Modérément salin';
      interpretation = 'Salinité moyenne, rendements affectés pour cultures sensibles';
      recommandations = [
        'Drainage obligatoire',
        'Lessivage : 20-30% eau supplémentaire',
        'Cultures tolérantes : orge, coton, betterave',
        'Apport de gypse : 2-5 t/ha'
      ];
    } else if (ec_dsm >= 8 && ec_dsm < 16) {
      niveau = 'Très salin';
      interpretation = 'Forte salinité, seules cultures très tolérantes possibles';
      recommandations = [
        'Système de drainage performant indispensable',
        'Lessivage intensif',
        'Cultures limitées : ray-grass, palmier dattier',
        'Gypse + matière organique'
      ];
    } else {
      niveau = 'Extrêmement salin';
      interpretation = 'Sol impropre à l\'agriculture conventionnelle';
      recommandations = [
        'Réhabilitation nécessaire',
        'Lessivage massif sur plusieurs années',
        'Envisager cultures halophytes (salicorne, quinoa)'
      ];
    }
    
    return {
      valeur: ec_s,
      valeur_dsm: ec_dsm.toFixed(2),
      niveau,
      interpretation,
      recommandations,
      optimal: ec_dsm < 2
    };
  }

  /**
   * Analyse du phosphore (P)
   */
  analyzePhosphorus(phosphore) {
    if (!phosphore) return null;
    
    let niveau = '';
    let interpretation = '';
    let recommandations = [];
    
    if (phosphore < 10) {
      niveau = 'Très faible';
      interpretation = 'Carence sévère en phosphore';
      recommandations = [
        'Apport de phosphate : 100-150 kg P2O5/ha',
        'Phosphate naturel en sol acide',
        'Super phosphate en sol neutre/alcalin',
        'Fractionnement recommandé'
      ];
    } else if (phosphore >= 10 && phosphore < 20) {
      niveau = 'Faible';
      interpretation = 'Teneur insuffisante pour cultures exigeantes';
      recommandations = [
        'Apport de phosphate : 60-100 kg P2O5/ha',
        'Localisation à la ligne de semis',
        'Phosphate DAP ou TSP'
      ];
    } else if (phosphore >= 20 && phosphore < 40) {
      niveau = 'Moyen';
      interpretation = 'Teneur acceptable pour la plupart des cultures';
      recommandations = [
        'Apport d\'entretien : 40-60 kg P2O5/ha',
        'Adapter selon culture et exportations'
      ];
    } else if (phosphore >= 40 && phosphore < 60) {
      niveau = 'Bon';
      interpretation = 'Teneur satisfaisante';
      recommandations = [
        'Apport d\'entretien léger : 20-40 kg P2O5/ha',
        'Compenser exportations uniquement'
      ];
    } else {
      niveau = 'Élevé';
      interpretation = 'Teneur excellente, pas d\'apport nécessaire';
      recommandations = [
        'Pas d\'apport de phosphore',
        'Risque de pollution si sur-fertilisation'
      ];
    }
    
    return {
      valeur: phosphore,
      unite: 'ppm',
      niveau,
      interpretation,
      recommandations,
      optimal: phosphore >= 20 && phosphore < 60
    };
  }

  /**
   * Analyse du potassium (K)
   */
  analyzePotassium(potassium) {
    if (!potassium) return null;
    
    let niveau = '';
    let interpretation = '';
    let recommandations = [];
    
    if (potassium< 80) {
      niveau = 'Très faible';
      interpretation = 'Carence sévère en potassium';
      recommandations = [
        'Apport de potasse : 120-180 kg K2O/ha',
        'Chlorure ou sulfate de potassium',
        'Fractionnement en 2-3 fois'
      ];
    } else if (potassium >= 80 && potassium < 150) {
      niveau = 'Faible';
      interpretation = 'Teneur insuffisante';
      recommandations = [
        'Apport de potasse : 80-120 kg K2O/ha',
        'Privilégier sulfate de potasse pour cultures sensibles au chlore'
      ];
    } else if (potassium >= 150 && potassium < 250) {
      niveau = 'Moyen';
      interpretation = 'Teneur acceptable';
      recommandations = [
        'Apport d\'entretien : 60-80 kg K2O/ha',
        'Adapter selon exportations de la culture'
      ];
    } else if (potassium >= 250 && potassium < 400) {
      niveau = 'Bon';
      interpretation = 'Teneur satisfaisante';
      recommandations = [
        'Apport d\'entretien léger : 40-60 kg K2O/ha'
      ];
    } else {
      niveau = 'Élevé';
      interpretation = 'Teneur excellente';
      recommandations = [
        'Apport minimal ou nul',
        'Compenser exportations uniquement'
      ];
    }
    
    return {
      valeur: potassium,
      unite: 'ppm',
      niveau,
      interpretation,
      recommandations,
      optimal: potassium >= 150 && potassium < 400
    };
  }

  /**
   * Analyse de la texture du sol
   */
  analyzeTexture(sable, limon, argile) {
    if (!sable || !limon || !argile) return null;
    
    let texture = '';
    let interpretation = '';
    let recommandations = [];
    
    // Classification selon triangle de texture USDA
    if (argile >= 40) {
      texture = 'Argileux';
      interpretation = 'Sol lourd, forte rétention d\'eau, compaction facile';
      recommandations = [
        'Apport régulier de matière organique (> 20 t/ha)',
        'Éviter travail du sol en conditions humides',
        'Drainage si nécessaire',
        'Cultures adaptées : riz, maraîchage'
      ];
    } else if (argile >= 27 && argile < 40) {
      texture = 'Argilo-limoneux';
      interpretation = 'Sol moyen à lourd, bonne fertilité potentielle';
      recommandations = [
        'Apport de matière organique : 15-20 t/ha',
        'Structure à maintenir par rotations',
        'Bon pour cultures exigeantes'
      ];
    } else if (sable >= 70) {
      texture = 'Sableux';
      interpretation = 'Sol léger, faible rétention eau et nutriments';
      recommandations = [
        'Apport massif de matière organique (> 30 t/ha)',
        'Irrigation fréquente et fractionnée',
        'Fertilisation fractionnée obligatoire',
        'Cultures adaptées : arachide, pastèque, tubercules'
      ];
    } else if (sable >= 50 && sable < 70 && argile < 20) {
      texture = 'Sablo-limoneux';
      interpretation = 'Sol léger à moyen, facile à travailler';
      recommandations = [
        'Apport de matière organique : 20-25 t/ha',
        'Irrigation régulière',
        'Adapté à la plupart des cultures'
      ];
    } else if (limon >= 40 && argile < 27) {
      texture = 'Limoneux';
      interpretation = 'Sol fertile mais sensible érosion et battance';
      recommandations = [
        'Couverture végétale obligatoire',
        'Éviter sol nu',
        'Travail minimal du sol',
        'Très bon pour céréales et maraîchage'
      ];
    } else {
      texture = 'Équilibré (Loam)';
      interpretation = 'Texture optimale, bon équilibre entre propriétés';
      recommandations = [
        'Maintenir structure par apports organiques (10-15 t/ha)',
        'Adapté à toutes cultures',
        'Potentiel de rendement élevé'
      ];
    }
    
    return {
      sable: sable,
      limon: limon,
      argile: argile,
      texture,
      interpretation,
      recommandations,
      optimal: texture === 'Équilibré (Loam)' || texture === 'Limoneux'
    };
  }

  /**
   * Analyse de la matière organique
   */
  analyzeOrganicMatter(matiere_organique) {
    if (!matiere_organique) return null;
    
    let niveau = '';
    let interpretation = '';
    let recommandations = [];
    
    if (matiere_organique < 1) {
      niveau = 'Très faible';
      interpretation = 'Sol très pauvre en matière organique';
      recommandations = [
        'Apport urgent de MO : > 30 tonnes/ha',
        'Compost mûr ou fumier bien décomposé',
        'Intégration de résidus de culture',
        'Cultures de couverture (légumineuses)'
      ];
    } else if (matiere_organique >= 1 && matiere_organique < 2) {
      niveau = 'Faible';
      interpretation = 'Teneur insuffisante en matière organique';
      recommandations = [
        'Apport de MO : 20-30 tonnes/ha',
        'Rotation avec légumineuses',
        'Compostage et mulching'
      ];
    } else if (matiere_organique >= 2 && matiere_organique < 3) {
      niveau = 'Moyen';
      interpretation = 'Teneur acceptable pour climats tropicaux';
      recommandations = [
        'Maintien par apports réguliers : 15-20 t/ha',
        'Incorporation résidus de culture',
        'Une légumineuse dans la rotation'
      ];
    } else if (matiere_organique >= 3 && matiere_organique < 5) {
      niveau = 'Bon';
      interpretation = 'Bonne teneur en matière organique';
      recommandations = [
        'Apport d\'entretien : 10-15 t/ha',
        'Maintenir pratiques conservatoires'
      ];
    } else {
      niveau = 'Élevé';
      interpretation = 'Teneur excellente';
      recommandations = [
        'Apport minimal pour entretien',
        'Valoriser ce capital par cultures exigeantes'
      ];
    }
    
    return {
      valeur: matiere_organique,
      unite: '%',
      niveau,
      interpretation,
      recommandations,
      optimal: matiere_organique >= 2 && matiere_organique < 5
    };
  }

  /**
   * Suggestions de cultures adaptées
   */
  suggestCrops(soilData) {
    const cultures = [];
    
    const ph = soilData.ph || 7;
    const texture = this.determineTexture(
      soilData.sand_percent,
      soilData.silt_percent,
      soilData.clay_percent
    );
    const ec_dsm = (soilData.ec_s || 0) / 1000;
    
    // Cultures selon pH
    if (ph >= 6.0 && ph <= 7.5) {
      cultures.push(
        { nom: 'Maïs', adaptation: 'Excellente', rendement_potentiel: 'Élevé' },
        { nom: 'Tomate', adaptation: 'Excellente', rendement_potentiel: 'Élevé' },
        { nom: 'Oignon', adaptation: 'Excellente', rendement_potentiel: 'Élevé' }
      );
    }
    
    if (ph >= 5.5 && ph <= 6.5) {
      cultures.push(
        { nom: 'Arachide', adaptation: 'Excellente', rendement_potentiel: 'Élevé' },
        { nom: 'Riz pluvial', adaptation: 'Bonne', rendement_potentiel: 'Moyen-Élevé' }
      );
    }
    
    if (ph >= 6.5 && ph <= 8.0) {
      cultures.push(
        { nom: 'Mil', adaptation: 'Bonne', rendement_potentiel: 'Moyen' },
        { nom: 'Sorgho', adaptation: 'Bonne', rendement_potentiel: 'Moyen' }
      );
    }
    
    // Cultures selon texture
    if (texture === 'Argileux' && ec_dsm < 2) {
      cultures.push(
        { nom: 'Riz irrigué', adaptation: 'Excellente', rendement_potentiel: 'Très élevé' }
      );
    }
    
    if (texture === 'Sableux') {
      cultures.push(
        { nom: 'Pastèque', adaptation: 'Excellente', rendement_potentiel: 'Élevé' },
        { nom: 'Niébé', adaptation: 'Bonne', rendement_potentiel: 'Moyen' }
      );
    }
    
    // Cultures tolérantes à la salinité
    if (ec_dsm >= 2 && ec_dsm < 8) {
      cultures.push(
        { nom: 'Orge', adaptation: 'Bonne tolérance sel', rendement_potentiel: 'Moyen' },
        { nom: 'Betterave', adaptation: 'Tolérante sel', rendement_potentiel: 'Moyen' }
      );
    }
    
    return cultures;
  }

  /**
   * Déterminer la texture simplifiée
   */
  determineTexture(sable, limon, argile) {
    if (!sable || !limon || !argile) return 'Indéterminée';
    
    if (argile >= 40) return 'Argileux';
    if (sable >= 70) return 'Sableux';
    if (limon >= 40 && argile < 27) return 'Limoneux';
    return 'Équilibré';
  }

  /**
   * Analyse complète du sol
   */
  performCompleteAnalysis(soilData) {
    return {
      ph: this.analyzePH(soilData.ph),
      salinite: this.analyzeEC(soilData.ec),
      phosphore: this.analyzePhosphorus(soilData.phosphore),
      potassium: this.analyzePotassium(soilData.potassium),
      texture: this.analyzeTexture(
        soilData.sand_percent,
        soilData.silt_percent,
        soilData.clay_percent
      ),
      matiere_organique: this.analyzeOrganicMatter(soilData.ob_percent),
      cultures_suggerees: this.suggestCrops(soilData),
      score_fertilite: this.calculateFertilityScore(soilData)
    };
  }

  /**
   * Calcul d'un score de fertilité global (0-100)
   */
  calculateFertilityScore(soilData) {
    let score = 0;
    let factors = 0;
    
    // pH (20 points max)
    if (soilData.ph) {
      if (soilData.ph >= 6.5 && soilData.ph <= 7.5) score += 20;
      else if (soilData.ph >= 6.0 && soilData.ph <= 8.0) score += 15;
      else if (soilData.ph >= 5.5 && soilData.ph <= 8.5) score += 10;
      else score += 5;
      factors++;
    }
    
    // Salinité (20 points max)
    if (soilData.ec) {
      const ec_dsm = soilData.ec / 1000;
      if (ec_dsm < 2) score += 20;
      else if (ec_dsm < 4) score += 15;
      else if (ec_dsm < 8) score += 10;
      else score += 5;
      factors++;
    }
    
    // Phosphore (20 points max)
    if (soilData.phosphore) {
      if (soilData.phosphore >= 20 && soilData.phosphore < 60) score += 20;
      else if (soilData.phosphore >= 10 && soilData.phosphore < 80) score += 15;
      else if (soilData.phosphore >= 5) score += 10;
      else score += 5;
      factors++;
    }
    
    // Potassium (20 points max)
    if (soilData.potassium) {
      if (soilData.potassium >= 150 && soilData.potassium < 400) score += 20;
      else if (soilData.potassium >= 80 && soilData.potassium < 500) score += 15;
      else if (soilData.potassium >= 50) score += 10;
      else score += 5;
      factors++;
    }
    
    // Matière organique (20 points max)
    if (soilData.ob_percent) {
      if (soilData.ob_percent >= 2 && soilData.ob_percent < 5) score += 20;
      else if (soilData.ob_percent >= 1 && soilData.ob_percent < 6) score += 15;
      else if (soilData.ob_percent >= 0.5) score += 10;
      else score += 5;
      factors++;
    }
    
    // Normaliser sur 100
    const finalScore = factors > 0 ? Math.round(score / factors * 5) : 0;
    
    let niveau = '';
    if (finalScore >= 80) niveau = 'Excellent';
    else if (finalScore >= 60) niveau = 'Bon';
    else if (finalScore >= 40) niveau = 'Moyen';
    else if (finalScore >= 20) niveau = 'Faible';
    else niveau = 'Très faible';
    
    return {
      score: finalScore,
      niveau,
      max: 100
    };
  }
}

module.exports = new SoilAnalysisService();