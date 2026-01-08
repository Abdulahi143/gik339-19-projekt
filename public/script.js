// Variabel för att hålla koll på om vi redigerar eller skapar nytt
let isEditing = false;

// Körs när sidan laddas
document.addEventListener('DOMContentLoaded', () => {
    fetchFilms(); // Hämta lista

    // Lyssna på formulärets submit
    document.getElementById('film-form').addEventListener('submit', handleFormSubmit);

    // Lyssna på avbryt-knappen
    document.getElementById('cancel-btn').addEventListener('click', resetForm);
});

// Hämta alla filmer (GET)
function fetchFilms() {
    fetch('/films')
        .then(response => response.json())
        .then(data => renderList(data))
        .catch(error => console.error('Error:', error));
}

// Rendera listan (Krav: Lista och dynamiskt skapande av HTML)
function renderList(films) {
    const listContainer = document.getElementById('film-list');
    listContainer.innerHTML = ''; // Töm listan först

    films.forEach(film => {
        // VISUELLT KRAV: Genre bestämmer färg på kanten (border)
        let borderColor = 'border-gray-200';
        if (film.genre === 'Action') borderColor = 'border-red-500';
        else if (film.genre === 'Drama') borderColor = 'border-blue-500';
        else if (film.genre === 'Komedi') borderColor = 'border-yellow-400';
        else if (film.genre === 'Skräck') borderColor = 'border-black';
        else if (film.genre === 'Sci-Fi') borderColor = 'border-purple-500';

        // Skapa HTML för ett kort (Card)
        const card = document.createElement('div');
        card.className = `bg-white p-4 rounded shadow border-l-8 ${borderColor} flex flex-col justify-between`;

        card.innerHTML = `
            <div>
                <h3 class="text-xl font-bold">${film.title}</h3>
                <p class="text-gray-600">Regissör: ${film.director}</p>
                <p class="text-gray-600">År: ${film.year}</p>
                <span class="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-gray-200 rounded">${film.genre}</span>
            </div>
            <div class="mt-4 flex gap-2 justify-end">
                <button onclick="prepareEdit(${film.id}, '${film.title}', '${film.director}', ${film.year}, '${film.genre}')" 
                        class="text-blue-600 hover:text-blue-800 font-bold">Ändra</button>
                <button onclick="deleteFilm(${film.id})" 
                        class="text-red-600 hover:text-red-800 font-bold ml-2">Ta bort</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// Hantera Formulär (POST och PUT)
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('film-id').value;
    const title = document.getElementById('title').value;
    const director = document.getElementById('director').value;
    const year = document.getElementById('year').value;
    const genre = document.getElementById('genre').value;

    const filmData = { title, director, year, genre };

    if (isEditing) {
        // UPPDATERA (PUT) - Skickar med ID i bodyn
        fetch('/films', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...filmData, id: id })
        })
            .then(response => {
                if (response.ok) {
                    showModal('Uppdaterad!', 'Filmen har uppdaterats.');
                    resetForm();
                    fetchFilms();
                }
            });
    } else {
        // SKAPA NY (POST)
        fetch('/films', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filmData)
        })
            .then(response => {
                if (response.ok) {
                    showModal('Sparad!', 'Ny film har lagts till.');
                    resetForm();
                    fetchFilms();
                }
            });
    }
}

// Ta bort film (DELETE)
function deleteFilm(id) {
    if (!confirm('Är du säker på att du vill ta bort denna film?')) return;

    fetch(`/films/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                showModal('Borttagen!', 'Filmen raderades ur databasen.');
                fetchFilms();
                // Om vi råkar redigera den vi tog bort, rensa formuläret
                if (document.getElementById('film-id').value == id) {
                    resetForm();
                }
            }
        });
}

// Förbered redigering (Fyll formuläret utan att anropa API)
window.prepareEdit = function (id, title, director, year, genre) {
    document.getElementById('film-id').value = id;
    document.getElementById('title').value = title;
    document.getElementById('director').value = director;
    document.getElementById('year').value = year;
    document.getElementById('genre').value = genre;

    // Ändra UI till "Edit mode"
    isEditing = true;
    document.getElementById('form-title').innerText = "Redigera Film";
    document.getElementById('cancel-btn').classList.remove('hidden');

    // Scrolla upp till formuläret
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Återställ formulär
function resetForm() {
    document.getElementById('film-form').reset();
    document.getElementById('film-id').value = '';
    isEditing = false;
    document.getElementById('form-title').innerText = "Lägg till ny film";
    document.getElementById('cancel-btn').classList.add('hidden');
}

// Modal funktioner (Feedback)
function showModal(title, message) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('feedback-modal').classList.remove('hidden');
}

window.closeModal = function () {
    document.getElementById('feedback-modal').classList.add('hidden');
}