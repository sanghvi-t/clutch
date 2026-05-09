import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "clutch",
  });

  try {
    const sqlFile = path.join(__dirname, "../drizzle/0004_noisy_nebula.sql");
    const sql = fs.readFileSync(sqlFile, "utf-8");

    // Split by statement-breakpoint and execute each
    const statements = sql.split("--> statement-breakpoint").filter((s) => s.trim());

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        console.log(`Executing: ${trimmed.substring(0, 60)}...`);
        try {
          await connection.execute(trimmed);
          console.log("✓ Success");
        } catch (err) {
          // Ignore "already exists" errors
          if (err.message.includes("already exists")) {
            console.log("✓ Already exists (skipped)");
          } else {
            throw err;
          }
        }
      }
    }

    console.log("\n✓ Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
