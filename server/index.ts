import ServerAPI from "./src/api/router";

const BASE_PATH = "../";

const DOMAIN_MAP = {
    landing: "landing",
    ai: "ai",
    deepcompare: "deepcompare",
} as any;

const EXCLUSIONS = ["favicon.ico", ".env"];

const server = Bun.serve({
    port: process.env.PORT || 80,
    fetch(req: Request) {
        const IP: any = server.requestIP(req);
        let ip = IP ? IP.address || "" : "";
        ip = ip.replace("::ffff:", "");
        const url = new URL(req.url);
        let pathname = url.pathname;
        const domains = url.host.toLowerCase().split(".").slice(0, -1);
        const domain = domains[0] || "landing";
        const dir = DOMAIN_MAP[domain] || "landing";

        const ts = new Date().toLocaleString();

        if (pathname === "/") pathname = "/index.html";
        if (pathname.indexOf("/api") === 0) {
            return renderAPI(req, ip, ts);
        }
        if (pathname.indexOf("/index.html") > -1) {
            console.log(ts + ": INDEX: ", pathname, " IP", ip);
        }
        const is_excluded = EXCLUSIONS.some((ex) => pathname.indexOf(ex) > -1);
        if (is_excluded) {
            return new Response("Not Found", { status: 404 });
        }
        const filePath = BASE_PATH + dir + "/dist" + pathname;
        const file = Bun.file(filePath);
        return new Response(file);
    },
    tls:
        process.env.NODE_ENV === "production"
            ? {
                  key: Bun.file(process.env.KEY || ""),
                  cert: Bun.file(process.env.CERT || ""),
              }
            : undefined,
    error(r) {
        console.log("ERROR:", r);
        return new Response("Not Found", { status: 404 });
    },
});

const renderAPI = async (req: Request, ip: string, ts: string) => {
    const url = new URL(req.url);
    const its = url.pathname.split("/");
    const action = its[2] || "";
    const params = its.slice(3);
    const api = new ServerAPI(req, action, params);
    const result = await api.run();
    const res = new Response(JSON.stringify(result));
    console.log(ts + ":", "API CALL:", action, params, "IP", ip);
    if (process.env.NODE_ENV === "development") {
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );
    }
    return res;
};

console.log(
    `Listening on https://localhost:${server.port} at ${process.env.NODE_ENV}...`
);

if (process.env.NODE_ENV === "production") {
    const httpServer = Bun.serve({
        port: 80,
        fetch(req: Request) {
            return Response.redirect("https://" + req.headers.get("host"));
        },
    });
    console.log(
        `Listening on http://localhost:${server.port} at ${process.env.NODE_ENV}... (redirecting to https)`
    );
}
