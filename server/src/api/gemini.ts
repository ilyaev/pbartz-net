import GeminiAPI from "../gemini/gemini";

export default class ServerAPIGemini {
    req: Request;
    action: string;
    params: string[];
    variables: { [s: string]: string } = {};

    public static ROUTE = "gemini";

    constructor(
        req: Request,
        action: string,
        params: string[],
        body?: string,
        getParams?: { [s: string]: string }
    ) {
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
        if (getParams) {
            this.variables = { ...this.variables, ...getParams };
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
        } else if (service === "track") {
            if (!this.variables.artist || !this.variables.track) {
                return {
                    error: "Missing parameters",
                };
            }
            api.promptFromTemplate(
                "./src/gemini/prompts/track.tpl",
                this.variables
            );
        }

        res.parts = api.parts;
        try {
            const result = await api.run();
            res.JSON = api.resultAsJSON();
            res.text = result.text();
        } catch (e) {
            res.JSON = {};
            res.text = "";
            res.error = e;
        }

        if (service === "track") {
            if (!res.JSON || !res.JSON.description) {
                res.JSON.description =
                    "Cannot find anything this time. Try again later.";
                res.JSON.facts = res.JSON.facts || [];
                res.JSON.similar_tracks = res.JSON.similar_tracks || [];
                res.JSON.genres = res.JSON.genres || [];
            }
        }

        if (this.variables.json) {
            return res.JSON;
        }

        return res;
    }
}
