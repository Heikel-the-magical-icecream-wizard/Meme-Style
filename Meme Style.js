// --- Estado Global ---
let allMemes = [];
let displayedMemes = [];
let favorites = JSON.parse(localStorage.getItem('memeFavorites')) || [];
let currentView = 'home'; // 'home' or 'favs'
let currentLanguage = localStorage.getItem('appLanguage') || 'es'; // 'es' o 'en'
let lastDisplayedIds = new Set();

// --- Elementos del DOM ---
const memeGrid = document.getElementById('meme-grid');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search');
const resultsCount = document.getElementById('results-count');
const sectionTitle = document.getElementById('section-title');
const navHome = document.getElementById('nav-home');
const navFavs = document.getElementById('nav-favs');
const navEdit = document.getElementById('nav-edit');
const navTranslate = document.getElementById('nav-translate');
const refreshMemesBtn = document.getElementById('refresh-memes');
const editorSection = document.getElementById('editor-section');
const editCanvas = document.getElementById('edit-canvas');
const editTopTextInput = document.getElementById('edit-top-text');
const editBottomTextInput = document.getElementById('edit-bottom-text');
const translateBtnEditor = document.getElementById('translate-text');
const translationOutput = document.getElementById('translation-output');
const editDownloadBtn = document.getElementById('download-edited');
const editorResetBtn = document.getElementById('editor-reset');
let searchDebounceTimeout;
let selectedEditMeme = null;

const RELATED_TERMS = {
    amor: ['love', 'corazon', 'romance', 'crush'],
    risa: ['laugh', 'risas', 'gracioso', 'funny', 'humor', 'jokes'],
    meme: ['meme', 'internet', 'viral', 'trending', 'trending'],
    feliz: ['happy', 'alegre', 'joy', 'smile', 'happiness'],
    triste: ['sad', 'tristeza', 'depression', 'cry', 'tears'],
    perro: ['dog', 'perro', 'canino', 'puppy', 'doggo', 'woof'],
    gato: ['cat', 'gato', 'felino', 'kitten', 'kitty', 'meow'],
    dinero: ['money', 'dinero', 'cash', 'rich', 'wealth', 'coins'],
    trabajo: ['work', 'empleo', 'job', 'office', 'boss', 'employee'],
    when: ['cuando', 'when', 'be like', 'mood'],
    owo: ['cute', 'adorable', 'sweet', 'lovely', 'precious'],
    guerra: ['war', 'conflict', 'battle', 'fight', 'fight'],
    escuela: ['school', 'colegio', 'education', 'student', 'learning'],
    madre: ['mom', 'mamá', 'mother', 'mom joke'],
    padre: ['dad', 'papá', 'father', 'dad joke'],
    panic: ['panic', 'scared', 'fear', 'terrified'],
    drake: ['drake', 'approval', 'disapproval'],
    distracted: ['distracted', 'boyfriend', 'distraction'],
    success: ['success', 'victory', 'winner', 'achievement'],
    failure: ['fail', 'failure', 'disaster', 'oops'],
    confused: ['confused', 'confusion', 'what', 'huh'],
    angry: ['angry', 'rage', 'furious', 'mad', 'angry'],
    cool: ['cool', 'awesome', 'amazing', 'cool', 'awesome'],
    stupid: ['stupid', 'dumb', 'silly', 'derp'],
    smart: ['smart', 'genius', 'intelligent', 'iq'],
    lazy: ['lazy', 'tired', 'sleep', 'nap'],
    workout: ['workout', 'gym', 'exercise', 'fitness'],
    gaming: ['gaming', 'gamer', 'video', 'game', 'console'],
    food: ['food', 'eating', 'snack', 'pizza', 'burger'],
    anime: ['anime', 'manga', 'japan', 'otaku'],
    movie: ['movie', 'cinema', 'film', 'actor'],
    music: ['music', 'song', 'concert', 'musician'],
    sport: ['sport', 'soccer', 'football', 'basketball'],
    animal: ['animal', 'wildlife', 'nature', 'creature'],
    technology: ['technology', 'tech', 'computer', 'phone', 'gadget'],
    moda: ['fashion', 'moda', 'style', 'clothes', 'dress'],
    travel: ['travel', 'journey', 'vacation', 'adventure'],
    weather: ['weather', 'rain', 'sunny', 'cold', 'hot'],
    family: ['family', 'relatives', 'siblings', 'brother', 'sister'],
    friend: ['friend', 'friendship', 'buddy', 'pal'],
    love: ['love', 'lover', 'romantic', 'couple'],
    jealous: ['jealous', 'envy', 'envious'],
    pissed: ['pissed', 'annoyed', 'irritated', 'angry'],
    excited: ['excited', 'hype', 'thrilled', 'enthusiastic'],
    awkward: ['awkward', 'cringe', 'embarrassing'],
    relatable: ['relatable', 'true', 'real', 'facts'],
};

