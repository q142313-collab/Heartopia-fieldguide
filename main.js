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

const setLanguage = (lang) => {
  currentLang = lang;
  document.querySelectorAll('[data-translate-key]').forEach(el => {
    const key = el.dataset.translateKey;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => {
    const key = el.dataset.translateKeyPlaceholder;
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  langBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    }
  });
};

const displayGuides = () => {
  const filteredGuides = currentFilter ? guides.filter(guide => guide.category === currentFilter) : guides;
  const guidesHTMLString = filteredGuides
    .map(
      (guide) => `
    <div class="pokemon-card">
      <img src="${guide.image}" />
      <div class="card-content">
        <h2>${guide.name}</h2>
        <p><strong>Region:</strong> ${guide.region}</p>
        <p><strong>Sub-region:</strong> ${guide.subRegion}</p>
        <p><strong>Level:</strong> ${guide.level}</p>
        <p><strong>Weather:</strong> ${guide.weather}</p>
        <p><strong>Time:</strong> ${guide.time}</p>
      </div>
    </div>
    `
    )
    .join('');
  pokedex.innerHTML = guidesHTMLString;
};

const toggleModal = (show) => {
  modal.style.display = show ? 'block' : 'none';
};

const handleImageFile = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    creatureImageInput.dataset.url = e.target.result;
    imageDropZone.querySelector('p').textContent = file.name;
  };
  reader.readAsDataURL(file);
};

const parseHTML = (html, category) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('tr');
  const newGuides = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    if (cells.length >= 5) {
      const imgElement = cells[0].querySelector('img');
      if (imgElement) {
        const imgSrc = imgElement.getAttribute('src');
        newGuides.push({
          name: cells[1].textContent.trim(),
          region: 'N/A',
          subRegion: 'N/A',
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

        const fishGuides = parseHTML(fishHTML, 'fish');
        const birdGuides = parseHTML(birdHTML, 'bird');
        const insectGuides = parseHTML(insectHTML, 'insect');

        guides = [...fishGuides, ...birdGuides, ...insectGuides];
        localStorage.setItem('guides', JSON.stringify(guides));
    } catch (error) {
        console.error("Error loading initial data:", error);
    }
  }
  displayGuides();
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
    name: document.getElementById('creature-name').value,
    region: document.getElementById('creature-region').value,
    subRegion: document.getElementById('creature-sub-region').value,
    level: document.getElementById('creature-level').value,
    weather: document.getElementById('creature-weather').value,
    time: document.getElementById('creature-time').value,
    image: creatureImageInput.dataset.url,
    category: document.getElementById('creature-category').value,
  };
  guides.push(newGuide);
  localStorage.setItem('guides', JSON.stringify(guides));
  displayGuides();
  toggleModal(false);
  addGuideForm.reset();
  imageDropZone.querySelector('p').textContent = translations[currentLang].imageLabel;
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
