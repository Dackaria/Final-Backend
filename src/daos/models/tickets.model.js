import { Schema, model } from "mongoose";

const ticketsSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    purchase_datetime: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: String,
        required: true
    },
});

export default model('Tickets', ticketsSchema)