const TRANSLATION_DICTIONARY = {
    amor: 'love',
    risa: 'laugh',
    feliz: 'happy',
    triste: 'sad',
    gato: 'cat',
    perro: 'dog',
    dinero: 'money',
    trabajo: 'work',
    escuela: 'school',
    madre: 'mother',
    padre: 'father',
    meme: 'meme',
    internet: 'internet',
};

const UI_TRANSLATIONS = {
    es: {
        'nav-home': 'Tendencias',
        'nav-favs': 'Favoritos',
        'nav-edit': 'Editar meme',
        'nav-translate': 'Translate',
        'search-placeholder': 'Buscar memes...',
        'trending-title': 'Tendencias',
        'no-results': 'No se encontraron memes',
        'try-keywords': 'Intenta con otras palabras clave.',
        'refresh-btn': 'Refrescar',
        'edit-title': 'Editar meme',
        'select-meme': 'Selecciona un meme favorito y agrega un texto personalizado para descargarlo.',
        'reset-btn': 'Limpiar',
        'selected-meme': 'Meme favorito seleccionado',
        'top-text': 'Texto superior',
        'bottom-text': 'Texto inferior',
        'translate-btn': 'Translate',
        'download-btn': 'Descargar meme editado',
        'results-count': 'resultados',
    },
    en: {
        'nav-home': 'Trending',
        'nav-favs': 'Favorites',
        'nav-edit': 'Edit Meme',
        'nav-translate': 'Translate',
        'search-placeholder': 'Search memes...',
        'trending-title': 'Trending',
        'no-results': 'No memes found',
        'try-keywords': 'Try other keywords.',
        'refresh-btn': 'Refresh',
        'edit-title': 'Edit Meme',
        'select-meme': 'Select a favorite meme and add custom text to download it.',
        'reset-btn': 'Clear',
        'selected-meme': 'Selected meme',
        'top-text': 'Top Text',
        'bottom-text': 'Bottom Text',
        'translate-btn': 'Translate',
        'download-btn': 'Download Edited Meme',
        'results-count': 'results',
    }
};

function setUILanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    
    // Update button texts
    document.getElementById('nav-home').textContent = UI_TRANSLATIONS[lang]['nav-home'];
    document.getElementById('nav-favs').textContent = UI_TRANSLATIONS[lang]['nav-favs'];
    document.getElementById('nav-edit').textContent = UI_TRANSLATIONS[lang]['nav-edit'];
    document.getElementById('nav-translate').textContent = UI_TRANSLATIONS[lang]['nav-translate'];
    
    // Update search placeholder
    searchInput.placeholder = UI_TRANSLATIONS[lang]['search-placeholder'];
    
    // Update labels and buttons - will update when views change
    updateCurrentViewUI();
}

function updateCurrentViewUI() {
    const lang = currentLanguage;
    
    if (currentView === 'home') {
        sectionTitle.textContent = UI_TRANSLATIONS[lang]['trending-title'];
    } else if (currentView === 'favs') {
        sectionTitle.textContent = UI_TRANSLATIONS[lang]['nav-favs'];
    } else if (currentView === 'edit') {
        document.querySelector('.editor-header h2').textContent = UI_TRANSLATIONS[lang]['edit-title'];
        document.querySelector('.editor-header p').textContent = UI_TRANSLATIONS[lang]['select-meme'];
        document.getElementById('editor-reset').textContent = UI_TRANSLATIONS[lang]['reset-btn'];
    }
    
    // Update text input labels
    const topLabel = document.querySelector('.text-input-group:first-child label');
    const bottomLabel = document.querySelector('.text-input-group:last-child label');
    if (topLabel) topLabel.textContent = UI_TRANSLATIONS[lang]['top-text'];
    if (bottomLabel) bottomLabel.textContent = UI_TRANSLATIONS[lang]['bottom-text'];
    
    // Update button texts
    if (document.getElementById('translate-text')) {
        document.getElementById('translate-text').textContent = UI_TRANSLATIONS[lang]['translate-btn'];
    }
    if (document.getElementById('download-edited')) {
        document.getElementById('download-edited').textContent = UI_TRANSLATIONS[lang]['download-btn'];
    }
    if (document.getElementById('editor-reset')) {
        document.getElementById('editor-reset').textContent = UI_TRANSLATIONS[lang]['reset-btn'];
    }
    if (document.getElementById('refresh-memes')) {
        document.getElementById('refresh-memes').textContent = UI_TRANSLATIONS[lang]['refresh-btn'];
    }
}

