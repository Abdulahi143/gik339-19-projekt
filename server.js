const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servar frontend-filer

// Databas-setup (Skapar filen films.db automatiskt)
const db = new sqlite3.Database('./films.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Ansluten till SQLite-databasen.');
});

// Skapa tabellen om den inte finns
db.run(`CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    director TEXT,
    year INTEGER,
    genre TEXT
)`);

/* --- API ENDPOINTS (RESTFul) --- */

// 1. Hämta alla filmer (GET /films)
app.get('/films', (req, res) => {
    const sql = "SELECT * FROM films";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 2. Skapa en film (POST /films)
app.post('/films', (req, res) => {
    const { title, director, year, genre } = req.body;
    const sql = "INSERT INTO films (title, director, year, genre) VALUES (?, ?, ?, ?)";
    const params = [title, director, year, genre];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Film skapad", id: this.lastID });
    });
});

// 3. Uppdatera en film (PUT /films) - Notera: Kravet sa PUT /resurs, men ofta används /resurs/:id.
// Vi skickar ID i bodyn enligt kravspecen för PUT.
app.put('/films', (req, res) => {
    const { id, title, director, year, genre } = req.body;
    const sql = "UPDATE films SET title = ?, director = ?, year = ?, genre = ? WHERE id = ?";
    const params = [title, director, year, genre, id];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Film uppdaterad", changes: this.changes });
    });
});

// 4. Ta bort en film (DELETE /films/:id)
app.delete('/films/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM films WHERE id = ?";

    db.run(sql, id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Film borttagen", changes: this.changes });
    });
});

// Starta servern
app.listen(port, () => {
    console.log(`Servern körs på http://localhost:${port}`);
});