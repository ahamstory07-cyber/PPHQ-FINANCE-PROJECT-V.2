import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database
const db = new Database("database.sqlite");

// Auto-migration for SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT,
    branchId TEXT,
    isActive INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT,
    description TEXT,
    amount REAL,
    category TEXT,
    type TEXT,
    nature TEXT,
    branchId TEXT,
    createdBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    name TEXT,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT
  );

  -- Insert default admin if no users exist
  INSERT OR IGNORE INTO users (id, email, name, role, isActive) 
  VALUES ('admin-1', 'admin@pphq.org', 'Super Admin', 'Admin', 1);
`);

async function startServer() {
  const app = express();
  const PORT = 4000;

  app.use(cors());
  app.use(express.json());

  // API Route - Handling actions from AppContext
  app.post("/api/action", (req, res) => {
    const { action, payload } = req.body;
    
    try {
      if (action === "getAllData") {
        const users = db.prepare("SELECT * FROM users").all();
        const branches = db.prepare("SELECT * FROM branches").all();
        const categories = db.prepare("SELECT * FROM categories").all();
        const allTransactions = db.prepare("SELECT * FROM transactions").all();
        return res.json({ status: "success", data: { users, branches, categories, allTransactions } });
      }

      if (action === "login") {
        const { email } = payload;
        const user = db.prepare("SELECT * FROM users WHERE email = ? AND isActive = 1").get(email);
        if (user) {
          return res.json({ status: "success", data: { user } });
        } else {
          return res.json({ status: "error", message: "User tidak ditemukan atau tidak aktif." });
        }
      }

      if (action === "addTransaction") {
        const { transaction } = payload;
        const id = Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO transactions (id, date, description, amount, category, type, nature, branchId, createdBy)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, transaction.date, transaction.description, transaction.amount, transaction.category, transaction.type, transaction.nature, transaction.branchId, transaction.createdBy);
        
        const newTransaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
        return res.json({ status: "success", data: { newTransaction } });
      }

      // Default implementation for other actions to prevent crashes
      return res.json({ status: "success", data: {} });
    } catch (err: any) {
      console.error(err);
      return res.json({ status: "error", message: err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
