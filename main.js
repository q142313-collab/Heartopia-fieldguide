
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
    document.documentElement.style.setProperty('--card-size', `${currentCardSize}px`);
}

const setLanguage = (lang) => {
  currentLang = lang;
  document.querySelectorAll('[data-translate-key]').forEach(el => {
    const key = el.dataset.translateKey;
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
    btn.classList.remove('active');
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    }
  });

  displayGuides();
};

const displayGuides = () => {
  const filteredGuides = currentFilter ? guides.filter(guide => guide.category === currentFilter) : guides;
  const guidesHTMLString = filteredGuides.map((guide, index) => {
      const name = guide.name[currentLang] || guide.name;
      const region = guide.region[currentLang] || guide.region;
      const subRegion = guide.subRegion[currentLang] || guide.subRegion;

      return `
      <div class="pokemon-card" data-index="${index}">
        <div class="card-header">
          <img src="${guide.image}" alt="${name}">
          <h2>${name}</h2>
        </div>
        <div class="card-details">
          <p><strong><img src="https://i.ibb.co/L8DR0cZ/region.png" width="16"/> ${getTranslation('regionLabel')}:</strong> <span class="detail-value">${region}</span></p>
          <p><strong><img src="https://i.ibb.co/c12V3Jd/subregion.png" width="16"/> ${getTranslation('subRegionLabel')}:</strong> <span class="detail-value">${subRegion}</span></p>
          <p><strong><img src="https://i.ibb.co/9g3v4f5/level.png" width="16"/> ${getTranslation('levelLabel')}:</strong> <span class="detail-value">${guide.level}</span></p>
          <p><strong><img src="https://i.ibb.co/XY3gJvM/collection.png" width="16"/> ${getTranslation('collectionLabel')}:</strong> <span class="collection-stars">★★★★★</span></p>
        </div>
      </div>
      `;
    }).join('');
  pokedex.innerHTML = guidesHTMLString;
};

const toggleAddGuideModal = (show) => {
    addGuideModal.style.display = show ? 'block' : 'none';
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

const toggleDetailsModal = (show) => {
    detailsModal.style.display = show ? 'block' : 'none';
};

const showDetailsModal = (index) => {
    const guide = guides[index];
    if (!guide) return;

    const name = guide.name[currentLang] || guide.name;
    const region = guide.region[currentLang] || guide.region;
    const subRegion = guide.subRegion[currentLang] || guide.subRegion;

    const detailsHTML = `
        <div id="details-modal-actions">
            <button class="modal-action-btn edit-btn" data-index="${index}">✏️</button>
            <button class="modal-action-btn delete-btn" data-index="${index}">🗑️</button>
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
            <p><strong>${getTranslation('collectionLabel')}</strong> <span class="collection-stars">★★★★★</span></p>
        </div>
    `;
    guideDetailsContainer.innerHTML = detailsHTML;
    toggleDetailsModal(true);
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

        if (cells.length === 7) {
            regionKo = cells[2].textContent.trim();
            subRegionKo = cells[3].textContent.trim();
            level = cells[4].textContent.trim();
            weather = cells[5].textContent.trim();
            time = cells[6].textContent.trim();
            lastRegionKo = regionKo;
        } else if (cells.length === 6) {
            regionKo = lastRegionKo;
            subRegionKo = cells[2].textContent.trim();
            level = cells[3].textContent.trim();
            weather = cells[4].textContent.trim();
            time = cells[5].textContent.trim();
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
    
    toggleDetailsModal(false);
    toggleAddGuideModal(true);
};

const deleteGuide = (index) => {
    if (confirm(getTranslation('deleteConfirm'))) {
        guides.splice(index, 1);
        localStorage.setItem('guides', JSON.stringify(guides));
        toggleDetailsModal(false);
        displayGuides();
    }
};

const loadInitialData = async () => {
  if (guides.length === 0) {
    try {
        const fishHTML = await fetch('fieldhuide/어류.html').then(res => res.text());
        const birdHTML = await fetch('fieldhuide/조류.html').then(res => res.text());
        const insectHTML = await fetch('fieldhuide/곤충.html').then(res => res.text());

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

pokedex.addEventListener('click', (e) => {
    const card = e.target.closest('.pokemon-card');
    if (card) {
        const index = card.dataset.index;
        showDetailsModal(index);
    }
});

guideDetailsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const index = e.target.dataset.index;
        openEditModal(index);
    }
    if (e.target.classList.contains('delete-btn')) {
        const index = e.target.dataset.index;
        deleteGuide(index);
    }
});

sizeSlider.addEventListener('input', (e) => {
    currentCardSize = e.target.value;
    updateCardSize();
});

imageDropZone.addEventListener('click', () => creatureImageInput.click());
creatureImageInput.addEventListener('change', (e) => handleImageFile(e.target.files[0]));

imageDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  imageDropZone.style.borderColor = '#b8c6e5';
});

imageDropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  imageDropZone.style.borderColor = '#e0e0e0';
});

imageDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  imageDropZone.style.borderColor = '#e0e0e0';
  handleImageFile(e.dataTransfer.files[0]);
});

addGuideBtn.addEventListener('click', () => {
    editingGuideIndex = null;
    modalTitle.textContent = getTranslation('addGuideTitle');
    modalSubmitBtn.textContent = getTranslation('addGuideBtn');
    toggleAddGuideModal(true);
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleAddGuideModal(false);
        toggleDetailsModal(false);
    });
});

window.addEventListener('click', (e) => {
  if (e.target === addGuideModal || e.target === detailsModal) {
    toggleAddGuideModal(false);
    toggleDetailsModal(false);
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
        guideData.name = { en: `[Needs Translation] ${nameInput}`, ko: nameInput };
        guideData.region = { en: `[Needs Translation] ${regionInput}`, ko: regionInput };
        guideData.subRegion = { en: `[Needs Translation] ${subRegionInput}`, ko: subRegionInput };
        guideData.name[currentLang] = nameInput;
        guideData.region[currentLang] = regionInput;
        guideData.subRegion[currentLang] = subRegionInput;

        guides.push(guideData);
    }

    localStorage.setItem('guides', JSON.stringify(guides));
    displayGuides();
    toggleAddGuideModal(false);
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
