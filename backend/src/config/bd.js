const mongoose = require(`mongoose`);

const connectBD = async () => {
    try {
        const conexion = await mongoose.connect('mongodb://127.0.0.1:27017/AstroBankbd?directConnection=true');
        console.log(`La conexion a la base de datos fue exitosa ${conexion.connection.host}`);
    } catch (error) {
        console.error(' Error al conectar la base de datos', error.message);
    }
};

module.exports = connectBD;