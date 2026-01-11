let allFilms = []; 
let isEditing = false;

const genreColors = {
    'Action': 'border-red-500',
    'Drama': 'border-blue-500',
    'Komedi': 'border-yellow-400',
    'Skräck': 'border-black',
    'Sci-Fi': 'border-purple-500',
    'Thriller': 'border-gray-600',
    'default': 'border-gray-300'
};

document.addEventListener('DOMContentLoaded', () => {
    fetchFilms();

    document.getElementById('film-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('search-input').addEventListener('input', handleFilter);
    document.getElementById('filter-genre').addEventListener('change', handleFilter);
});

function fetchFilms() {
    fetch('/films')
        .then(response => response.json())
        .then(data => {
            allFilms = data; 
            renderList(allFilms);
        })
        .catch(error => console.error('Error:', error));
}

function apiCall(url, method, data = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    
    return fetch(url, options).then(res => {
        if (!res.ok) throw new Error('API Error');
        return res;
    });
}

/* --- UI COMPONENTS & RENDERING --- */
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
        const borderColor = genreColors[film.genre] || genreColors['default'];
        const imageUrl = film.image || 'https://placehold.co/600x400?text=Ingen+Bild';

        const card = document.createElement('div');
        card.className = `group relative h-[400px] w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer`;
        card.innerHTML = `
        <img src="${imageUrl}" alt="${film.title}" 
             class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
             onerror="this.src='https://placehold.co/600x900?text=Bild+saknas'">
    
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
    
        <div class="absolute top-4 right-4">
            <span class="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600/90 backdrop-blur-sm rounded-full shadow-sm">
                ${film.genre}
            </span>
        </div>
    
        <div class="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <p class="text-sm text-gray-300 font-medium mb-1">${film.year} • ${film.director}</p>
            <h3 class="text-2xl font-bold leading-tight mb-4 text-shadow">${film.title}</h3>
            
            <div class="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                <button onclick="prepareEdit(${film.id})" class="flex-1 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white py-2 rounded-lg font-semibold transition text-sm">
                    <i class="fa-solid fa-pen"></i> Redigera
                </button>
                <button onclick="deleteFilm(${film.id})" class="flex-1 bg-red-600/80 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition text-sm">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    listContainer.appendChild(card);
    });
}

/* --- FILTER & SEARCH LOGIC --- */
function handleFilter() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const genreFilter = document.getElementById('filter-genre').value;

    const filteredFilms = allFilms.filter(film => {
        const matchesSearch = film.title.toLowerCase().includes(searchQuery) || 
                              film.director.toLowerCase().includes(searchQuery);
        const matchesGenre = genreFilter === 'All' || film.genre === genreFilter;

        return matchesSearch && matchesGenre;
    });

    renderList(filteredFilms);
}

/* --- FORM HANDLING --- */
function toggleForm() {
    const formContainer = document.getElementById('form-container');
    formContainer.classList.toggle('hidden');
    if (!formContainer.classList.contains('hidden')) {
        document.getElementById('title').focus();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const filmData = {
        title: document.getElementById('title').value,
        director: document.getElementById('director').value,
        year: document.getElementById('year').value,
        genre: document.getElementById('genre').value,
        image: document.getElementById('image').value
    };
    
    const id = document.getElementById('film-id').value;

    if (isEditing) {
        apiCall('/films', 'PUT', { ...filmData, id })
            .then(() => {
                showModal('Uppdaterad!', 'Filmen har sparats.');
                finishFormAction();
            });
    } else {
        apiCall('/films', 'POST', filmData)
            .then(() => {
                showModal('Sparad!', 'Ny film lades till i biblioteket.');
                finishFormAction();
            });
    }
}

function finishFormAction() {
    resetForm();
    toggleForm(); 
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

    isEditing = true;
    document.getElementById('form-title').innerText = "Redigera Film";
    
    const formContainer = document.getElementById('form-container');
    formContainer.classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteFilm(id) {
    if (!confirm('Är du säker på att du vill ta bort denna film?')) return;

    apiCall(`/films/${id}`, 'DELETE')
        .then(() => {
            showModal('Borttagen!', 'Filmen är borta.');
            fetchFilms();
        });
}

function showModal(title, message) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('feedback-modal').classList.remove('hidden');
}

window.closeModal = function () {
    document.getElementById('feedback-modal').classList.add('hidden');
}