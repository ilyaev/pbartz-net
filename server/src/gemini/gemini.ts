import fs from "node:fs";

import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    GenerativeModel,
    EnhancedGenerateContentResponse,
    Part,
} from "@google/generative-ai";

const MODEL_NAME = "gemini-pro";

export default class GeminiAPI {
    api: GoogleGenerativeAI;
    model: GenerativeModel;
    generationConfig: {
        temperature: number;
        topK: number;
        topP: number;
        maxOutputTokens: number;
    };
    safetySettings: { category: HarmCategory; threshold: HarmBlockThreshold }[];
    parts: Part[] = [];
    response: EnhancedGenerateContentResponse =
        {} as EnhancedGenerateContentResponse;

    constructor(apiKey: string, modelName: string = MODEL_NAME) {
        this.api = new GoogleGenerativeAI(apiKey);

        this.model = this.api.getGenerativeModel({ model: modelName });

        this.generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048 * 5,
        };

        this.safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];
    }

    promptFromTemplate(template: string, params: { [s: string]: string }) {
        let content = fs.readFileSync(template, "utf8");
        Object.keys(params).forEach((key) => {
            const r = new RegExp(`%${key}%`, "ig");
            content = content.replace(r, params[key]);
        });

        this.parts = [{ text: content }];
    }

    async run(extra: any = {}) {
        if (this.parts.length === 0) {
            return {
                text: () => "No prompt provided",
            } as EnhancedGenerateContentResponse;
        }
        const result = await this.model.generateContent(
            Object.assign(
                {},
                {
                    contents: [{ role: "user", parts: this.parts }],
                    generationConfig: this.generationConfig,
                    safetySettings: this.safetySettings,
                },
                extra
            )
        );

        this.response = result.response;
        return this.response;
    }

    resultAsJSON() {
        let res = this.response.text();
        res = res
            .replace("```json", "")
            .replace(/```/gi, "")
            .replace("``` JSON", "")
            .trim();
        if (res.indexOf("JSON") === 0) {
            res = res.substring(4);
        }
        if (res.indexOf(" JSON") === 0) {
            res = res.substring(5);
        }
        if (res.indexOf("json") === 0) {
            res = res.substring(4);
        }
        if (res.indexOf(" json") === 0) {
            res = res.substring(5);
        }
        res = res.replace(/\: undefined\,/gi, ": null,");
        res = res.replace(/\: \"undefined\"\,/gi, ": null,");
        if (res[0] !== "{" && res[0] !== "[") {
            res = "{" + res.substring(res.indexOf("{") + 1);
        }
        try {
            return JSON.parse(res);
        } catch (e) {
            console.log("ERROR: ", e, "RESPONSE: ", res, "END");
            return {};
        }
    }
}
