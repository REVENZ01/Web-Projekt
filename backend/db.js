const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "mydatabase.db");

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Fehler beim Verbinden mit der Datenbank:", err.message);
    } else {
      console.log("Mit der SQLite-Datenbank verbunden.");
    }
  }
);

module.exports = db;

