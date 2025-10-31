import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req,res)=>{
    try {
        const {title, description} = req.body;
        if (!title || !description){
            return res.status(400).json({message: "Title and description are required"});
        }
        const newTicket = await Ticket.create({
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
        let filter = {}; 

        if (user.role === "admin") {
            filter = {};
        } 
        else if (user.role === "moderator") {
            filter = { assignedTo: user._id };
        }
        else { 
            filter = { createdBy: user._id };
        }

        const tickets = await Ticket.find(filter)
            .populate("assignedTo", ["email", "_id"])
            .sort({createdAt: -1});


        return res.status(200).json(tickets);
    } catch (error) {
        console.error("Error in fetching tickets: ",error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}



export const getTicket = async (req,res) =>{
    try {
        const user = req.user;
        const ticketId = req.params.id;
        let query = { _id: ticketId }; 
        

        let projection = {}; 

        if (user.role === "moderator") {
            query.assignedTo = user._id;
        } 
        else if (user.role === "user") {

            query.createdBy = user._id;

            projection = { helpfulNotes: 0, relatedSkills: 0 }; 
        }
        


        const ticket = await Ticket.findOne(query)
            .select(projection) 
            .populate("assignedTo", ["email", "_id"])
            .populate("createdBy", ["email", "_id"]) 
            .populate("replies.sentBy", ["email", "_id"]); 

        if(!ticket){
            return res.status(404).json({message: "Ticket not found or unauthorized access"});
        }
        return res.status(200).json({"ticket" : ticket.toObject()});
    } catch (error) {
        console.error("Error in fetching ticket: ",error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const replyToTicket = async (req, res) => {
    try {
        const { id } = req.params; 
        const { replyText } = req.body;
        const userId = req.user._id;
        const userRole = req.user.role;

        if (!replyText) {
            return res.status(400).json({ message: "Reply text is required." });
        }

        const ticket = await Ticket.findById(id).populate('createdBy assignedTo'); 

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }


        const isAssigned = ticket.assignedTo && ticket.assignedTo._id.equals(userId);
        const isAdmin = userRole === 'admin';
        const isCreator = ticket.createdBy.equals(userId);

        if (!isAdmin && !isAssigned && !isCreator) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to reply to this ticket." });
        }
        

        const newReply = {
            text: replyText,
            sentBy: userId,
        };
        
        ticket.replies.push(newReply);
        await ticket.save();


        return res.status(200).json({ 
            message: "Reply sent successfully.",
            reply: { 
                ...newReply, 

                sentBy: { _id: userId, email: req.user.email } 
            } 
        });

    } catch (error) {
        console.error("Error replying to ticket:", error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const closeTicket = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user._id;
        const userRole = req.user.role;


        const ticket = await Ticket.findById(id).select('assignedTo createdBy status');

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }

        const isAssigned = ticket.assignedTo && ticket.assignedTo.equals(userId);
        const isAdmin = userRole === 'admin';

        if (!isAdmin && !isAssigned) {
            return res.status(403).json({ message: "Forbidden: Only the Admin or assigned Moderator can close this ticket." });
        }

        if (ticket.status === 'CLOSED') {
            return res.status(400).json({ message: "Ticket is already closed." });
        }


        const result = await Ticket.updateOne(
            { _id: id },
            { $set: { status: 'CLOSED' } }
        );

        if (result.modifiedCount === 0) {

            return res.status(400).json({ message: "Ticket status not changed." });
        }
        

        return res.status(200).json({ 
            message: "Ticket successfully closed.",
            newStatus: 'CLOSED'
        });

    } catch (error) {
        console.error("Error closing ticket:", error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const assignTicket = async (req, res) => {
    try {
        const { id } = req.params; 
        const { assignedTo, assignedToEmail } = req.body; 
        const userRole = req.user.role;

        if (userRole !== "admin") {
            return res.status(403).json({ message: "Forbidden: Only Admin can reassign tickets." });
        }

        if (!assignedTo && !assignedToEmail) {
            return res.status(400).json({ message: "Assigned user ID or email is required." });
        }

        // ✅ Validate ticket existence
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }

        // ✅ Import User model dynamically
        const User = (await import("../models/user.js")).default;

        // ✅ Find user either by ID or by Email
        const userToAssign = await User.findOne({
            $or: [
                assignedTo ? { _id: assignedTo } : null,
                assignedToEmail ? { email: assignedToEmail } : null
            ].filter(Boolean) // Removes null entries
        });

        if (!userToAssign) {
            return res.status(404).json({ message: "User to assign not found." });
        }

        // ✅ Update and save ticket
        ticket.assignedTo = userToAssign._id;
        await ticket.save();

        return res.status(200).json({
            message: `Ticket assigned to ${userToAssign.email} successfully.`,
            ticket
        });

    } catch (error) {
        console.error("Error assigning ticket:", error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};
