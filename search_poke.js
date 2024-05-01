document.querySelector("#search").addEventListener("click", getPokemon);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerCaseName(string) {
  return string.toLowerCase();
}

function getPokemon(e) {
  const name = document.querySelector("#pokemonName").value;
  const pokemonName = lowerCaseName(name);

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    .then((response) => response.json())
    .then((data) => {
      const searchedPokemonBox = document.querySelector(".searchedPokemonBox"); // Get the box for searched Pokemon
      searchedPokemonBox.innerHTML = `
      <div class="pokemonCard clickableCard"> <!-- Add class for styling -->
        <img
          src="${data.sprites.other["official-artwork"].front_default}"
          alt="${data.name}"
        />
        <div class="pokemonInfos">
          <h1>${capitalizeFirstLetter(data.name)}</h1>  
          <p>Weight: ${data.weight} kg</p>
          <p>Size: ${data.height} cm</p>
          <p>Type: ${
            data.types[0].type.name + (data.types[1] ? ", " + data.types[1].type.name : "")
          }</p>
          <p>Abilities: ${
            data.abilities.map(ability => ability.ability.name).join(", ")
          }</p>
        </div>
      </div>`;
      
      // Add click event to the entire card
      const pokemonCard = searchedPokemonBox.querySelector(".clickableCard");
      pokemonCard.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        getPokemonByName(data.name);
      });
    })
    .catch((err) => {
      console.log("Pokemon not found", err);
      const searchedPokemonBox = document.querySelector(".searchedPokemonBox");
      searchedPokemonBox.innerHTML = `
      <h4>Pokemon not found 😞</h4>
      `;
    });

  e.preventDefault();
}

document.addEventListener("DOMContentLoaded", () => {
  let offset = 0;
  const limit = 20; // Number of Pokémon to fetch per request

  function fetchPokemon(offset, limit) {
    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
      .then((response) => response.json())
      .then((data) => {
        const pokemonList = data.results;
        const pokemonBox = document.querySelector(".infiniteScrollPokemonBox"); // Get the box for infinite scroll Pokemon

        pokemonList.forEach((pokemon) => {
          fetchPokemonData(pokemon.url, pokemonBox); // Pass the pokemonBox
        });
      })
      .catch((err) => {
        console.error("Error fetching Pokémon:", err);
      });
  }

  function fetchPokemonData(url, pokemonBox) { // Accept pokemonBox as parameter
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemonCard", "clickableCard");

        pokemonCard.innerHTML = `
          <img src="${data.sprites.other["official-artwork"].front_default}" alt="${data.name}" />
          <div class="pokemonInfos">
            <h1>${capitalizeFirstLetter(data.name)}</h1>
          </div>
        `;

        pokemonBox.appendChild(pokemonCard); // Append to the specified pokemonBox
        
        // Add click event to the entire card
        pokemonCard.addEventListener("click", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          getPokemonByName(data.name);
        });
      })
      .catch((err) => {
        console.error("Error fetching Pokémon data:", err);
      });
  }

  window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      offset += limit;
      fetchPokemon(offset, limit);
    }
  });

  fetchPokemon(offset, limit);
});

function getPokemonByName(name) {
  const inputField = document.querySelector("#pokemonName");
  inputField.value = name;
  getPokemon(new Event("click"));
}


// Add event listeners to type buttons
document.querySelectorAll(".type-btn").forEach(button => {
  button.addEventListener("click", () => {
      const type = button.dataset.type;
      fetchPokemonByType(type);
  });
});

// Function to fetch Pokemon by type
function fetchPokemonByType(type) {
  let url;
  if (type === "all") {
      url = "https://pokeapi.co/api/v2/pokemon";
  } else {
      url = `https://pokeapi.co/api/v2/type/${type}`;
  }

  fetch(url)
      .then(response => response.json())
      .then(data => {
          const pokemonList = data.results;
          const pokemonBox = document.querySelector(".infiniteScrollPokemonBox");

          // Clear existing Pokemon cards
          pokemonBox.innerHTML = "";

          pokemonList.forEach(pokemon => {
              // Fetch individual Pokemon data
              fetchPokemonData(pokemon.url, pokemonBox);
          });
      })
      .catch(error => console.error("Error fetching Pokemon:", error));
}