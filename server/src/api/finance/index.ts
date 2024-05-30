import { getCategories, getDB, getRows, updateRows } from "./db";
import { parseStatement, readStatements, scanStatements } from "./parser";
import GeminiAPI from "../../gemini/gemini";

export default class ServerAPIFinances {
    req: Request;
    action: string;
    params: string[];
    variables: { [s: string]: string } = {};

    public static ROUTE = "finances";

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
            success: true,
            result: "",
        } as any;

        const db = await getDB();

        switch (service) {
            case "reload":
                const statements = scanStatements();
                const rows = readStatements(statements);
                let existingRows = await getRows();
                await updateRows(rows, existingRows);
                existingRows = (await getRows()) as any[];
                res.result = existingRows.length + " rows loaded";
                break;
            case "rows":
                const key = this.variables.email || "";
                if (
                    ["ilyaev@gmail.com", "dianailiaiev@gmail.com"].indexOf(
                        key
                    ) == -1
                ) {
                    res.result = [];
                } else {
                    if (this.variables.content && this.variables.source) {
                        const rows = parseStatement(
                            this.variables.source,
                            this.variables.source.includes("amex")
                                ? "amex"
                                : "boa",
                            this.variables.content
                        );
                        if (rows.length > 0) {
                            let existingRows = await getRows();
                            await updateRows(rows, existingRows);
                        }
                    }
                    const allrows = await getRows();
                    res.result = allrows;
                }
                break;
            case "categories":
                const existingCategories = await getCategories();

                const categories = db
                    .query("SELECT DISTINCT description FROM transactions")
                    .all() as any[];

                const api = new GeminiAPI(process.env.API_KEY_GEMINI || "");

                const newCategories = categories
                    .filter((category) =>
                        existingCategories[category.description] ? false : true
                    )
                    .filter((category) =>
                        category.description.indexOf("VIOLATION") === -1
                            ? true
                            : false
                    )
                    .slice(0, 10);

                if (!newCategories.length) {
                    return res;
                }
                this.variables.JSON = JSON.stringify(newCategories);
                api.promptFromTemplate(
                    "./src/gemini/prompts/statement_category.tpl",
                    this.variables
                );
                res.parts = api.parts;
                try {
                    const result = await api.run();
                    res.JSON = api.resultAsJSON();
                    res.text = result.text();
                    const stmt = db.prepare(
                        "INSERT INTO categories (description, category) VALUES (?, ?)"
                    );
                    res.JSON.forEach((cat: any) => {
                        stmt.run(cat.description, cat.category);
                    });
                } catch (e) {
                    res.JSON = {};
                    res.text = "";
                    res.error = e;
                }

                return res;
                break;
        }

        return res;
    }
}
