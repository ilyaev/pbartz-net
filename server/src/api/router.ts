import ServerAPIGemini from "./gemini";

export default class ServerAPI {
    req: Request;
    action: string;
    params: string[];

    constructor(req: Request, action: string, params: string[]) {
        this.req = req;
        this.action = action;
        this.params = params;
    }

    async run() {
        let res = {} as any;
        const body = await this.req.text();
        switch (this.action) {
            case ServerAPIGemini.ROUTE:
                const gemini = new ServerAPIGemini(
                    this.req,
                    this.action,
                    this.params,
                    body
                );
                res = await gemini.run();
                break;
            default:
                break;
        }

        return res;
    }
}
