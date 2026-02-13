const pokedex = document.getElementById('pokedex');
const searchBar = document.getElementById('search-bar');

let pokemonData = [];

const fetchPokemon = async () => {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=151`;
  const res = await fetch(url);
  const data = await res.json();
  const pokemon = data.results.map((result, index) => ({
    ...result,
    id: index + 1,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
  }));
  pokemonData = await Promise.all(pokemon.map(p => fetchPokemonData(p)));
  displayPokemon(pokemonData);
};

const fetchPokemonData = async (p) => {
    const res = await fetch(p.url);
    const data = await res.json();
    return {
        ...p,
        types: data.types.map(typeInfo => typeInfo.type.name)
    };
}

const displayPokemon = (pokemon) => {
  const pokemonHTMLString = pokemon
    .map(
      (p) => `
    <div class="pokemon-card">
      <img src="${p.image}" />
      <h2 class="card-title">${p.id}. ${p.name}</h2>
      <p class="card-subtitle">${p.types.map(type => `<span class=\"type type-${type}\">${type}</span>`).join(' ')}</p>
    </div>
    `
    )
    .join('');
  pokedex.innerHTML = pokemonHTMLString;
};

searchBar.addEventListener('keyup', (e) => {
  const searchString = e.target.value.toLowerCase();
  const filteredPokemon = pokemonData.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchString) ||
      p.id.toString().includes(searchString)
    );
  });
  displayPokemon(filteredPokemon);
});

fetchPokemon();
