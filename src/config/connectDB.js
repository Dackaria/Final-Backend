import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Base de datos conectada');
    } catch (error) {
        console.error('Error al conectar a la base de datos', error.message);
        process.exit(1); 
    }
};

export default connectDB;