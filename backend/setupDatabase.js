const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "mydatabase.db");

// Öffne die Datenbank im READWRITE-Modus und erstelle sie, falls sie nicht existiert:
const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Fehler beim Öffnen der Datenbank:", err.message);
    } else {
      console.log("Datenbank erfolgreich geöffnet/erstellt.");
    }
  }
);

// Tabellen erstellen (verwende IF NOT EXISTS, damit keine Fehler auftreten, wenn die Tabelle schon da ist)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      address TEXT,
      contact TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      price INTEGER,
      currency TEXT,
      customerId TEXT,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (customerId) REFERENCES customers(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      offerId TEXT,
      text TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (offerId) REFERENCES offers(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS textdata (
      id TEXT PRIMARY KEY,
      originalName TEXT,
      storedName TEXT,
      tag TEXT,
      url TEXT,
      offerId TEXT,
      uploadedAt TEXT,
      FOREIGN KEY (offerId) REFERENCES offers(id)
    )
  `);

  console.log("Tabellen wurden (sofern nicht vorhanden) erstellt.");
});

// Schließe die Datenbank, wenn alle Befehle ausgeführt wurden
db.close((err) => {
  if (err) {
    console.error("Fehler beim Schließen der Datenbank:", err.message);
  } else {
    console.log("Datenbankverbindung geschlossen.");
  }
});
