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
        
        // This variable will hold fields we explicitly want to EXCLUDE (hide)
        let projection = {}; 

        // 1. Apply Authorization Filter
        if (user.role === "moderator") {
            query.assignedTo = user._id;
        } 
        else if (user.role === "user") {
            // Regular users can only fetch a ticket if they created it
            query.createdBy = user._id;
            
            // ✅ CHANGE: Hide helpfulNotes for regular users
            projection = { helpfulNotes: 0, relatedSkills: 0 }; 
        }
        
        // Admins (user.role === "admin") pass through with no restrictions or hidden fields.

        const ticket = await Ticket.findOne(query)
            .select(projection) // ⬅️ APPLY THE PROJECTION HERE
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

        // Authorization Check: Admin, Assigned Mod, or Creator can reply.
        const isAssigned = ticket.assignedTo && ticket.assignedTo._id.equals(userId);
        const isAdmin = userRole === 'admin';
        const isCreator = ticket.createdBy.equals(userId);

        if (!isAdmin && !isAssigned && !isCreator) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to reply to this ticket." });
        }
        
        // Construct the new reply object
        const newReply = {
            text: replyText,
            sentBy: userId,
        };
        
        ticket.replies.push(newReply);
        await ticket.save();

        // Return the reply with the current user's email for immediate FE update
        return res.status(200).json({ 
            message: "Reply sent successfully.",
            reply: { 
                ...newReply, 
                // Explicitly send the populated sentBy object
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
        const { id } = req.params; // Ticket ID from the URL
        const userId = req.user._id;
        const userRole = req.user.role;

        // 1. Fetch the ticket to check assignment
        const ticket = await Ticket.findById(id).select('assignedTo createdBy status');

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }

        // 2. Authorization Check
        const isAssigned = ticket.assignedTo && ticket.assignedTo.equals(userId);
        const isAdmin = userRole === 'admin';

        if (!isAdmin && !isAssigned) {
            return res.status(403).json({ message: "Forbidden: Only the Admin or assigned Moderator can close this ticket." });
        }

        // 3. Prevent closing if already closed
        if (ticket.status === 'CLOSED') {
            return res.status(400).json({ message: "Ticket is already closed." });
        }

        // 4. Update the status
        const result = await Ticket.updateOne(
            { _id: id },
            { $set: { status: 'CLOSED' } }
        );

        if (result.modifiedCount === 0) {
            // This is unlikely given the checks, but good for safety
            return res.status(400).json({ message: "Ticket status not changed." });
        }
        
        // 5. Success response
        return res.status(200).json({ 
            message: "Ticket successfully closed.",
            newStatus: 'CLOSED'
        });

    } catch (error) {
        console.error("Error closing ticket:", error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};