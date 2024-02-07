import ServerAPI from "./src/api/router";

const BASE_PATH = "../";

const DOMAIN_MAP = {
    landing: "landing",
    ai: "ai",
    visualizer: "viz",
    deepcompare: "deepcompare",
    playlistspot: "spot",
} as any;

const EXCLUSIONS = ["favicon.ico", ".env"];

const server = Bun.serve({
    port: process.env.PORT || 80,
    async fetch(req: Request) {
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

        let spotifyToken = "";

        if (pathname.indexOf("/index.html") > -1) {
            console.log(
                ts + ": INDEX: ",
                pathname,
                " IP",
                ip,
                "DOMAINS: ",
                domains
            );
            spotifyToken = req.headers.get("spotify-token") || "";
        }
        const is_excluded = EXCLUSIONS.some((ex) => pathname.indexOf(ex) > -1);
        if (is_excluded) {
            return new Response("Not Found", { status: 404 });
        }
        const filePath = BASE_PATH + dir + "/dist" + pathname;
        const file = Bun.file(filePath);

        if (filePath.indexOf("dist/index.html") > -1 && dir === "viz") {
            if (!url.searchParams.get("token") && !spotifyToken) {
                return new Response("Not Found", { status: 404 });
            }
        }

        if (filePath.indexOf("dist/index.html") > -1 && spotifyToken) {
            const text = await file.text();
            return new Response(text.replace("%SPOTIFY_TOKEN%", spotifyToken), {
                headers: {
                    "Content-Type": "text/html;charset=utf-8",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                },
            });
        } else {
            return new Response(file);
        }
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
    console.log(
        ts + ":",
        "API CALL:",
        action,
        JSON.stringify(params),
        JSON.stringify(api.getParams),
        "IP",
        ip
    );
    const result = await api.run();
    const res = new Response(JSON.stringify(result));
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
            console.log("REDIRECT: ", req.headers.get("host"), " -> https");
            return Response.redirect("https://" + req.headers.get("host"));
        },
    });
    console.log(
        `Listening on http://localhost:80 at ${process.env.NODE_ENV}... (redirecting to https)`
    );
}