function debounce(fn, delay) {
    return (...args) => {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => fn(...args), delay);
    };
}

function normalizeSearchText(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function expandSearchTerms(queryTokens) {
    const terms = new Set();
    queryTokens.forEach(token => {
        terms.add(token);
        const related = RELATED_TERMS[token];
        if (related) {
            related.forEach(relatedTerm => terms.add(relatedTerm));
        }
    });
    return [...terms];
}

function findRelatedTermsByValue(searchTerm) {
    // Reverse lookup: find all keys that have this term as a value
    const foundTerms = new Set();
    Object.keys(RELATED_TERMS).forEach(key => {
        const values = RELATED_TERMS[key];
        if (values && values.some(val => normalizeSearchText(val) === normalizeSearchText(searchTerm))) {
            foundTerms.add(key);
            // Add all related terms for this key
            values.forEach(val => foundTerms.add(normalizeSearchText(val)));
        }
    });
    return foundTerms;
}

function shuffleArray(array) {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
}

function chooseFreshMemes(count = 20) {
    const available = allMemes.filter(meme => !lastDisplayedIds.has(meme.id));
    const pool = available.length >= count ? available : allMemes;
    const selected = shuffleArray(pool).slice(0, count);
    return selected;
}

function translateEditorText() {
    const topText = editTopTextInput.value.trim();
    const bottomText = editBottomTextInput.value.trim();
    const text = [topText, bottomText].filter(Boolean).join(' ');

    if (!text) {
        translationOutput.textContent = '';
        translationOutput.classList.add('hidden');
        return;
    }

    const normalized = normalizeSearchText(text);
    const words = normalized.split(/[^\p{L}0-9]+/u).filter(Boolean);
    const translated = words.map(word => TRANSLATION_DICTIONARY[word] || word).join(' ');
    translationOutput.textContent = translated || 'No se encontró traducción automática';
    translationOutput.classList.remove('hidden');
}

function handleNavTranslate() {
    // Toggle between Spanish and English
    const newLang = currentLanguage === 'es' ? 'en' : 'es';
    setUILanguage(newLang);
}

function hideTranslationOutput() {
    translationOutput.classList.add('hidden');
    translationOutput.textContent = '';
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    setUILanguage(currentLanguage);
    fetchMemes();
    setupEventListeners();
});

// --- API ---
async function fetchMemes() {
    try {
        showLoader();
        // Usamos la API pública de Imgflip para obtener memes populares
        const response = await fetch('https://api.imgflip.com/get_memes');
        const data = await response.json();

        if (data.success) {
            allMemes = data.data.memes.map(meme => {
                const normalizedName = normalizeSearchText(meme.name || '');
                const tokens = normalizedName
                    .split(/[^\p{L}0-9]+/u)
                    .filter(Boolean);
                const terms = expandSearchTerms(tokens);
                const searchText = [normalizedName, ...terms].join(' ');

                return {
                    ...meme,
                    searchName: normalizedName,
                    searchText,
                };
            });
            displayedMemes = [...allMemes];
            renderMemes();
            refreshMemesBtn.classList.remove('hidden');
        } else {
            throw new Error('Error al obtener memes');
        }
    } catch (error) {
        console.error('Error:', error);
        resultsCount.textContent = 'Error al cargar los algoritmos.';
        hideLoader();
    }
}

async function refreshMemes() {
    try {
        showLoader();
        const response = await fetch('https://api.imgflip.com/get_memes');
        const data = await response.json();

        if (data.success) {
            allMemes = data.data.memes.map(meme => {
                const normalizedName = normalizeSearchText(meme.name || '');
                const tokens = normalizedName
                    .split(/[^\p{L}0-9]+/u)
                    .filter(Boolean);
                const terms = expandSearchTerms(tokens);
                const searchText = [normalizedName, ...terms].join(' ');

                return {
                    ...meme,
                    searchName: normalizedName,
                    searchText,
                };
            });

            const freshSelection = chooseFreshMemes(24);
            displayedMemes = freshSelection;
            renderMemes();
        }
    } catch (error) {
        console.error('Error al refrescar:', error);
        hideLoader();
    }
}

