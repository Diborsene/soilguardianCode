/**
 * SERVICE DE GÉNÉRATION DE RAPPORTS PDF AGRICOLES
 * Version simplifiée pour agriculteurs uniquement
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class AgricultureReportService {
  
  constructor() {
    this.colors = {
      primary: '#27ae60',      // Vert Soil Guardian
      secondary: '#2c3e50',    // Bleu foncé
      warning: '#f39c12',      // Orange
      danger: '#e74c3c',       // Rouge
      success: '#27ae60',      // Vert
      text: '#2c3e50',        // Texte
      lightGray: '#ecf0f1',   // Fond gris
      gray: '#95a5a6'         // Gris moyen
    };
  }

  /**
   * GÉNÉRER LE RAPPORT AGRICOLE
   */
  async generateReport(analysisData) {
    try {
      console.log('📄 Génération rapport agricole...');

      const fileName = `rapport_analyse_sol_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../temp', fileName);

      // Créer le dossier temp s'il n'existe pas
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Créer le document PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: 'Rapport d\'analyse de sol agricole',
          Author: 'Soil Guardian',
          Subject: 'Analyse de sol',
          Keywords: 'sol, agriculture, fertilité, NPK'
        }
      });

      // Stream vers fichier
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // GÉNÉRER LE CONTENU
      this.generateContent(doc, analysisData);

      // Finaliser
      doc.end();

      // Attendre que le fichier soit écrit
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      console.log(`✅ Rapport généré: ${fileName}`);

      return {
        success: true,
        fileName: fileName,
        filePath: filePath
      };

    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw error;
    }
  }

  /**
   * GÉNÉRER LE CONTENU DU RAPPORT
   */
  generateContent(doc, data) {
    let yPos = 50;

    // ========== PAGE 1 : PAGE DE GARDE ==========
    this.drawCoverPage(doc);

    // ========== PAGE 2 : INFORMATIONS GÉNÉRALES ==========
    doc.addPage();
    yPos = 50;
    
    yPos = this.drawSectionHeader(doc, '1. LOCALISATION DE LA PARCELLE', yPos);
    yPos = this.drawLocationInfo(doc, data.localisation, yPos);

    // SCORE DE FERTILITÉ
    yPos += 20;
    yPos = this.drawSectionHeader(doc, '2. SCORE DE FERTILITÉ GLOBAL', yPos);
    yPos = this.drawFertilityScore(doc, data.analyse?.score_fertilite, yPos);

    // ========== PAGE 3 : PARAMÈTRES CHIMIQUES ==========
    doc.addPage();
    yPos = 50;
    yPos = this.drawSectionHeader(doc, '3. PARAMÈTRES CHIMIQUES', yPos);
    yPos = this.drawChemicalParameters(doc, data.analyse, data.donnees_brutes, yPos);

    // ========== PAGE 4 : TEXTURE DU SOL ==========
    doc.addPage();
    yPos = 50;
    yPos = this.drawSectionHeader(doc, '4. TEXTURE DU SOL', yPos);
    yPos = this.drawSoilTexture(doc, data.donnees_brutes?.texture, data.analyse?.texture, yPos);

    // ========== PAGE 5 : RECOMMANDATIONS ==========
    yPos += 30;
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }
    yPos = this.drawSectionHeader(doc, '5. RECOMMANDATIONS PRIORITAIRES', yPos);
    yPos = this.drawRecommendations(doc, data.recommandations_prioritaires, yPos);

    // ========== PAGE 6 : CULTURES RECOMMANDÉES ==========
    doc.addPage();
    yPos = 50;
    yPos = this.drawSectionHeader(doc, '6. CULTURES RECOMMANDÉES', yPos);
    yPos = this.drawCrops(doc, data.analyse?.cultures_suggerees, yPos);

    // FOOTER sur toutes les pages
    this.drawFooter(doc);
  }

  /**
   * PAGE DE GARDE
   */
  drawCoverPage(doc) {
    // Bannière verte supérieure
    doc.rect(0, 0, 595, 180).fill(this.colors.primary);
    
    // Logo et titre
    doc.fillColor('#ffffff')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('SOIL GUARDIAN', 50, 50, { align: 'center' });
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Diagnostic Intelligent des Sols', 50, 100, { align: 'center' });

    // Titre principal
    doc.fillColor(this.colors.text)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('RAPPORT D\'ANALYSE', 50, 240, { 
         width: 495,
         align: 'center' 
       });

    doc.fontSize(24)
       .text('DE SOL AGRICOLE', 50, 280, { 
         width: 495,
         align: 'center' 
       });

    // Date
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor(this.colors.gray)
       .text(`Généré le ${dateStr}`, 50, 350, {
         width: 495,
         align: 'center'
       });

    // Ligne de séparation
    doc.moveTo(100, 400)
       .lineTo(495, 400)
       .lineWidth(2)
       .stroke(this.colors.primary);

    // Message en bas
    doc.fontSize(12)
       .fillColor(this.colors.text)
       .text('Ce rapport contient une analyse détaillée des propriétés', 50, 450, {
         width: 495,
         align: 'center'
       });
    
    doc.text('de votre sol et des recommandations personnalisées', 50, 470, {
      width: 495,
      align: 'center'
    });
  }

  /**
   * INFORMATIONS DE LOCALISATION
   */
  drawLocationInfo(doc, localisation, yPos) {
    if (!localisation) return yPos;

    // Boîte d'information
    const boxHeight = 140;
    doc.rect(50, yPos, 495, boxHeight).fill(this.colors.lightGray);
    
    const items = [
      { 
        label: 'Coordonnées GPS', 
        value: `${localisation.position_demandee?.latitude || 'N/A'}, ${localisation.position_demandee?.longitude || 'N/A'}` 
      },
      { 
        label: 'Distance échantillon', 
        value: `${localisation.echantillon_utilise?.distance_km || 'N/A'} km` 
      },
      { 
        label: 'Source des données', 
        value: localisation.echantillon_utilise?.source || 'INP Sénégal' 
      },
      { 
        label: 'Date prélèvement', 
        value: localisation.echantillon_utilise?.date_analyse || 'N/A' 
      },
      { 
        label: 'Niveau de précision', 
        value: localisation.precision || 'Élevé' 
      }
    ];

    let itemY = yPos + 15;
    
    items.forEach(item => {
      doc.fillColor(this.colors.gray)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(item.label + ':', 65, itemY, { width: 180 });
      
      doc.fillColor(this.colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(item.value, 250, itemY, { width: 280 });
      
      itemY += 22;
    });
    
    return yPos + boxHeight + 10;
  }

  /**
   * SCORE DE FERTILITÉ
   */
  drawFertilityScore(doc, scoreData, yPos) {
    if (!scoreData) return yPos;

    const score = scoreData.score || 0;
    const niveau = scoreData.niveau || 'Moyen';

    // Grande boîte
    const boxHeight = 140;
    doc.rect(50, yPos, 495, boxHeight).fill(this.colors.lightGray);

    // Couleur selon score
    const scoreColor = score >= 80 ? this.colors.success :
                      score >= 60 ? this.colors.primary :
                      score >= 40 ? this.colors.warning :
                      this.colors.danger;

    // Score en gros
    doc.fillColor(scoreColor)
       .fontSize(60)
       .font('Helvetica-Bold')
       .text(`${score}`, 80, yPos + 25, { width: 100, align: 'center' });

    doc.fontSize(18)
       .fillColor(this.colors.gray)
       .font('Helvetica')
       .text('/100', 145, yPos + 65);

    // Niveau
    doc.fillColor(this.colors.text)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(niveau, 80, yPos + 95);

    // Barre de progression à droite
    const barWidth = 280;
    const barX = 240;
    const barY = yPos + 50;

    // Fond barre
    doc.rect(barX, barY, barWidth, 40)
       .fill('#ffffff')
       .stroke(this.colors.gray);

    // Barre remplie
    const fillWidth = (score / 100) * barWidth;
    doc.rect(barX + 2, barY + 2, fillWidth - 4, 36)
       .fill(scoreColor);

    // Texte sur la barre
    doc.fillColor('#ffffff')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Fertilité', barX + 10, barY + 12, { width: barWidth - 20 });

    return yPos + boxHeight + 10;
  }

  /**
   * PARAMÈTRES CHIMIQUES
   */
  drawChemicalParameters(doc, analyse, donneesBrutes, yPos) {
    if (!analyse) return yPos;

    const params = [
      { 
        name: 'pH du sol', 
        data: analyse.ph,
        icon: '⚗️'
      },
      { 
        name: 'Salinité (Conductivité Électrique)', 
        data: analyse.salinite,
        icon: '💧'
      },
      { 
        name: 'Phosphore (P)', 
        data: analyse.phosphore,
        icon: '🔶'
      },
      { 
        name: 'Potassium (K)', 
        data: analyse.potassium,
        icon: '🔷'
      },
      { 
        name: 'Matière Organique', 
        data: analyse.matiere_organique,
        icon: '🌱'
      }
    ];

    params.forEach(param => {
      if (param.data) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        // Boîte paramètre
        doc.rect(50, yPos, 495, 80).fill(this.colors.lightGray);

        // Icône + Nom
        doc.fillColor(this.colors.text)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`${param.icon} ${param.name}`, 65, yPos + 10);

        // Valeur
        const value = `${param.data.valeur} ${param.data.unite || ''}`;
        doc.fillColor(this.colors.text)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text(value, 65, yPos + 35);

        // Badge niveau
        const badgeColor = param.data.optimal ? this.colors.success : this.colors.warning;
        doc.rect(380, yPos + 10, 150, 25)
           .fill(badgeColor)
           .stroke(badgeColor);
        
        doc.fillColor('#ffffff')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(param.data.niveau || 'N/A', 385, yPos + 16, { width: 140, align: 'center' });

        // Interprétation
        doc.fillColor(this.colors.gray)
           .fontSize(9)
           .font('Helvetica-Oblique')
           .text(param.data.interpretation || '', 65, yPos + 58, { width: 470 });

        yPos += 90;
      }
    });

    return yPos;
  }

  /**
   * TEXTURE DU SOL
   */
  drawSoilTexture(doc, textureData, textureAnalyse, yPos) {
    if (!textureData) return yPos;

    // Titre composition
    doc.fillColor(this.colors.text)
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('Composition granulométrique:', 50, yPos);

    yPos += 30;

    const components = [
      { name: 'Sable', value: parseFloat(textureData.sable_percent) || 0, color: '#f39c12', symbol: '🏖️' },
      { name: 'Limon', value: parseFloat(textureData.limon_percent) || 0, color: '#95a5a6', symbol: '⛰️' },
      { name: 'Argile', value: parseFloat(textureData.argile_percent) || 0, color: '#c0392b', symbol: '🧱' }
    ];

    components.forEach(comp => {
      // Symbole + Nom
      doc.fillColor(this.colors.text)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`${comp.symbol} ${comp.name}:`, 60, yPos + 8);

      // Barre colorée
      const maxBarWidth = 320;
      const barWidth = (comp.value / 100) * maxBarWidth;
      
      // Fond barre
      doc.rect(180, yPos, maxBarWidth, 30)
         .fill('#ffffff')
         .stroke(this.colors.gray);

      // Barre remplie
      doc.rect(182, yPos + 2, barWidth - 4, 26)
         .fill(comp.color);

      // Pourcentage sur la barre
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`${comp.value.toFixed(1)}%`, 190, yPos + 8, { width: maxBarWidth - 20 });

      yPos += 40;
    });

    // Désignation de la texture
    yPos += 20;
    
    doc.rect(50, yPos, 495, 60)
       .fill(this.colors.primary)
       .stroke(this.colors.primary);

    doc.fillColor('#ffffff')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Classification:', 65, yPos + 10);

    doc.fontSize(18)
       .text(textureData.designation || 'Indéterminée', 65, yPos + 30);

    yPos += 70;

    // Interprétation
    if (textureAnalyse?.interpretation) {
      doc.fillColor(this.colors.gray)
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text(textureAnalyse.interpretation, 60, yPos, { width: 475 });
      yPos += 25;
    }

    return yPos;
  }

  /**
   * RECOMMANDATIONS PRIORITAIRES
   */
  drawRecommendations(doc, recommendations, yPos) {
    if (!recommendations || recommendations.length === 0) {
      doc.fillColor(this.colors.success)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('✅ Aucune intervention urgente nécessaire', 60, yPos);
      
      doc.fillColor(this.colors.gray)
         .fontSize(10)
         .font('Helvetica')
         .text('Votre sol présente de bonnes caractéristiques. Continuez les bonnes pratiques.', 60, yPos + 25, { width: 475 });
      
      return yPos + 50;
    }

    recommendations.forEach((reco, index) => {
      if (yPos > 680) {
        doc.addPage();
        yPos = 50;
      }

      // Numéro + Catégorie
      const badgeColor = reco.categorie === 'URGENT' ? this.colors.danger : this.colors.warning;
      
      // Numéro
      doc.circle(65, yPos + 10, 12)
         .fill(badgeColor);
      
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(reco.ordre || index + 1, 60, yPos + 5);

      // Badge catégorie
      doc.rect(85, yPos, 90, 22)
         .fill(badgeColor)
         .stroke(badgeColor);
      
      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(reco.categorie, 90, yPos + 6);

      // Action
      doc.fillColor(this.colors.text)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text(reco.action, 185, yPos + 4);

      yPos += 28;

      // Raison (dans boîte grise)
      doc.rect(60, yPos, 485, 30)
         .fill(this.colors.lightGray);

      doc.fillColor(this.colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(reco.raison, 70, yPos + 8, { width: 465 });

      yPos += 35;

      // Détails
      if (reco.details) {
        doc.fillColor(this.colors.primary)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('→ Mesure recommandée:', 70, yPos);

        yPos += 15;

        doc.fillColor(this.colors.text)
           .fontSize(9)
           .font('Helvetica')
           .text(reco.details, 85, yPos, { width: 450 });
        
        yPos += 20;
      }

      yPos += 15; // Espace entre recommandations
    });

    return yPos;
  }

  /**
   * CULTURES RECOMMANDÉES
   */
  drawCrops(doc, crops, yPos) {
    if (!crops || crops.length === 0) {
      doc.fillColor(this.colors.gray)
         .fontSize(11)
         .font('Helvetica-Oblique')
         .text('Aucune culture spécifiquement recommandée', 60, yPos);
      return yPos + 20;
    }

    // Introduction
    doc.fillColor(this.colors.text)
       .fontSize(11)
       .font('Helvetica')
       .text('Les cultures suivantes sont particulièrement adaptées aux caractéristiques de votre sol :', 60, yPos, { width: 475 });

    yPos += 30;

    crops.forEach((crop, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      // Boîte culture
      const boxHeight = 65;
      const boxColor = crop.adaptation === 'Excellente' ? this.colors.success : this.colors.primary;

      doc.rect(50, yPos, 495, boxHeight)
         .fill(this.colors.lightGray)
         .stroke(boxColor);

      // Numéro
      doc.circle(70, yPos + 20, 15)
         .fill(boxColor);
      
      doc.fillColor('#ffffff')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(index + 1, 65, yPos + 14);

      // Nom culture
      doc.fillColor(this.colors.text)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(`🌾 ${crop.nom}`, 100, yPos + 12);

      // Badge adaptation
      const adaptColor = crop.adaptation === 'Excellente' ? this.colors.success : this.colors.primary;
      doc.rect(380, yPos + 10, 150, 22)
         .fill(adaptColor);
      
      doc.fillColor('#ffffff')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(crop.adaptation, 385, yPos + 15, { width: 140, align: 'center' });

      // Rendement potentiel
      doc.fillColor(this.colors.gray)
         .fontSize(10)
         .font('Helvetica')
         .text(`Rendement potentiel: ${crop.rendement_potentiel}`, 100, yPos + 40);

      yPos += boxHeight + 12;
    });

    return yPos;
  }

  /**
   * EN-TÊTE DE SECTION
   */
  drawSectionHeader(doc, title, yPos) {
    doc.fillColor(this.colors.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(title, 50, yPos);
    
    doc.moveTo(50, yPos + 25)
       .lineTo(545, yPos + 25)
       .lineWidth(3)
       .stroke(this.colors.primary);
    
    return yPos + 40;
  }

  /**
   * FOOTER (toutes pages sauf première)
   */
  drawFooter(doc) {
    const pages = doc.bufferedPageRange();
    
    for (let i = 1; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Ligne séparatrice
      doc.moveTo(50, 770)
         .lineTo(545, 770)
         .lineWidth(1)
         .stroke(this.colors.gray);
      
      // Texte footer gauche
      doc.fillColor(this.colors.gray)
         .fontSize(9)
         .font('Helvetica')
         .text('Soil Guardian - Diagnostic Intelligent des Sols', 50, 780);
      
      // Numéro de page
      doc.fillColor(this.colors.gray)
         .fontSize(9)
         .text(`Page ${i + 1} / ${pages.count}`, 480, 780);
      
      // Contact
      doc.fillColor(this.colors.gray)
         .fontSize(8)
         .font('Helvetica-Oblique')
         .text('contact@soilguardian.sn | www.soilguardian.sn', 50, 795, { align: 'center', width: 495 });
    }
  }
}

module.exports = new AgricultureReportService();