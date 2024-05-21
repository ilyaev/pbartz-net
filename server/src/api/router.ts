import ServerAPIAudioDB from "./audiodb";
import ServerAPIGemini from "./gemini";
import ServerAPIImage from "./image";
import ServerAPIFinances from "./finance";

function containsNonAscii(str: string) {
    // This regular expression matches any character that is not in the ASCII range.
    return /[^\x00-\x7F]/.test(str);
}

export default class ServerAPI {
    req: Request;
    action: string;
    params: string[];
    getParams: { [s: string]: string } = {};

    constructor(req: Request, action: string, params: string[]) {
        this.req = req;
        this.action = action;
        this.params = params;
        const getParams = (this.req.url.split("?")[1] || "")
            .split("&")
            .reduce((acc, cur) => {
                const k = cur.split("=")[0] || "";
                const v = cur.split("=")[1] || "";
                acc[k] = containsNonAscii(v) ? JSON.parse(v) : v;
                return acc;
            }, {} as any);
        this.getParams = getParams;
    }

    async run() {
        let res = {} as any;
        const body = await this.req.text();

        switch (this.action) {
            case ServerAPIFinances.ROUTE:
                const finances = new ServerAPIFinances(
                    this.req,
                    this.action,
                    this.params,
                    body,
                    this.getParams
                );
                res = await finances.run();
                break;
            case ServerAPIImage.ROUTE:
                const image = new ServerAPIImage(
                    this.req,
                    this.action,
                    this.params,
                    body,
                    this.getParams
                );
                res = await image.run();
                break;
            case ServerAPIAudioDB.ROUTE:
                const audiodb = new ServerAPIAudioDB(
                    this.req,
                    this.action,
                    this.params,
                    body,
                    this.getParams
                );
                res = await audiodb.run();
                break;
            case ServerAPIGemini.ROUTE:
                const gemini = new ServerAPIGemini(
                    this.req,
                    this.action,
                    this.params,
                    body,
                    this.getParams
                );
                res = await gemini.run();
                break;
            default:
                break;
        }

        return res;
    }
}
