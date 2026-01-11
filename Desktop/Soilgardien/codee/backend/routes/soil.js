const express = require('express');
const router = express.Router();
const soilController = require('../controllers/soilController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/soil/find-nearest
 * @desc    Trouver les échantillons de sol les plus proches
 * @access  Public (ou Private avec authenticateToken)
 */
router.post('/find-nearest', soilController.findNearestSoil);

/**
 * @route   POST /api/soil/analyze
 * @desc    Analyser le sol pour une position donnée
 * @access  Public
 */
router.post('/analyze', soilController.analyzeSoilAtLocation);

/**
 * @route   POST /api/soil/report
 * @desc    Générer un rapport détaillé (pour PDF)
 * @access  Public
 */
router.post('/report', soilController.getDetailedReport);

module.exports = router;