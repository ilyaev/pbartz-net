import GeminiAPI from "../gemini/gemini";

export default class ServerAPIGemini {
    req: Request;
    action: string;
    params: string[];
    variables: { [s: string]: string } = {};

    public static ROUTE = "gemini";

    constructor(req: Request, action: string, params: string[], body?: string) {
        this.req = req;
        this.action = action;
        this.params = params;
        if (body) {
            var obj = {} as any;
            try {
                obj = JSON.parse(body);
            } catch (e) {
                obj = {};
            }
            this.variables = obj;
        }
    }

    async run() {
        const service = this.params[0] || "";
        let res = {
            action: this.action,
            params: this.params,
            service,
        } as any;

        const api = new GeminiAPI(process.env.API_KEY_GEMINI || "");

        if (service === "config") {
            if (!this.variables.file1 || !this.variables.file2) {
                return {
                    error: "Missing file1 or file2",
                };
            }
            api.promptFromTemplate(
                "./src/gemini/prompts/config.tpl",
                this.variables
            );
        }

        res.parts = api.parts;
        const result = await api.run();
        res.JSON = api.resultAsJSON();
        res.text = result.text();

        return res;
    }
}
