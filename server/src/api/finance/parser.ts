import fs from "fs";
import moment from "moment";

export const statementsDir = import.meta.dir + "/statements";

export const scanStatements = () => {
    const all = {} as any;
    fs.readdirSync(statementsDir, { withFileTypes: true })
        .filter((item) => !item.isDirectory() && item.name.endsWith(".csv"))
        .map((item) => item.name)
        .forEach((file) => {
            const its = file.split("_");
            if (!all[its[0]]) {
                all[its[0]] = [];
            }
            all[its[0]].push(statementsDir + "/" + file);
        });
    return all;
};

export const readStatements = (statements: any) => {
    let rows = [] as any;
    Object.keys(statements).forEach((source: string) => {
        const files = statements[source];
        files.forEach((file: string) => {
            rows = rows.concat(parseStatement(file, source));
        });
    });
    return rows;
};

export const parseStatement = (file: string, source: string) => {
    const content = fs.readFileSync(file, "utf8");
    const rows = [] as any[];
    if (source === "boa") {
        const lines = content.split("\n");
        const year = file.split("_")[file.split("_").length - 1].split(".")[0];
        const account = file.split("_")[1];
        lines.forEach((line: string) => {
            if (account === "cc") {
                const isCSV = line.includes('","') ? true : false;
                const parts = isCSV ? line.split(",") : line.split(" ");

                const transDate = (
                    isCSV
                        ? moment(parts[0])
                        : moment(year + "-" + parts[0].replace("/", "-"))
                ).format("YYYY-MM-DD");

                const amount = isCSV
                    ? parseFloat(parts[4]) * -1
                    : parts[parts.length - 1];

                const description = isCSV
                    ? parts[2].replace(/"/gi, "")
                    : parts.slice(2, parts.length - 3).join(" ");

                rows.push({ date: transDate, amount, description, source });
            } else if (account === "debit") {
                const parts = line.replace(/(?<=\d),(?=\d)/, "").split(",");
                const transDate = moment(parts[0], "MM/DD/YYYY").format(
                    "YYYY-MM-DD"
                );
                const amount =
                    parseFloat(
                        parts[2].replace(/"/gi, "").replace(/\,/gi, "")
                    ) * -1;
                const description = parts[1].replace(/"/gi, "");
                if (
                    description.indexOf("AMERICAN EXPRESS DES:ACH PMT") ===
                        -1 &&
                    description.indexOf("Online Banking") === -1
                )
                    rows.push({
                        date: transDate,
                        amount,
                        description,
                        source,
                    });
            }
        });
    } else if (source === "amex") {
        const lines = content.split("\n");
        lines.forEach((line: string) => {
            const parts = line.split(",");
            if (parts[0] !== "Date") {
                const transDate = moment(parts[0], "MM/DD/YYYY").format(
                    "YYYY-MM-DD"
                );
                const amount = parts[2];
                const description = parts[1]
                    .replace(/\s{2,}/gi, " ")
                    .replace("GglPay", "");
                rows.push({ date: transDate, amount, description, source });
            }
        });
    }
    return rows;
};
