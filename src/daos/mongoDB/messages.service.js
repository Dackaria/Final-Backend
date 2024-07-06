import messageModel from "../models/message.model.js"

class MessageService{
    constructor(path) {
		this.path = path;
	}

	async getMessages(){
        try {
            return await messageModel.find({}).lean();
        } catch (error) {
            throw new Error(`No se pueden obtener los mensajes\n ${error.message}`);
        }
    }

	async createMessage(message){
        try {
            return await messageModel.create(message);
        } catch (error) {
            throw new Error(`No se pueden crear el mensaje\n ${error.message}`);
        }
    }
}

export default MessageService;