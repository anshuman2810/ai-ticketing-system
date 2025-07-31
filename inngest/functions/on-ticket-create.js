import { inngest } from "../client";
import Ticket from "../../models/ticket.js";
import { NonRetriableError } from "inngest";
import {sendMail} from "../../utils/mailer.js"
import {analyzeTicket} from "../../utils/ai.js"

export const onTicketCreate = inngest.createFunction(
    { id: "on-ticket-created", retries:2 },
    { event: "ticker/created" },

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

            

        } catch (error) {
            
        }
    }
)