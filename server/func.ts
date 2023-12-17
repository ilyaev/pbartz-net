import GeminiAPI from "./src/gemini/gemini.ts";

const api = new GeminiAPI(process.env.API_KEY_GEMINI || "");

api.parts = [{ text: "What is the meaning of life?" }];

const extra = {
    tools: [
        {
            functionDeclarations: [
                {
                    name: "meaning_of",
                    description: "Returns the meaning of anything specified.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            subject: {
                                type: "STRING",
                                description:
                                    "The subject to find the meaning of.",
                            },
                        },
                    },
                },
            ],
        },
    ],
};

const result = await api.run(extra);

console.log(result);
