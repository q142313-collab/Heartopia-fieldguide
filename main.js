const pokedex = document.getElementById('pokedex');
const addGuideBtn = document.getElementById('add-guide-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('add-guide-modal');
const closeBtn = document.querySelector('.close-btn');
const addGuideForm = document.getElementById('add-guide-form');
const imageDropZone = document.getElementById('image-drop-zone');
const creatureImageInput = document.getElementById('creature-image');

let guides = JSON.parse(localStorage.getItem('guides')) || [];
let currentFilter = null;

const displayGuides = () => {
  const filteredGuides = currentFilter ? guides.filter(guide => guide.category === currentFilter) : guides;
  const guidesHTMLString = filteredGuides
    .map(
      (guide) => `
    <div class="pokemon-card">
      <img src="${guide.image}" />
      <h2>${guide.name}</h2>
      <p><strong>Region:</strong> ${guide.region}</p>
      <p><strong>Sub-region:</strong> ${guide.subRegion}</p>
      <p><strong>Level:</strong> ${guide.level}</p>
      <p><strong>Weather:</strong> ${guide.weather}</p>
      <p><strong>Time:</strong> ${guide.time}</p>
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

imageDropZone.addEventListener('click', () => creatureImageInput.click());
creatureImageInput.addEventListener('change', (e) => handleImageFile(e.target.files[0]));

imageDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  imageDropZone.style.borderColor = '#c0392b';
});

imageDropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  imageDropZone.style.borderColor = '#ccc';
});

imageDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  imageDropZone.style.borderColor = '#ccc';
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
  imageDropZone.querySelector('p').textContent = 'Drag & Drop image here or click to select';
  delete creatureImageInput.dataset.url;
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    currentFilter = currentFilter === category ? null : category;
    displayGuides();
  });
});

displayGuides();
