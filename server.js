const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Databas-setup
const db = new sqlite3.Database('./films.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Ansluten till SQLite-databasen.');
});

db.run(`CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    director TEXT,
    year INTEGER,
    genre TEXT,
    image TEXT
)`);

/* --- API ENDPOINTS --- */
app.get('/films', (req, res) => {
    db.all("SELECT * FROM films", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/films', (req, res) => {
    const { title, director, year, genre, image } = req.body;
    db.run("INSERT INTO films (title, director, year, genre, image) VALUES (?, ?, ?, ?, ?)", 
    [title, director, year, genre, image], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Film skapad", id: this.lastID });
    });
});

app.put('/films', (req, res) => {
    const { id, title, director, year, genre, image } = req.body;
    db.run("UPDATE films SET title = ?, director = ?, year = ?, genre = ?, image = ? WHERE id = ?", 
    [title, director, year, genre, image, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Film uppdaterad", changes: this.changes });
    });
});

app.delete('/films/:id', (req, res) => {
    db.run("DELETE FROM films WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Film borttagen", changes: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Servern körs på http://localhost:${port}`);
});