// --- Renderizado ---
function renderMemes() {
    hideLoader();
    memeGrid.innerHTML = '';

    if (displayedMemes.length === 0) {
        memeGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        resultsCount.textContent = currentLanguage === 'es' ? '0 resultados' : '0 results';
        return;
    }

    memeGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    const countText = displayedMemes.length === 1
        ? currentLanguage === 'es' ? '1 meme encontrado' : '1 meme found'
        : currentLanguage === 'es'
            ? `${displayedMemes.length} memes encontrados`
            : `${displayedMemes.length} memes found`;
    resultsCount.textContent = countText;

    const adPositions = [4, 8, 12, 16];

    displayedMemes.forEach((meme, index) => {
        const isFav = favorites.some(f => f.id === meme.id);
        const canEdit = currentView !== 'home';

        const card = document.createElement('div');
        card.className = 'meme-card animate-fade-in';
        card.style.animationDelay = `${(index % 10) * 0.05}s`;

        card.innerHTML = `
            <div class="meme-image-container">
                <img src="${meme.url}" alt="${meme.name}" class="meme-image" loading="lazy">
            </div>
            <div class="meme-info">
                <div class="meme-title-wrap">
                    <h3 class="meme-title" title="${meme.name}">${meme.name}</h3>
                </div>
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${meme.id}" aria-label="Favorito">
                    <i class="${isFav ? 'ph-fill' : 'ph'} ph-heart"></i>
                </button>
            </div>
            <div class="card-actions">
                <button class="download-btn" data-id="${meme.id}" aria-label="Descargar meme">
                    <i class="ph ph-download"></i> ${currentLanguage === 'es' ? 'Descargar' : 'Download'}
                </button>
                ${canEdit ? `<button class="edit-btn" data-id="${meme.id}" aria-label="Editar meme favorito"><i class="ph ph-pencil"></i> ${currentLanguage === 'es' ? 'Editar' : 'Edit'}</button>` : ''}
            </div>
        `;

        const favBtn = card.querySelector('.fav-btn');
        favBtn.addEventListener('click', () => toggleFavorite(meme, favBtn));

        const downloadBtn = card.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => downloadImage(meme.url, `${meme.name}.png`));

        if (canEdit) {
            const editBtn = card.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => openEditorForMeme(meme));
        }

        memeGrid.appendChild(card);

        if (adPositions.includes(index + 1)) {
            const adCard = document.createElement('div');
            adCard.className = 'ad-card animate-fade-in';
            adCard.innerHTML = `
                <div class="ad-label">Ad</div>
                <div class="ad-content">
                    <h3>Discover more memes</h3>
                    <p>Sponsored content designed to help you find the best meme trends.</p>
                </div>
            `;
            memeGrid.appendChild(adCard);
        }
    });

    lastDisplayedIds = new Set(displayedMemes.map(m => m.id));
}

async function loadImageForCanvas(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    const image = new Image();
    image.src = objectURL;
    image.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
        image.onload = () => {
            URL.revokeObjectURL(objectURL);
            resolve(image);
        };
        image.onerror = () => reject(new Error('No se pudo cargar la imagen del meme'));
    });
}

