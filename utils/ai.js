import {createAgent, gemini} from "@inngest/agent-kit";
import { l } from "@inngest/agent-kit/dist/agent-Df6e3z3X";

const analyzeTicket = async (ticket) => {
    const supportAgent = createAgent({
        model: gemini({
            model: "gemini-2.0-flash",
            apiKey : process.env.GEMINI_API_KEY,
        }),
        name : "AI Ticket Assistant",
        system : ``,
    });

    const response = await supportAgent.run(``);
     
}