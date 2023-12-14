import ServerAPI from "./src/api/router";

const BASE_PATH = "../";

const DOMAIN_MAP = {
    landing: "landing",
    ai: "ai",
} as any;

const server = Bun.serve({
    port: process.env.PORT || 80,
    fetch(req: Request) {
        const url = new URL(req.url);
        let pathname = url.pathname;
        const domains = url.host.toLowerCase().split(".").slice(0, -1);
        const domain = domains[0] || "landing";
        const dir = DOMAIN_MAP[domain] || "landing";

        if (pathname === "/") pathname = "/index.html";
        if (pathname.indexOf("/api") === 0) {
            return renderAPI(req);
        }
        const filePath = BASE_PATH + dir + "/dist/" + pathname;
        const file = Bun.file(filePath);
        return new Response(file);
    },
    error(r) {
        console.log("--SERVER_ERROR--", r);
        return new Response("Not Found", { status: 404 });
    },
});

const renderAPI = async (req: Request) => {
    const url = new URL(req.url);
    const its = url.pathname.split("/");
    const action = its[2] || "";
    const params = its.slice(3);
    const api = new ServerAPI(req, action, params);
    const result = await api.run();
    const res = new Response(JSON.stringify(result));
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    return res;
};

console.log(`Listening on http://localhost:${server.port} ...`);
