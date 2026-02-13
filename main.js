
const pokedex = document.getElementById('pokedex');
const addGuideBtn = document.getElementById('add-guide-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('add-guide-modal');
const closeBtn = document.querySelector('.close-btn');
const addGuideForm = document.getElementById('add-guide-form');
const imageDropZone = document.getElementById('image-drop-zone');
const creatureImageInput = document.getElementById('creature-image');
const langBtns = document.querySelectorAll('.lang-btn');

let guides = JSON.parse(localStorage.getItem('guides')) || [];
let currentFilter = null;
let currentLang = 'en';

const getTranslation = (key, lang = currentLang) => {
    return translations[lang][key] || key;
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

  // Update image drop zone text
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

  // Re-display guides with the new language
  displayGuides();
};

const displayGuides = () => {
  const filteredGuides = currentFilter ? guides.filter(guide => guide.category === currentFilter) : guides;
  const guidesHTMLString = filteredGuides
    .map(
      (guide) => {
        // For existing data that is not multi-language, just display it.
        // For new data, we'd need a more robust system, but for now, this will render existing data.
        const name = guide.name[currentLang] || guide.name;
        const region = guide.region[currentLang] || guide.region;
        const subRegion = guide.subRegion[currentLang] || guide.subRegion;
        
        return `
    <div class="pokemon-card">
      <img src="${guide.image}" alt="${name}" />
      <div class="card-content">
        <h2>${name}</h2>
        <p><strong>${getTranslation('regionLabel')}:</strong> ${region}</p>
        <p><strong>${getTranslation('subRegionLabel')}:</strong> ${subRegion}</p>
        <p><strong>${getTranslation('levelLabel')}:</strong> ${guide.level}</p>
        <p><strong>${getTranslation('weatherLabel')}:</strong> ${guide.weather}</p>
        <p><strong>${getTranslation('timeLabel')}:</strong> ${guide.time}</p>
      </div>
    </div>
    `
    })
    .join('');
  pokedex.innerHTML = guidesHTMLString;
};

const toggleModal = (show) => {
  modal.style.display = show ? 'block' : 'none';
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
    // Note: This parsing is specific to the initial Korean HTML files.
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length >= 5) {
            const imgElement = cells[0].querySelector('img');
            if (imgElement) {
                const imgSrc = imgElement.getAttribute('src');
                const nameKo = cells[1].textContent.trim();
                // Simple placeholder for English translation
                const nameEn = `[EN] ${nameKo}`; 

                newGuides.push({
                    name: { ko: nameKo, en: nameEn },
                    region: { ko: '미확인', en: 'Unidentified' },
                    subRegion: { ko: '미확인', en: 'Unidentified' },
                    level: cells[2].textContent.trim(),
                    weather: cells[3].textContent.trim(),
                    time: cells[4].textContent.trim(),
                    image: `.vscode/fieldhuide/${imgSrc}`,
                    category: category,
                });
            }
        }
    }
    return newGuides;
};

const loadInitialData = async () => {
  if (guides.length === 0) {
    try {
        const fishHTML = await fetch('.vscode/fieldhuide/어류.html').then(res => res.text());
        const birdHTML = await fetch('.vscode/fieldhuide/조류.html').then(res => res.text());
        const insectHTML = await fetch('.vscode/fieldhuide/곤충.html').then(res => res.text());

        const fishGuides = parseHTMLAndCreateGuides(fishHTML, 'fish');
        const birdGuides = parseHTMLAndCreateGuides(birdHTML, 'bird');
        const insectGuides = parseHTMLAndCreateGuides(insectHTML, 'insect');

        guides = [...fishGuides, ...birdGuides, ...insectGuides];
        localStorage.setItem('guides', JSON.stringify(guides));
    } catch (error) {
        console.error("Error loading initial data:", error);
    }
  }
  // Set initial language and display
  setLanguage(currentLang);
};

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

addGuideBtn.addEventListener('click', () => toggleModal(true));
closeBtn.addEventListener('click', () => toggleModal(false));
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    toggleModal(false);
  }
});

addGuideForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const newGuide = {
    name: {},
    region: {},
    subRegion: {},
    level: document.getElementById('creature-level').value,
    weather: document.getElementById('creature-weather').value,
    time: document.getElementById('creature-time').value,
    image: creatureImageInput.dataset.url || '',
    category: document.getElementById('creature-category').value,
  };

  const nameInput = document.getElementById('creature-name').value;
  const regionInput = document.getElementById('creature-region').value;
  const subRegionInput = document.getElementById('creature-sub-region').value;

  // Save the input in the current language and provide a fallback for the other.
  if (currentLang === 'en') {
      newGuide.name = { en: nameInput, ko: `[번역 필요] ${nameInput}` };
      newGuide.region = { en: regionInput, ko: `[번역 필요] ${regionInput}` };
      newGuide.subRegion = { en: subRegionInput, ko: `[번역 필요] ${subRegionInput}` };
  } else {
      newGuide.name = { en: `[Needs Translation] ${nameInput}`, ko: nameInput };
      newGuide.region = { en: `[Needs Translation] ${regionInput}`, ko: regionInput };
      newGuide.subRegion = { en: `[Needs Translation] ${subRegionInput}`, ko: subRegionInput };
  }

  guides.push(newGuide);
  localStorage.setItem('guides', JSON.stringify(guides));
  displayGuides();
  toggleModal(false);
  addGuideForm.reset();
  
  const dropZoneText = imageDropZone.querySelector('p');
    if (dropZoneText) {
        dropZoneText.textContent = getTranslation('imageLabel');
    }
  delete creatureImageInput.dataset.url;
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
