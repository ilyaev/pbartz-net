import { Database } from "bun:sqlite";
import fs from "fs";

let DB: Database;

const DB_FILE = import.meta.dir + "/statements/statements.sqlite3";

export interface Transaction {
    ID: number;
    date: string;
    description: string;
    source: string;
    category: string;
    amount: number;
}

export const getDB = async (): Promise<Database> => {
    const dbExists = fs.existsSync(DB_FILE);
    if (DB) {
        DB.close();
    }
    const db = new Database(DB_FILE, { create: true });
    if (!dbExists) {
        db.run(`CREATE TABLE transactions (
                    ID INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE,
                    description TEXT,
                    source TEXT,
                    category TEXT,
                    amount REAL
                );`);
        db.run(`CREATE TABLE categories (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT,
            category TEXT
        );`);
    }
    DB = db;
    return DB;
};

export const getCategories = async () => {
    return DB.query("SELECT * FROM categories")
        .all()
        .reduce((acc: { [s: string]: string }, row: any) => {
            acc[row.description] = row.category;
            return acc;
        }, {} as { [s: string]: string });
};

export const getRows = async (): Promise<Transaction[]> => {
    const categories = await getCategories();
    const rows = DB.query("SELECT * FROM transactions").all() as Transaction[];
    return rows.map((row) => {
        row.category = categories[row.description] || "Unknown";
        return row;
    });
};

export const updateRows = async (rows: any[], existingRows: any[]) => {
    const stmt = DB.prepare(
        "INSERT INTO transactions (date, description, source, amount) VALUES (?, ?, ?, ?)"
    );
    rows.forEach((row: any) => {
        const rowExists = existingRows.find((r: any) => {
            return (
                r.date === row.date &&
                r.amount == row.amount &&
                r.source === row.source &&
                r.description === row.description
            );
        })
            ? true
            : false;
        if (!rowExists && row.amount) {
            console.log("Inserting row", row);
            stmt.run(row.date, row.description, row.source, row.amount);
        }
    });
};
