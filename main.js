const pokedex = document.getElementById('pokedex');
const addGuideBtn = document.getElementById('add-guide-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

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
    </div>
    `
    )
    .join('');
  pokedex.innerHTML = guidesHTMLString;
};

const addGuide = () => {
  const name = prompt('Enter the name of the creature:');
  const image = prompt('Enter the image URL of the creature:');
  const category = prompt('Enter the category (insect, fish, or bird):');

  if (name && image && category) {
    guides.push({ name, image, category });
    localStorage.setItem('guides', JSON.stringify(guides));
    displayGuides();
  }
};

const filterByCategory = (category) => {
  if (currentFilter === category) {
    currentFilter = null;
  } else {
    currentFilter = category;
  }
  displayGuides();
};

addGuideBtn.addEventListener('click', addGuide);
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => filterByCategory(btn.dataset.category));
});

displayGuides();
