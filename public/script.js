/* PROJEKT GRUPP 19 - Frontend Logic */

let allFilms = [];
let isEditing = false;

// --- KOD SKRIVEN AV NOOR (Initialization) ---
document.addEventListener('DOMContentLoaded', () => {
    fetchFilms();
    document.getElementById('film-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('search-input').addEventListener('input', handleFilter);
    document.getElementById('filter-genre').addEventListener('change', handleFilter);
    document.getElementById('sort-year').addEventListener('change', handleFilter);
});

// --- KOD SKRIVEN AV NOOR (API Fetch) ---
function fetchFilms() {
    fetch('/films')
        .then(response => response.json())
        .then(data => {
            allFilms = data;
            handleFilter();
        })
        .catch(err => console.error("Kunde inte hämta filmer:", err));
}

// --- KOD SKRIVEN AV NOOR (Rendering) ---
function renderList(films) {
    const listContainer = document.getElementById('film-list');
    const emptyState = document.getElementById('empty-state');
    listContainer.innerHTML = '';

    if (films.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    films.forEach(film => {
        const genreBgColors = {
            'Action': 'bg-red-600', 'Drama': 'bg-blue-600',
            'Komedi': 'bg-yellow-500', 'Skräck': 'bg-stone-900',
            'Sci-Fi': 'bg-purple-600', 'Thriller': 'bg-emerald-700',
            'default': 'bg-indigo-600'
        };
        const badgeColor = genreBgColors[film.genre] || genreBgColors['default'];
        const imageUrl = film.image || 'https://placehold.co/600x900?text=No+Image';
        
        // Hämta beskrivning, eller tom sträng om den saknas
        const descriptionText = film.description || '';

        const card = document.createElement('div');
        card.className = `group relative h-[500px] w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500`;

        card.innerHTML = `
            <img src="${imageUrl}" alt="${film.title}" onclick="showDetails(${film.id})"
                 class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 cursor-pointer">
            
            <div class="absolute top-4 right-4 z-20">
                <span class="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white ${badgeColor} rounded-lg shadow-lg backdrop-blur-md bg-opacity-90">
                    ${film.genre}
                </span>
            </div>

            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90 transition-opacity duration-300 pointer-events-none"></div>

            <div class="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end h-full z-20 pointer-events-none">
                
                <div class="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <p class="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                        ${film.year} • ${film.director}
                    </p>
                    <h3 class="text-2xl font-bold text-white leading-tight drop-shadow-md mb-2">
                        ${film.title}
                    </h3>
                    
                    <p class="text-gray-300 text-sm leading-relaxed line-clamp-2 opacity-90">
                        ${descriptionText}
                    </p>
                </div>

                <div class="flex gap-3 mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 pointer-events-auto">
                    <button onclick="prepareEdit(${film.id})" 
                            class="flex-1 bg-white/20 backdrop-blur-md border border-white/30 text-white py-2.5 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 text-sm flex items-center justify-center gap-2 group/btn">
                        <i class="fa-solid fa-pen text-xs"></i> Redigera
                    </button>
                    <button onclick="deleteFilm(${film.id})" 
                            class="flex-1 bg-red-600/80 backdrop-blur-md border border-red-500/30 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 text-sm flex items-center justify-center gap-2">
                        <i class="fa-solid fa-trash text-xs"></i> Ta bort
                    </button>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// --- KOD SKRIVEN AV ÖMER (Filter) ---
function handleFilter() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const genreFilter = document.getElementById('filter-genre').value;
    const sortValue = document.getElementById('sort-year').value;

    let filteredFilms = allFilms.filter(film => {
        const matchesSearch = film.title.toLowerCase().includes(searchQuery) ||
                              film.director.toLowerCase().includes(searchQuery);
        const matchesGenre = genreFilter === 'All' || film.genre === genreFilter;
        return matchesSearch && matchesGenre;
    });

    if (sortValue === 'newest') filteredFilms.sort((a, b) => b.year - a.year);
    else if (sortValue === 'oldest') filteredFilms.sort((a, b) => a.year - b.year);

    renderList(filteredFilms);
}

// --- KOD SKRIVEN AV ABDULAHI (UI) ---
function toggleForm() {
    const formContainer = document.getElementById('form-container');
    formContainer.classList.toggle('hidden');
    if (!formContainer.classList.contains('hidden')) {
        document.getElementById('title').focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- KOD SKRIVEN AV KAREM (Formulär) ---
async function handleFormSubmit(e) {
    e.preventDefault();
    const filmData = {
        title: document.getElementById('title').value,
        director: document.getElementById('director').value,
        year: document.getElementById('year').value,
        genre: document.getElementById('genre').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value 
    };
    const id = document.getElementById('film-id').value;
    let url = '/films', method = 'POST';

    if (isEditing) { url = '/films'; method = 'PUT'; filmData.id = id; }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filmData)
        });
        const result = await response.json();

        if (!response.ok) showModal('Fel uppstod', result.error || 'Ett fel inträffade', true);
        else {
            showModal(isEditing ? 'Uppdaterad!' : 'Sparad!', 'Filmen har sparats i databasen.');
            finishFormAction();
        }
    } catch (error) { showModal('Nätverksfel', 'Kunde inte nå servern.', true); }
}

function finishFormAction() {
    resetForm();
    if (!document.getElementById('form-container').classList.contains('hidden')) toggleForm();
    fetchFilms();
}

function resetForm() {
    document.getElementById('film-form').reset();
    document.getElementById('film-id').value = '';
    isEditing = false;
    document.getElementById('form-title').innerText = "Lägg till ny film";
}

function prepareEdit(id) {
    const film = allFilms.find(f => f.id === id);
    if (!film) return;
    document.getElementById('film-id').value = film.id;
    document.getElementById('title').value = film.title;
    document.getElementById('director').value = film.director;
    document.getElementById('year').value = film.year;
    document.getElementById('genre').value = film.genre;
    document.getElementById('image').value = film.image;
    document.getElementById('description').value = film.description || '';
    isEditing = true;
    document.getElementById('form-title').innerText = "Redigera Film: " + film.title;
    const formContainer = document.getElementById('form-container');
    if (formContainer.classList.contains('hidden')) formContainer.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteFilm(id) {
    if (!confirm('Är du säker på att du vill ta bort denna film?')) return;
    try {
        const response = await fetch(`/films/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showModal('Borttagen!', 'Filmen raderades ur databasen.');
            fetchFilms();
        } else showModal('Fel', 'Kunde inte ta bort filmen.', true);
    } catch (error) { console.error(error); }
}

// --- KOD SKRIVEN AV SAID (Detaljvy - FIXAD: Ingen redigeraknapp) ---
async function showDetails(id) {
    try {
        const response = await fetch(`/films/${id}`);
        if (!response.ok) throw new Error('Kunde inte hämta film');
        const film = await response.json();

        document.getElementById('detail-title').innerText = film.title;
        document.getElementById('detail-director').innerText = film.director;
        document.getElementById('detail-year').innerText = film.year;
        document.getElementById('detail-genre').innerText = film.genre;
        document.getElementById('detail-image').src = film.image || 'https://placehold.co/600x900?text=Ingen+Bild';
        
        // Hämta beskrivning (eller visa standardtext om den är tom)
        document.getElementById('detail-description').innerText = film.description || 'Ingen beskrivning tillgänglig.';

        document.getElementById('detail-modal').classList.remove('hidden');
    } catch (error) { showModal('Fel', 'Kunde inte ladda detaljer.', true); }
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
}

function showModal(title, message, isError = false) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    const iconContainer = document.getElementById('modal-icon');
    iconContainer.innerHTML = isError ? 
        '<i class="fa-solid fa-circle-exclamation text-5xl text-red-500"></i>' : 
        '<i class="fa-solid fa-circle-check text-5xl text-green-500"></i>';
    document.getElementById('feedback-modal').classList.remove('hidden');
}

window.closeModal = function () {
    document.getElementById('feedback-modal').classList.add('hidden');
}