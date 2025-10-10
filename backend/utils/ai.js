import { createAgent, gemini, openai } from "@inngest/agent-kit";
import dotenv from "dotenv";

dotenv.config();


const PRIMARY_MODEL_NAME = "gemini-2.0-flash";
const FALLBACK_MODEL_NAME = "deepseek-coder:latest"; 

const SYSTEM_PROMPT = `You are an expert AI assistant that processes technical support tickets. 
Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`;

const USER_PROMPT_TEMPLATE = (ticket) => `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.

Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
"summary": "Short summary of the ticket",
"priority": "high",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Title: ${ticket.title}
- Description: ${ticket.description}`;


export const analyzeTicket = async (ticket) => {
    const userPrompt = USER_PROMPT_TEMPLATE(ticket);
    let rawResponseText = null;
    let modelUsed = PRIMARY_MODEL_NAME;


    try {
        const geminiAgent = createAgent({
            model: gemini({
                model: PRIMARY_MODEL_NAME,
                apiKey: process.env.GEMINI_API_KEY,
                timeout: 5000, 
            }),
            name: "Cloud AI Assistant",
            system: SYSTEM_PROMPT,
        });

        const response = await geminiAgent.run(userPrompt);
        const raw = response.output?.[0]?.content;
        rawResponseText = raw?.parts?.[0]?.text || raw;

        if (!rawResponseText) {
            throw new Error("Gemini returned an empty response.");
        }
        
    } catch (e) {

        console.warn(`⚠️ Gemini API failed (${e.message}). Falling back to local Ollama agent.`);
        modelUsed = FALLBACK_MODEL_NAME;

        try {
            if (!process.env.OLLAMA_BASE_URL) {
                 throw new Error("OLLAMA_BASE_URL is not set in environment variables.");
            }
            
            const ollamaAgent = createAgent({
                model: openai({ 
                    model: FALLBACK_MODEL_NAME, 
                    baseURL: process.env.OLLAMA_BASE_URL, 
                    apiKey: "ollama-key-placeholder", 
                    timeout: 5000, 
                }),
                name: "Local AI Assistant",
                system: SYSTEM_PROMPT,
            });

            const response = await ollamaAgent.run(userPrompt);
            const raw = response.output?.[0]?.content;
            rawResponseText = raw?.parts?.[0]?.text || raw;

        } catch (ollamaErr) {
            console.error("❌ Both Gemini and Ollama failed. Cannot analyze ticket.");
            console.error(`Ollama Error: ${ollamaErr.message}`);
           return null;
        }
    }

    if (!rawResponseText) {
        console.error("AI agent (Ollama) returned an empty or unparsable response.");
        return null;
    }

    try {
        const match = rawResponseText.match(/```json\s*([\s\S]*?)\s*```/i);
        const jsonString = match ? match[1] : rawResponseText.trim();
        const result = JSON.parse(jsonString);

        console.log(`✅ Ticket analyzed successfully using ${modelUsed}.`);
        return result;
    } catch (e) {
        console.error(`Failed to parse JSON from AI response (${modelUsed}):`, e.message);
        console.error("Raw response that failed to parse:", rawResponseText.substring(0, 500));
        return null;
    }
};

export default analyzeTicket;