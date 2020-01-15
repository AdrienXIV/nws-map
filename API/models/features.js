const mongoose = require('mongoose');
const type = mongoose.Schema.Types;


// Schémas
const featuresSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'Feature'
    },
    geometry: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Coordonnées manquantes']
        }
    },
    properties: {
        adresse: {
            type: String,
            default: null
        },
        ville: {
            type: String,
            default: null
        },
        codepostal: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        entreprises: [{
            nom: {
                type: String,
                default: null
            },
            codeAPE: {
                type: String,
                default: null
            },
            secteur: {
                type: String,
                default: null
            },
            chiffre_affaire: [{
                chiffre: {
                    type: String,
                    default: null
                },
                annee: {
                    type: String,
                    default: null
                }
            }],
            contrat: [{
                poste: {
                    type: String,
                    default: null
                },
                sujet_stage: {
                    type: String,
                    default: null
                },
                debut: {
                    type: String,
                    default: null
                },
                fin: {
                    type: String,
                    default: null
                }
            }],

        }]
    }
});

// Modèle
const featuresModele = mongoose.model('features', featuresSchema, 'features');

module.exports = featuresModele;