const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Secret pour JWT (à déplacer dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

/**
 * @route   POST /api/auth/inscription
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/inscription', async (req, res) => {
  try {
    const {
      email,
      mot_de_passe,
      nom_complet,
      telephone,
      type_utilisateur,
      organisation,
      adresse,
      ville,
      region,
      pays
    } = req.body;

    // Validation des champs requis
    if (!email || !mot_de_passe || !nom_complet) {
      return res.status(400).json({
        success: false,
        message: 'Email, mot de passe et nom complet sont requis'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await User.findOne({ where: { email } });
    if (utilisateurExistant) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer le nouvel utilisateur
    const nouvelUtilisateur = await User.create({
      email,
      mot_de_passe_hash: mot_de_passe, // Le hook beforeCreate va le hasher automatiquement
      nom_complet,
      telephone,
      type_utilisateur: type_utilisateur || 'agriculteur',
      organisation,
      adresse,
      ville,
      region,
      pays: pays || 'Sénégal'
    });

    // Générer un token JWT
    const token = jwt.sign(
      {
        id: nouvelUtilisateur.id,
        email: nouvelUtilisateur.email,
        role: nouvelUtilisateur.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        utilisateur: nouvelUtilisateur,
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/connexion
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/connexion', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation des champs requis
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis'
      });
    }

    // Rechercher l'utilisateur par email
    const utilisateur = await User.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!utilisateur.est_actif) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte est désactivé. Veuillez contacter l\'administrateur.'
      });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await utilisateur.comparePassword(mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    await utilisateur.update({ derniere_connexion_le: new Date() });

    // Générer un token JWT
    const token = jwt.sign(
      {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        utilisateur,
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
      error: error.message
    });
  }
});

module.exports = router;
