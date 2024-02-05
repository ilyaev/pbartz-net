export default class ServerAPIAudioDB {
    req: Request;
    action: string;
    params: string[];
    variables: { [s: string]: string } = {};

    public static ROUTE = "audiodb";

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

        if (service === "track") {
            const artist = this.variables.artist || "";
            const track = this.variables.track || "";
            console.log({ artist, track });
            const url = `https://www.theaudiodb.com/api/v1/json/253221276b25211525322y/searchtrack.php?s=${artist}&t=${track}`;
            console.log({ url });
            // const url = `https://www.theaudiodb.com/api/v1/json/2/searchtrack.php?s=coldplay&t=yellow`
            const response = await fetch(url);
            const json = await response.json();
            return json.track && json.track[0] ? json.track[0] : {};
        }

        return {};
    }
}
