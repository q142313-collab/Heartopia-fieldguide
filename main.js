const pokedex = document.getElementById('pokedex');
const addGuideBtn = document.getElementById('add-guide-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const addGuideModal = document.getElementById('add-guide-modal');
const detailsModal = document.getElementById('details-modal');
const closeBtns = document.querySelectorAll('.close-btn');
const addGuideForm = document.getElementById('add-guide-form');
const imageDropZone = document.getElementById('image-drop-zone');
const creatureImageInput = document.getElementById('creature-image');
const langBtns = document.querySelectorAll('.lang-btn');
const sizeSlider = document.getElementById('size-slider');
const modalTitle = document.getElementById('modal-title');
const modalSubmitBtn = document.getElementById('modal-submit-btn');
const guideDetailsContainer = document.getElementById('guide-details');

let guides = JSON.parse(localStorage.getItem('guides')) || [];
let currentFilter = null;
let currentLang = 'en';
let currentCardSize = 280;
let editingGuideIndex = null;

const getTranslation = (key, lang = currentLang) => {
    return translations[lang][key] || key;
}

const updateCardSize = () => {
    currentCardSize = sizeSlider.value;
    document.documentElement.style.setProperty('--card-size', `${currentCardSize}px`);
}

const setLanguage = (lang) => {
    currentLang = lang;
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.dataset.translateKey;
        if(el.tagName === 'H2' && el.id === 'modal-title') return; // Don't translate this one here
        el.textContent = getTranslation(key, lang);
    });
    document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => {
        const key = el.dataset.translateKeyPlaceholder;
        el.placeholder = getTranslation(key, lang);
    });

    const imageDropZoneText = imageDropZone.querySelector('p');
    if (imageDropZoneText) {
        imageDropZoneText.textContent = getTranslation('imageLabel', lang);
    }

    langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    displayGuides();
};

const displayGuides = () => {
    const filteredGuides = currentFilter ? guides.filter(guide => guide.category === currentFilter) : guides;
    const guidesHTMLString = filteredGuides.map((guide, index) => {
        const name = guide.name[currentLang] || guide.name;
        const region = guide.region[currentLang] || guide.region;
        const subRegion = guide.subRegion[currentLang] || guide.subRegion;
        const collectionStars = Array(5).fill(0).map((_, i) => `<span class="star ${i < (guide.collection || 0) ? 'filled' : ''}" data-rating="${i + 1}">★</span>`).join('');

        return `
        <div class="pokemon-card" data-index="${index}">
            <div class="card-actions-corner">
                <button class="card-action-btn edit-btn" data-index="${index}" title="Edit">✏️</button>
                <button class="card-action-btn delete-btn" data-index="${index}" title="Delete">🗑️</button>
            </div>
            <div class="card-content-wrapper">
                <div class="card-header">
                    <img src="${guide.image}" alt="${name}">
                    <h2>${name}</h2>
                </div>
                <div class="card-details">
                    <p><strong><img src="https://i.ibb.co/L8DR0cZ/region.png" width="16"/> ${getTranslation('regionLabel')}:</strong> <span class="detail-value">${region}</span></p>
                    <p><strong><img src="https://i.ibb.co/c12V3Jd/subregion.png" width="16"/> ${getTranslation('subRegionLabel')}:</strong> <span class="detail-value">${subRegion}</span></p>
                    <p><strong><img src="https://i.ibb.co/9g3v4f5/level.png" width="16"/> ${getTranslation('levelLabel')}:</strong> <span class="detail-value">${guide.level}</span></p>
                    <p><strong><img src="https://i.ibb.co/XY3gJvM/collection.png" width="16"/> ${getTranslation('collectionLabel')}:</strong> <span class="collection-stars">${collectionStars}</span></p>
                </div>
            </div>
        </div>
        `;
    }).join('');
    pokedex.innerHTML = guidesHTMLString;
};

const toggleModal = (modal, show) => {
    modal.style.display = show ? 'block' : 'none';
    document.body.classList.toggle('modal-open', show);
    if (!show) {
        editingGuideIndex = null;
        addGuideForm.reset();
        const dropZoneText = imageDropZone.querySelector('p');
        if (dropZoneText) {
            dropZoneText.textContent = getTranslation('imageLabel');
        }
        delete creatureImageInput.dataset.url;
    }
};

