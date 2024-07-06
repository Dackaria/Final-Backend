import { Schema, model } from "mongoose";

const getCurrentDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset);
    return localDate.toISOString().slice(0, 16).replace("T", " ");
};

const messagesSchema = new Schema({
    user:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        default: getCurrentDate 
    }
})

const messageModel = model('messages', messagesSchema);

export default messageModel;