async function renderEditor() {
    const context = editCanvas.getContext('2d');
    const width = editCanvas.width;
    const height = editCanvas.height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#111';
    context.fillRect(0, 0, width, height);

    if (!selectedEditMeme) {
        context.fillStyle = '#ffffff';
        context.font = '600 20px Outfit, sans-serif';
        context.fillText('Selecciona un meme favorito para editar', 24, 48);
        context.fillStyle = 'rgba(255,255,255,0.65)';
        context.font = '16px Roboto, sans-serif';
        context.fillText('Aparecerá aquí tu meme con el texto personalizado.', 24, 84);
        editDownloadBtn.disabled = true;
        return;
    }

    try {
        const image = await loadImageForCanvas(selectedEditMeme.url);
        const scale = Math.min(width / image.width, height / image.height);
        const imageWidth = image.width * scale;
        const imageHeight = image.height * scale;
        const offsetX = (width - imageWidth) / 2;
        const offsetY = (height - imageHeight) / 2;

        context.drawImage(image, offsetX, offsetY, imageWidth, imageHeight);

        const topText = editTopTextInput.value.trim();
        const bottomText = editBottomTextInput.value.trim();
        const hasText = topText || bottomText;

        translateBtn.disabled = !hasText;

        if (hasText) {
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = '700 32px Outfit, sans-serif';
            context.fillStyle = 'rgba(0, 0, 0, 0.75)';
            context.strokeStyle = '#000';
            context.lineWidth = 8;

            if (topText) {
                context.strokeText(topText, width / 2, 48);
                context.fillStyle = '#ffffff';
                context.fillText(topText, width / 2, 48);
            }

            if (bottomText) {
                context.strokeText(bottomText, width / 2, height - 48);
                context.fillStyle = '#ffffff';
                context.fillText(bottomText, width / 2, height - 48);
            }

            editDownloadBtn.disabled = false;
        } else {
            editDownloadBtn.disabled = true;
        }
    } catch (error) {
        console.error(error);
        context.fillStyle = '#ffffff';
        context.font = '600 20px Outfit, sans-serif';
        context.fillText('No se pudo cargar el meme para edición', 24, 48);
        editDownloadBtn.disabled = true;
    }
}

function openEditorForMeme(meme) {
    selectedEditMeme = meme;
    currentView = 'edit';
    navHome.classList.remove('active');
    navFavs.classList.remove('active');
    navEdit.classList.add('active');
    sectionTitle.textContent = 'Editar meme';
    displayedMemes = [...favorites];
    renderMemes();
    showEditorSection();
    renderEditor();
}

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectURL;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectURL);
    } catch (error) {
        console.error('Error al descargar:', error);
        window.open(url, '_blank');
    }
}