const showDetailsModal = (index) => {
    const guide = guides[index];
    if (!guide) return;

    const name = guide.name[currentLang] || guide.name;
    const region = guide.region[currentLang] || guide.region;
    const subRegion = guide.subRegion[currentLang] || guide.subRegion;
    const collectionStars = Array(5).fill(0).map((_, i) => `<span class="star ${i < (guide.collection || 0) ? 'filled' : ''}" data-rating="${i + 1}">★</span>`).join('');

    const detailsHTML = `
        <div id="details-modal-actions">
            <button class="modal-action-btn edit-btn" data-index="${index}" title="Edit">✏️</button>
            <button class="modal-action-btn delete-btn" data-index="${index}" title="Delete">🗑️</button>
        </div>
        <div id="guide-details-header">
            <img src="${guide.image}" alt="${name}" />
            <h2>${name}</h2>
        </div>
        <div id="guide-details-body">
            <p><strong>${getTranslation('regionLabel')}</strong> ${region}</p>
            <p><strong>${getTranslation('subRegionLabel')}</strong> ${subRegion}</p>
            <p><strong>${getTranslation('levelLabel')}</strong> ${guide.level}</p>
            <p><strong>${getTranslation('weatherLabel')}</strong> ${guide.weather}</p>
            <p><strong>${getTranslation('timeLabel')}</strong> ${guide.time}</p>
            <p><strong>${getTranslation('collectionLabel')}</strong> <span class="collection-stars" data-index="${index}">${collectionStars}</span></p>
        </div>
    `;
    guideDetailsContainer.innerHTML = detailsHTML;
    toggleModal(detailsModal, true);
};

const handleImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        creatureImageInput.dataset.url = e.target.result;
        const dropZoneText = imageDropZone.querySelector('p');
        if (dropZoneText) {
            dropZoneText.textContent = file.name;
        }
    };
    reader.readAsDataURL(file);
};

const parseHTMLAndCreateGuides = (html, category) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = doc.querySelectorAll('tr');
    const newGuides = [];
    let lastRegionKo = '';

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        let nameKo, regionKo, subRegionKo, level, weather, time, imgSrc;

        const imgElement = cells[0].querySelector('img');
        if (!imgElement) continue;
        imgSrc = `fieldhuide/${imgElement.getAttribute('src')}`;
        nameKo = cells[1].textContent.trim();

        const getCellText = (index) => cells[index] ? cells[index].textContent.trim() : '';

        if (cells.length === 7) {
            regionKo = getCellText(2);
            subRegionKo = getCellText(3);
            level = getCellText(4);
            weather = getCellText(5);
            time = getCellText(6);
            lastRegionKo = regionKo;
        } else if (cells.length === 6) {
            regionKo = lastRegionKo;
            subRegionKo = getCellText(2);
            level = getCellText(3);
            weather = getCellText(4);
            time = getCellText(5);
        } else {
            continue;
        }

        newGuides.push({
            name: { ko: nameKo, en: `[EN] ${nameKo}` },
            region: { ko: regionKo, en: `[EN] ${regionKo}` },
            subRegion: { ko: subRegionKo, en: `[EN] ${subRegionKo}` },
            level: level,
            weather: weather,
            time: time,
            image: imgSrc,
            category: category,
            collection: 0,
        });
    }
    return newGuides;
};

const openEditModal = (index) => {
    const guide = guides[index];
    if (!guide) return;

    editingGuideIndex = index;

    document.getElementById('creature-name').value = guide.name[currentLang] || guide.name;
    document.getElementById('creature-category').value = guide.category;
    document.getElementById('creature-region').value = guide.region[currentLang] || guide.region;
    document.getElementById('creature-sub-region').value = guide.subRegion[currentLang] || guide.subRegion;
    document.getElementById('creature-level').value = guide.level;
    document.getElementById('creature-weather').value = guide.weather;
    document.getElementById('creature-time').value = guide.time;
    
    creatureImageInput.dataset.url = guide.image;
    const dropZoneText = imageDropZone.querySelector('p');
    if (dropZoneText) {
        dropZoneText.textContent = guide.image ? guide.image.split('/').pop() : getTranslation('imageLabel');
    }

    modalTitle.textContent = getTranslation('editGuideTitle');
    modalSubmitBtn.textContent = getTranslation('saveBtn');
    
    if (detailsModal.style.display === 'block') {
        toggleModal(detailsModal, false);
    }
    toggleModal(addGuideModal, true);
};

const deleteGuide = (index) => {
    if (confirm(getTranslation('deleteConfirm'))) {
        guides.splice(index, 1);
        localStorage.setItem('guides', JSON.stringify(guides));
        if (detailsModal.style.display === 'block') {
            toggleModal(detailsModal, false);
        }
        displayGuides();
    }
};

