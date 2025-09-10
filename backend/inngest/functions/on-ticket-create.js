import { inngest } from "../client";
import Ticket from "../../models/ticket.js";
import { NonRetriableError } from "inngest";
import {sendMail} from "../../utils/mailer.js"
import {analyzeTicket} from "../../utils/ai.js"

export const onTicketCreate = inngest.createFunction(
    { id: "on-ticket-created", retries:2 },
    { event: "ticket/created" },

    async ({event,step}) =>{
        try {
            const {ticketId} = event.data;
            const ticket = await step.run("fetch-ticket", async() => {
                const ticketObject = await User.findOne({ticketId});
                if(!ticketObject){
                    throw new NonRetriableError("Ticket not found");
                }
                return ticketObject;
            })

            await step.run("update-ticket-status", async() => {
                await Ticket.findByIdAndUpdate(ticket._id, {status: "TODO"});
            })

            const aiResponse = await analyzeTicket(ticket)
            const relatedSkills =await step.run("ai-processing",async()=>{
                let skills = []
                if(aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority : ["low", "medium", "high"].includes(aiResponse.priority) ? aiResponse.priority : "medium",
                        helpfulNotes : aiResponse.helpfulNotes || "No additional notes provided.",
                        relatedSkills : aiResponse.relatedSkills || [],
                        status : "IN-PROGRESS"
                    })
                    skills = aiResponse.relatedSkills || [];
                }
                return skills;
            })

            const moderator = await step.run("assign-moderator", async() => {
                let user = await User.findOne({
                    role: "moderator",
                    skills: {
                        $elemMatch:{
                            $regex: relatedSkills.join("|"),
                            $options: "i"
                        },
                    },
                });
                if (!user){
                    user = await User.findOne({
                        role: "admin"
                    });
                }
                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null
                })
                return user;
            });
            await step.run("send-email-notification", async() => {
                if(moderator){
                    const finalTicket = await Ticket.findById(ticket._id)
                    await sendMail(
                        moderator.email,
                        "New Ticket Assigned",
                        `A new ticket has been assigned to you. ${finalTicket.title}` 
                    )
                }
            })

            return {success : true};
        } catch (error) {
            console.error("❌Error in running the step:", error.message);
            return {success:false}
        }
    }
)