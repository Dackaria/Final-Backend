import mongoose from "mongoose";
import ROLES from "../../roles/roles.js";

const collectionName = "users";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
        password: {
        type: String,
        //required: true, //lo saque por registro con github
    },
    role: {
        type: String,
        enum: ROLES,
        default: 'USER'
    },
    cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
        required: true
    },
    last_connection:{
        type: Date,
        default: Date.now
    }
});

userSchema.pre('find', function () {
    this.populate("cart")
})

const usersModel = mongoose.model(collectionName, userSchema);
export default usersModel;