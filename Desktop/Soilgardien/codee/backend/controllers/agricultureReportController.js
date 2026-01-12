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
    const { analysis_data } = req.body;

    // Validation
    if (!analysis_data) {
      return res.status(400).json({
        success: false,
        message: 'Données d\'analyse requises'
      });
    }

    // Générer le PDF
    const result = await agricultureReportService.generateReport(analysis_data);

    if (result.success) {
      // Vérifier que le fichier existe
      if (!fs.existsSync(result.filePath)) {
        throw new Error('Le fichier PDF n\'a pas été créé');
      }

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
        }

        // Supprimer le fichier après téléchargement (nettoyage)
        setTimeout(() => {
          fs.unlink(result.filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('⚠️ Erreur suppression fichier temporaire:', unlinkErr);
            }
          });
        }, 5000); // Attendre 5 secondes avant de supprimer
      });

    } else {
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