import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const collectionName = 'carts';

const cartSchema = new Schema({
    cartId:{
        type: Number,
        required: true,
        unique: true,
    },
    products:{
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: "products"
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
            },
        ],
        default: [],
    }
});

// Middleware para poblar los productos referenciados
cartSchema.pre('find', function () {
    this.populate('products.product');
});

cartSchema.pre('findOne', function () {
    this.populate('products.product');
});

const cartsModel = model(collectionName, cartSchema);

export default cartsModel;
