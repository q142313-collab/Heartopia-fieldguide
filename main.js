const pokedex = document.getElementById('pokedex');
const addGuideBtn = document.getElementById('add-guide-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('add-guide-modal');
const closeBtn = document.querySelector('.close-btn');
const addGuideForm = document.getElementById('add-guide-form');

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
    image: document.getElementById('creature-image').value,
    category: document.getElementById('creature-category').value,
  };
  guides.push(newGuide);
  localStorage.setItem('guides', JSON.stringify(guides));
  displayGuides();
  toggleModal(false);
  addGuideForm.reset();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    currentFilter = currentFilter === category ? null : category;
    displayGuides();
  });
});

displayGuides();
