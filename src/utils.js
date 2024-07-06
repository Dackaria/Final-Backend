import multer from "multer";
import {fileURLToPath} from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);


//Multer para subir imagenes desde un input
const storage =  multer.diskStorage({
    destination: function (request, file, callback)  {
        const destinationPath = __dirname + '/../public/image';
        callback(null, destinationPath);
      },
    filename: function (request, file, callback)  {
      callback(null, `${Date.now}-${file.originalname}`)
    }
});


export const uploader = multer({
  storage
})