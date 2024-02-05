import { extractColors } from "extract-colors";
import getPixels from "get-pixels";
export default class ServerAPIImage {
    req: Request;
    action: string;
    params: string[];
    variables: { [s: string]: string } = {};

    public static ROUTE = "image";

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
        const src = this.variables.url || "";
        if (
            !src ||
            src.indexOf("image/") === -1 ||
            src.indexOf("https://i.") === -1
        ) {
            return { error: "Invalid image" };
        }
        return new Promise((resolve, reject) => {
            getPixels(src, (err, pixels) => {
                if (!err) {
                    const data = [...pixels.data];
                    const width = Math.round(Math.sqrt(data.length / 4));
                    const height = width;

                    extractColors({ data, width, height })
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject({ error: "Invalid image" });
                }
            });
        });
    }
}
