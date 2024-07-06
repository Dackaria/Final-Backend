import bcrypt from "bcrypt";

//Retornar un hash ya creado
export const createHash = async (psw) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hashSync(psw, salt);
};

//Retornar si el password es valido o no
export const isValidPasswd = async (psw, encryptedPsw) => {
  const isValid = await bcrypt.compareSync(psw, encryptedPsw)
  return isValid;
};