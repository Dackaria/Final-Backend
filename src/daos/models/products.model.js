import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productsSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    thumbnails: { 
        type: [String], 
        required: false, 
        default: ["sin imagen"] 
    },
    code: { 
        type: String, 
        required: true, 
        unique: true 
    },
    stock: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    status: { 
        type: Boolean, 
        required: false, 
        default: true 
    }
}, { timestamps: true });

productsSchema.plugin(mongoosePaginate);

export const productsModel = mongoose.model('Products', productsSchema);
export default productsModel;
