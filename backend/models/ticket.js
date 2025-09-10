import mongoose from "mongoose"
import user from "./user.js"

const tickerSchema = new mongoose.Schema({
    title : {type : String},
    description : {type : String},
    status : {type : String, default : "TODO"},
    createdBy : {type : mongoose.Schema.Types.ObjectId, ref : "User"},
    assignedTo : {type : mongoose.Schema.Types.ObjectId, ref : "User", default : null},
    priority : {type : String},
    deadline : {type : Date},
    helpfulNotes : {type : String},
    relatedSkills : {type : [String]},
    createdAt : {type : Date, default : Date.now()}
})

export default mongoose.model("Ticket", tickerSchema)