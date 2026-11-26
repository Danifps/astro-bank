const mongoose = require('mongoose');

const esquemaPerfil = new mongoose.Schema({
    tipo_documento:{
        type: String,
        required: true
    },
    cedula:{
        type: String,
        required: true  
    },
    nombre_completo:{
        type: String,
        required: true
    },
    genero:{
        type: String,
        required: true
    },
    direccion:{
        type: String,
        required: true
    },
    operadora_telefono: {
        type: String,
        required: true
    },
    numero_telefono: {
        type: String,
        required: true
    },
    correo_electronico:{
        type: String,
        required: false
    },
    imagen_documento: {
        type: String,
        required: true
    },
    tipo_usuario: {
        type: String,
        required: true
    },
    datos_laborales: {
        empresa: { 
            type: String,
            required: true
        },
        cargo: {
            type: String,
            required: true
        },
        ingresos_mensuales: {
            type: Number,
            required: true
        }
}

});

module.exports = mongoose.model('perfil', esquemaPerfil, 'perfil'); 