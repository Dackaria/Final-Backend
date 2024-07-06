import express from  'express';
import logger  from 'morgan';
import { dynamicLogger } from './utils/logger.js';
import 'dotenv/config'
import appRouter from './routes/index.js'
import connectBD from './config/connectDB.js';
import handlebars from "express-handlebars";
import { __dirname, uploader } from './utils.js';

const app = express();
const PORT = 8080;
connectBD();



app.use(dynamicLogger);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'))

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars');

//Multer para subir imagenes desde el ordenador (Middleware)
app.post("/file", uploader.single('image'),(request,response)=>{
    response.send('imagen subida')
})

app.use(appRouter);

app.listen(PORT, (err) => {
    if(err) console.log(err)
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});





