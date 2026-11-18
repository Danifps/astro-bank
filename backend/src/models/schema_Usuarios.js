const mongoose = require('mongoose');

const esquemaUsuario = new mongoose.Schema({
    nombres: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Usuario', esquemaUsuario);                