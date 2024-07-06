import usersModel from "../models/users.model.js"
import { createHash, isValidPasswd } from "../../utils/encrypt.js"
import { cartService } from "../../repository/index.js";

class UserService {

    async getUser(email, password) {
        try {
            if (email === "adminCoder@coder.com" && password === "admin") {
                return { email, role: "ADMIN" }
            }

            const findUser = await usersModel.findOne({ email });
            if (!findUser) return { error: `usuario no registrado`, code: 400 };

            const isValidComparePsw = await isValidPasswd(password, findUser.password);
            if (!isValidComparePsw) return { error: `contrasena incorrecta`, code: 403 };

            console.log(findUser);
            return findUser;

        } catch (error) {
            throw new Error(`No se pueden obtener al usuario\n ${error.message}`);
        }
    }

    async addUser(user) {
        try {
            const { first_name, last_name, email, age, password } = user;

            const userExists = await this.checkUser(email);
            if(!userExists.error) return { error: `usuario ya registrado` }

            const pswHashed = await createHash(password);

            const newCart = await cartService.addCart();
            console.log("🚀 ~ UserServiceDao ~ addUser ~ newCart:", newCart);

            const newUser = await usersModel.create({
                first_name,
                last_name,
                email,
                password: pswHashed,
                cart: newCart.cart
            });
            console.log("🚀 ~ UserServiceDao ~ addUser ~ newUser:", newUser);

            return { message: `Nuevo usuario agregado`, user: newUser };

        } catch (error) {
            throw new Error(`No se puede registar al usuario\n ${error.message}`);
        }
    }

    async changePassword(email, new_password) {
        const findUser = await usersModel.findOne({ email });

        if (!findUser) return { error: `credenciales invalidas o erroneas`, code: 401 };

        const isTheSamePsw = await isValidPasswd(new_password, findUser.password);

        if (isTheSamePsw) return { error: `no puede colocar la misma contrasena!`, code: 403 };

        const newPswHash = await createHash(new_password);

        const updateUser = await usersModel.findByIdAndUpdate(
            findUser._id, { password: newPswHash });

        if (!updateUser) {
            return { error: "problemas actualizando la contrasena", code: 404 };
        }

        return { message: `Contraseña cambiada!` }

    }

    async checkUser(email) {
        try {
            const findUser = await usersModel.findOne({ email });

            if (!findUser) return { error: `usuario no registrado` };

            return findUser;

        } catch (error) {
            throw new Error(`No se pueden obtene al usuario\n ${error.message}`);
        }
    }

    async changeRole(email, new_role) {
        const findUser = await usersModel.findOne({ email });

        if (!findUser) return { error: `No existe ese usuario`, code: 404 };

        const updateUser = await usersModel.findByIdAndUpdate(
            findUser._id, { role: new_role });

        if (!updateUser) {
            return { error: "problemas actualizando el rol", code: 404 };
        }

        return { message: `Rol actualizado!` }

    }

    async getAllUsers() {
        try {
            return await usersModel.find({}).select({
                "first_name": 1,
                "last_name": 1,
                "email": 1,
                "role": 1,
                "_id": 0,
                "cart": 0
            });
        } catch (error) {
            throw new Error(`No se pueden obtener los usuarios\n ${error.message}`);
        }
    }

    async deleteUser(email) {
        try {
            const result = await usersModel.deleteOne({ email });
            console.log(result);

            return result.deletedCount === 0 ? { error: "Not found" } : { message: `Se eliminó el user con email ${email}` };

        } catch (error) {
            throw new Error(`No se pueden obtene al usuario\n ${error.message}`);
        }
    }

    async deleteOldUsers() {
        try {
            const fiveMinutesAgo = new Date();
            fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

            const checkUsers = await usersModel.find({
                $or: [
                    { last_connection: { $lt: fiveMinutesAgo } }, //Usuarios con conexion hace mas de dos dias
                    { last_connection: { $exists: false } }   //Usuarios que nunca se conectaron
                ]
            }).select({
                "email": 1,
                "_id": 0,
                "cart": 0
            });
            let deletedUsers = checkUsers.map(user => user.email);

            const result = await usersModel.deleteMany({
                $or: [
                    { last_connection: { $lt: fiveMinutesAgo } }, //Usuarios con conexion hace mas de dos dias
                    { last_connection: { $exists: false } }   //Usuarios que nunca se conectaron
                ]
            });
            
            return result.deletedCount === 0 
            ? { message: "No se eliminó ningun usuario" } 
            : { message: "Se eliminaron los usuarios que no se conectaron en los últimos 2 días",
                data: deletedUsers
            };

        } catch (error) {
            throw new Error(`No se pueden obtene al usuario\n ${error.message}`);
        }
    }
}

export default UserService;