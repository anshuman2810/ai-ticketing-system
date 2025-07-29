import { inngest } from "../client";
import User from "../../models/user.js"
import { NonRetriableError } from "inngest";
import {sendMail} from "../../utils/mailer.js"

export const onTicketCreate = inngest.createFunction(
    { id: "on-ticket-created", retries:2 },
    { event: "ticker/created" },

    async ({event,step}) =>{
        try {
            const {tickerId} = event.data;

            //1:56:11
        } catch (error) {
            
        }
    }
)