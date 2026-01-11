/**
 * Contrôleur de génération de rapports PDF - AGRICULTEURS UNIQUEMENT
 */

const agricultureReportService = require('../services/agricultureReportService');
const path = require('path');
const fs = require('fs');

/**
 * Générer et télécharger un rapport PDF agricole
 */
exports.generateAgricultureReport = async (req, res) => {
  try {
    console.log('🎯 Requête reçue pour génération de rapport');
    console.log('📦 Body reçu:', JSON.stringify(req.body, null, 2));

    const { analysis_data } = req.body;

    // Validation
    if (!analysis_data) {
      console.error('❌ Aucune donnée d\'analyse fournie');
      return res.status(400).json({
        success: false,
        message: 'Données d\'analyse requises'
      });
    }

    console.log('✅ Données d\'analyse validées');
    console.log('📄 Génération rapport agricole...');

    // Générer le PDF
    const result = await agricultureReportService.generateReport(analysis_data);

    if (result.success) {
      console.log(`✅ Rapport prêt: ${result.fileName}`);
      console.log(`📁 Chemin: ${result.filePath}`);

      // Vérifier que le fichier existe
      if (!fs.existsSync(result.filePath)) {
        throw new Error('Le fichier PDF n\'a pas été créé');
      }

      console.log('📤 Envoi du fichier PDF...');

      // Envoyer le fichier en téléchargement
      res.download(result.filePath, result.fileName, (err) => {
        if (err) {
          console.error('❌ Erreur téléchargement:', err);
          if (!res.headersSent) {
            return res.status(500).json({
              success: false,
              message: 'Erreur lors du téléchargement du rapport',
              error: err.message
            });
          }
        } else {
          console.log('✅ Fichier envoyé avec succès');
        }

        // Supprimer le fichier après téléchargement (nettoyage)
        setTimeout(() => {
          fs.unlink(result.filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('⚠️ Erreur suppression fichier temporaire:', unlinkErr);
            } else {
              console.log('🗑️ Fichier temporaire supprimé');
            }
          });
        }, 5000); // Attendre 5 secondes avant de supprimer
      });

    } else {
      console.error('❌ Échec de génération du PDF');
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du rapport'
      });
    }

  } catch (error) {
    console.error('❌ Erreur génération rapport:', error);
    console.error('❌ Stack trace:', error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la génération du rapport',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

module.exports = exports;