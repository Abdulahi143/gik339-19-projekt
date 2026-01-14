/* PROJEKT GRUPP 19
   Backend-ansvariga: Abdulahi, Said, Ömer
*/

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// --- KOD SKRIVEN AV ABDULAHI (Server Setup) ---
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- KOD SKRIVEN AV SAID (Databas) ---
const db = new sqlite3.Database('./films.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Ansluten till SQLite-databasen (Said).');
});

// Fixat: Lade till kommatecken efter image TEXT
db.run(`CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    director TEXT,
    year INTEGER,
    genre TEXT,
    image TEXT,
    description TEXT
)`);

/* --- API ENDPOINTS (REST) --- */

// --- KOD SKRIVEN AV ÖMER (API Routes) ---

// 1. Hämta alla
app.get('/films', (req, res) => {
    db.all("SELECT * FROM films", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Hämta EN (Detaljvy)
app.get('/films/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM films WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Filmen hittades inte" });
        res.json(row);
    });
});

// 3. Skapa (POST) - Fixat: Lagt till description i SQL och params
app.post('/films', (req, res) => {
    const { title, director, year, genre, image, description } = req.body;

    if (!title || !director) {
        return res.status(400).json({ error: "Titel och regissör är obligatoriska." });
    }
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1888 || year > currentYear + 5) {
        return res.status(400).json({ error: "Ogiltigt årtal." });
    }

    const sql = "INSERT INTO films (title, director, year, genre, image, description) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [title, director, year, genre, image, description];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Film skapad", id: this.lastID });
    });
});

// 4. Uppdatera (PUT) - Fixat: Lagt till description i SQL och params
app.put('/films', (req, res) => {
    const { id, title, director, year, genre, image, description } = req.body;
    
    const sql = "UPDATE films SET title = ?, director = ?, year = ?, genre = ?, image = ?, description = ? WHERE id = ?";
    const params = [title, director, year, genre, image, description, id];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Film uppdaterad", changes: this.changes });
    });
});

// 5. Ta bort (DELETE)
app.delete('/films/:id', (req, res) => {
    db.run("DELETE FROM films WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Film borttagen", changes: this.changes });
    });
});

// --- KOD SKRIVEN AV ABDULAHI (Start) ---
app.listen(port, () => {
    console.log(`Servern körs på http://localhost:${port} (Abdulahi)`);
});