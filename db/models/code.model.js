import { model, Schema } from "mongoose";



const codeSchema = new Schema({
   code:{
        type: String,
        required: true,
    },
    userName:{
        type: String,
        required: true,
    },

}, { timestamps: true });

const Code = model('Code', codeSchema);

export default Code;
