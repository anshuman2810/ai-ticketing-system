import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req,res)=>{
    try {
        const {title, description} = req.body;
        if (!title || !description){
            return res.status(400).json({message: "Title and description are required"});
        }
        const newTicket = Ticket.create({
            title,
            description,
            createdBy: req.user._id.toString()
        })

        await inngest.send({
            name : "ticket/created",
            data : {
                ticketId : newTicket._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString()
            }
        })
        return res.status(201).json({
                message: "Ticket created successfully, processing started", 
                ticket: newTicket
        });

    } catch (error) {
        console.error("Error in creating ticket: ",error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getTickets = async (req,res) =>{
    try {
        const user = req.user;
        let tickets = []
        if(user.role !== "user"){
            tickets = Ticket.find({})
            .populate("assignedTo", ["email", "_id"])
            .sort({createdAt: -1});
        }
        else{
            await Ticket.find({createdBy: user._id})
        }
    } catch (error) {
        
    }
}