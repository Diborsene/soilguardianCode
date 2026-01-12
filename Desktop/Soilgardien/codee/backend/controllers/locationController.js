const NodeGeocoder = require('node-geocoder');

// Configuration du geocoder
const geocoderOptions = {
  provider: 'openstreetmap', // Gratuit, pas besoin de clé API
  httpAdapter: 'https',
  formatter: null
};

const geocoder = NodeGeocoder(geocoderOptions);

/**
 * @route   POST /api/location/reverse-geocode
 * @desc    Obtenir l'adresse à partir des coordonnées GPS
 * @access  Public
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude et longitude sont requis'
      });
    }

    // Vérifier les valeurs valides
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordonnées invalides'
      });
    }

    // Effectuer le reverse geocoding
    const results = await geocoder.reverse({ lat: latitude, lon: longitude });

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune adresse trouvée pour ces coordonnées'
      });
    }

    const location = results[0];

    res.status(200).json({
      success: true,
      data: {
        formatted_address: location.formattedAddress,
        ville: location.city || location.village || location.town,
        region: location.state || location.county,
        pays: location.country,
        code_pays: location.countryCode,
        code_postal: location.zipcode,
        latitude: latitude,
        longitude: longitude,
        details: {
          rue: location.streetName,
          numero: location.streetNumber,
          quartier: location.neighbourhood || location.suburb,
          administratif: {
            niveau1: location.administrativeLevels?.level1long,
            niveau2: location.administrativeLevels?.level2long
          }
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors du reverse geocoding:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la localisation',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/location/geocode
 * @desc    Obtenir les coordonnées à partir d'une adresse
 * @access  Public
 */
exports.geocode = async (req, res) => {
  try {
    const { adresse } = req.body;

    if (!adresse) {
      return res.status(400).json({
        success: false,
        message: 'L\'adresse est requise'
      });
    }

    const results = await geocoder.geocode(adresse);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune coordonnée trouvée pour cette adresse'
      });
    }

    const locations = results.map(location => ({
      formatted_address: location.formattedAddress,
      latitude: location.latitude,
      longitude: location.longitude,
      ville: location.city || location.village,
      region: location.state || location.county,
      pays: location.country,
      code_pays: location.countryCode
    }));

    res.status(200).json({
      success: true,
      data: locations
    });

  } catch (error) {
    console.error('Erreur lors du geocoding:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des coordonnées',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/location/distance
 * @desc    Calculer la distance entre deux points
 * @access  Public
 */
exports.calculateDistance = async (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.query;

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({
        success: false,
        message: 'Toutes les coordonnées sont requises (lat1, lon1, lat2, lon2)'
      });
    }

    // Formule de Haversine pour calculer la distance
    const R = 6371; // Rayon de la Terre en km
    const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
    const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    res.status(200).json({
      success: true,
      data: {
        distance_km: distance.toFixed(2),
        distance_m: (distance * 1000).toFixed(0),
        point1: { latitude: parseFloat(lat1), longitude: parseFloat(lon1) },
        point2: { latitude: parseFloat(lat2), longitude: parseFloat(lon2) }
      }
    });

  } catch (error) {
    console.error('Erreur lors du calcul de distance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de distance',
      error: error.message
    });
  }
};