function downloadEditedMeme() {
    if (!selectedEditMeme) return;
    editCanvas.toBlob(blob => {
        if (!blob) return;
        const objectURL = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectURL;
        anchor.download = `${selectedEditMeme.name}-editado.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectURL);
    });
}

function showEditorSection() {
    editorSection.classList.remove('hidden');
}

function hideEditorSection() {
    editorSection.classList.add('hidden');
    editDownloadBtn.disabled = true;
}

function resetEditor() {
    selectedEditMeme = null;
    editTopTextInput.value = '';
    editBottomTextInput.value = '';
    translationOutput.textContent = '';
    translationOutput.classList.add('hidden');
    editDownloadBtn.disabled = true;
    renderEditor();
}

// --- Lógica de Búsqueda ---
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function findSimilarTerms(query, maxDistance = 2) {
    const allKeys = Object.keys(RELATED_TERMS);
    const similar = allKeys.filter(key => {
        const distance = levenshteinDistance(query, key);
        return distance <= maxDistance && key !== query;
    });
    return similar;
}

function handleSearch() {
    const query = searchInput.value.trim();

    if (query.length > 0) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }

    const sourceData = currentView === 'home' ? allMemes : favorites;

    if (!query) {
        displayedMemes = [...sourceData];
    } else {
        const normalizedQuery = normalizeSearchText(query);
        const queryTokens = normalizedQuery.split(/[^\p{L}0-9]+/u).filter(Boolean);
        const expandedTerms = new Set();
        
        // Add original terms
        queryTokens.forEach(token => {
            expandedTerms.add(token);
        });
        
        // Expand with RELATED_TERMS (forward lookup)
        const termsToCheck = new Set(queryTokens);
        termsToCheck.forEach(term => {
            if (RELATED_TERMS[term]) {
                RELATED_TERMS[term].forEach(relatedTerm => {
                    expandedTerms.add(normalizeSearchText(relatedTerm));
                });
            }
        });
        
        // Reverse lookup: if query term is a value, add all related terms
        queryTokens.forEach(token => {
            const relatedByValue = findRelatedTermsByValue(token);
            relatedByValue.forEach(term => {
                expandedTerms.add(term);
            });
        });
        
        // Find similar terms
        queryTokens.forEach(token => {
            const similarTerms = findSimilarTerms(token);
            similarTerms.forEach(sim => {
                expandedTerms.add(sim);
                if (RELATED_TERMS[sim]) {
                    RELATED_TERMS[sim].forEach(relatedTerm => {
                        expandedTerms.add(normalizeSearchText(relatedTerm));
                    });
                }
            });
        });

        // Sort results by relevance (exact matches first, then partial)
        displayedMemes = sourceData
            .map(meme => {
                const text = (meme.searchText || meme.name || '').toLowerCase();
                let score = 0;
                
                // Exact token matches score highest
                queryTokens.forEach(token => {
                    if (text.includes(token)) score += 100;
                });
                
                // Expanded term matches
                expandedTerms.forEach(term => {
                    if (text.includes(term)) score += 10;
                });
                
                // Partial word matches
                queryTokens.forEach(token => {
                    const words = text.split(/\s+/);
                    words.forEach(word => {
                        if (word.startsWith(token) || token.startsWith(word.substring(0, 3))) {
                            score += 5;
                        }
                    });
                });
                
                return { meme, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.meme);
    }

    renderMemes();
}

// --- Favoritos ---
function toggleFavorite(meme, btnElement) {
    const index = favorites.findIndex(f => f.id === meme.id);

    if (index === -1) {
        // Añadir a favoritos
        favorites.push(meme);
        btnElement.classList.add('active');
        btnElement.querySelector('i').classList.replace('ph', 'ph-fill');
    } else {
        // Quitar de favoritos
        favorites.splice(index, 1);
        btnElement.classList.remove('active');
        btnElement.querySelector('i').classList.replace('ph-fill', 'ph');

        // Actualizar vista si estamos en favoritos o en edición
        if (currentView === 'favs' || currentView === 'edit') {
            handleSearch(); // Para aplicar filtros actuales a los favoritos actualizados
            if (currentView === 'edit') {
                if (!favorites.some(f => f.id === selectedEditMeme?.id)) {
                    selectedEditMeme = null;
                }
                renderEditor();
            }
        }
    }

    // Guardar en localStorage
    localStorage.setItem('memeFavorites', JSON.stringify(favorites));
}

// --- Navegación ---
function switchView(view) {
    currentView = view;
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');

    if (view === 'home') {
        navHome.classList.add('active');
        navFavs.classList.remove('active');
        navEdit.classList.remove('active');
        sectionTitle.textContent = currentLanguage === 'es' ? 'Tendencias Actuales' : 'Trending';
        displayedMemes = [...allMemes];
        hideEditorSection();
    } else if (view === 'favs') {
        navFavs.classList.add('active');
        navHome.classList.remove('active');
        navEdit.classList.remove('active');
        sectionTitle.textContent = currentLanguage === 'es' ? 'Tus Memes Favoritos' : 'Your Favorites';
        displayedMemes = [...favorites];
        hideEditorSection();
    } else {
        navEdit.classList.add('active');
        navHome.classList.remove('active');
        navFavs.classList.remove('active');
        sectionTitle.textContent = currentLanguage === 'es' ? 'Editar meme' : 'Edit Meme';
        displayedMemes = [...favorites];
        showEditorSection();
        selectedEditMeme = favorites.length ? favorites[0] : null;
        renderEditor();
        updateCurrentViewUI();
    }

    renderMemes();
}

// --- Utilidades ---
function showLoader() {
    loader.classList.remove('hidden');
    memeGrid.classList.add('hidden');
    emptyState.classList.add('hidden');
    resultsCount.textContent = 'Buscando...';
}

function hideLoader() {
    loader.classList.add('hidden');
}

// --- Event Listeners ---
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 80));
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });

    searchBtn.addEventListener('click', handleSearch);

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        handleSearch();
        searchInput.focus();
    });

    navHome.addEventListener('click', () => switchView('home'));
    navFavs.addEventListener('click', () => switchView('favs'));
    navEdit.addEventListener('click', () => switchView('edit'));
    navTranslate.addEventListener('click', handleNavTranslate);
    refreshMemesBtn.addEventListener('click', refreshMemes);

    editTopTextInput.addEventListener('input', debounce(renderEditor, 120));
    editBottomTextInput.addEventListener('input', debounce(renderEditor, 120));
    translateBtnEditor.addEventListener('click', translateEditorText);
    editDownloadBtn.addEventListener('click', downloadEditedMeme);
    editorResetBtn.addEventListener('click', () => {
        editTopTextInput.value = '';
        editBottomTextInput.value = '';
        translationOutput.textContent = '';
        translationOutput.classList.add('hidden');
        selectedEditMeme = null;
        renderEditor();
    });
}
