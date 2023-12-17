import GeminiAPI from "./src/gemini/gemini.ts";
import fs from "node:fs";

const api = new GeminiAPI(
    process.env.API_KEY_GEMINI || "",
    "gemini-pro-vision"
);

const prompt =
    "Describe what you see in this picture. Suggest place,time when this picture was taken. What is mood of this picture?. Return result in JSON format with keys: place, time{season, time_of_day}, mood, items{name,type}, people{gender,age,mood,constitution,height}, actions, colors{name,rgb}, animals{name,color}, plants, weather, summary";
const image = {
    inlineData: {
        data: Buffer.from(fs.readFileSync("sample10_ph.jpg")).toString(
            "base64"
        ),
        mimeType: "image/jpeg",
    },
};

api.parts = [image, { text: prompt }];

const res = await api.run();

console.log(res.candidates![0].content.parts[0].text);
