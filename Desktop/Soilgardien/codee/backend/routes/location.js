const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');


// Routes publiques
router.post('/reverse-geocode', locationController.reverseGeocode);
router.post('/geocode', locationController.geocode);
router.get('/distance', locationController.calculateDistance);

// Si vous voulez protéger ces routes (optionnel)
// router.post('/reverse-geocode', authenticateToken, locationController.reverseGeocode);

module.exports = router;