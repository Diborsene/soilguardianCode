const express = require('express');
const router = express.Router();
const reportController = require('../controllers/agricultureReportController');

// Route de génération de rapport agricole
router.post('/generate-agriculture', reportController.generateAgricultureReport);

module.exports = router;