const loadInitialData = async () => {
    if (guides.length === 0) {
        try {
            const [fishHTML, birdHTML, insectHTML] = await Promise.all([
                fetch('fieldhuide/어류.html').then(res => res.text()),
                fetch('fieldhuide/조류.html').then(res => res.text()),
                fetch('fieldhuide/곤충.html').then(res => res.text())
            ]);

            const fishGuides = parseHTMLAndCreateGuides(fishHTML, 'fish');
            const birdGuides = parseHTMLAndCreateGuides(birdHTML, 'bird');
            const insectGuides = parseHTMLAndCreateGuides(insectHTML, 'insect');

            guides = [...fishGuides, ...birdGuides, ...insectGuides];
            localStorage.setItem('guides', JSON.stringify(guides));
        } catch (error) {
            console.error("Error loading initial data:", error);
        }
    }
    setLanguage(currentLang);
    updateCardSize();
};

// Event Listeners using Delegation
pokedex.addEventListener('click', (e) => {
    const card = e.target.closest('.pokemon-card');
    if (!card) return;
    
    const index = card.dataset.index;

    if (e.target.closest('.edit-btn')) {
        e.stopPropagation();
        openEditModal(index);
    } else if (e.target.closest('.delete-btn')) {
        e.stopPropagation();
        deleteGuide(index);
    } else {
        showDetailsModal(index);
    }
});

guideDetailsContainer.addEventListener('click', (e) => {
    const index = e.target.closest('.collection-stars')?.dataset.index;
    const star = e.target.closest('.star');
    
    if (star && index !== undefined) {
        const rating = parseInt(star.dataset.rating, 10);
        const currentRating = guides[index].collection || 0;
        guides[index].collection = rating === currentRating ? 0 : rating;
        localStorage.setItem('guides', JSON.stringify(guides));
        showDetailsModal(index); // Re-render the modal content
        displayGuides(); // Update the main card list as well
    } else if (e.target.closest('.edit-btn')) {
        const editIndex = e.target.closest('.edit-btn').dataset.index;
        openEditModal(editIndex);
    } else if (e.target.closest('.delete-btn')) {
        const deleteIndex = e.target.closest('.delete-btn').dataset.index;
        deleteGuide(deleteIndex);
    }
});

sizeSlider.addEventListener('input', updateCardSize);

imageDropZone.addEventListener('click', () => creatureImageInput.click());
creatureImageInput.addEventListener('change', (e) => handleImageFile(e.target.files[0]));

['dragover', 'dragleave', 'drop'].forEach(eventName => {
    imageDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (eventName === 'dragover') imageDropZone.style.borderColor = '#ffc7d1';
        if (eventName === 'dragleave' || eventName === 'drop') imageDropZone.style.borderColor = '#e0e0e0';
        if (eventName === 'drop') handleImageFile(e.dataTransfer.files[0]);
    });
});

addGuideBtn.addEventListener('click', () => {
    editingGuideIndex = null;
    modalTitle.textContent = getTranslation('addGuideTitle');
    modalSubmitBtn.textContent = getTranslation('addGuideBtn');
    toggleModal(addGuideModal, true);
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleModal(btn.closest('.modal'), false);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === addGuideModal || e.target === detailsModal) {
        toggleModal(e.target, false);
    }
});

addGuideForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const guideData = {
        level: document.getElementById('creature-level').value,
        weather: document.getElementById('creature-weather').value,
        time: document.getElementById('creature-time').value,
        image: creatureImageInput.dataset.url || '',
        category: document.getElementById('creature-category').value,
    };

    const nameInput = document.getElementById('creature-name').value;
    const regionInput = document.getElementById('creature-region').value;
    const subRegionInput = document.getElementById('creature-sub-region').value;

    if (editingGuideIndex !== null) {
        const originalGuide = guides[editingGuideIndex];
        guideData.name = { ...originalGuide.name, [currentLang]: nameInput };
        guideData.region = { ...originalGuide.region, [currentLang]: regionInput };
        guideData.subRegion = { ...originalGuide.subRegion, [currentLang]: subRegionInput };
        guides[editingGuideIndex] = { ...originalGuide, ...guideData };
    } else {
        const newGuide = {
            ...guideData,
            name: { en: `[EN] ${nameInput}`, ko: nameInput },
            region: { en: `[EN] ${regionInput}`, ko: regionInput },
            subRegion: { en: `[EN] ${subRegionInput}`, ko: subRegionInput },
            collection: 0,
        };
        newGuide.name[currentLang] = nameInput;
        newGuide.region[currentLang] = regionInput;
        newGuide.subRegion[currentLang] = subRegionInput;
        guides.push(newGuide);
    }

    localStorage.setItem('guides', JSON.stringify(guides));
    displayGuides();
    toggleModal(addGuideModal, false);
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        filterBtns.forEach(b => b.classList.remove('active'));
        
        if (currentFilter === category) {
            currentFilter = null;
        } else {
            currentFilter = category;
            btn.classList.add('active');
        }
        
        displayGuides();
    });
});

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        setLanguage(lang);
    });
});

loadInitialData();
