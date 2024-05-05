const searchButton = document.getElementById('search');
const pokemonNameInput = document.getElementById('pokemonName');
const pokemonDetailsContainer = document.getElementById('pokemonDetailsContainer');
const pokemonGrid = document.getElementById('pokemonGrid');

let lastPokemonId = 0; // Track the last loaded Pokémon ID
let seenPokemons = new Set(); // Set to track seen Pokémon

// Function to fetch Pokémon details by ID
function searchPokemonDetailsById(pokemonId) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      .then(response => response.json());
}

// Function to fetch Pokémon details by name
function searchPokemonDetailsByName(pokemonName) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
      .then(response => response.json());
}

// Function to fetch weaknesses based on Pokemon type
function fetchPokemonWeaknesses(pokemonType) {
    return fetch(`https://pokeapi.co/api/v2/type/${pokemonType}`)
       .then(response => response.json())
       .then(data => {
            // Extract weaknesses from the response
            return data.damage_relations.double_damage_from.map(weakness => weakness.name);
        });
}

// Function to render Pokémon details
function renderPokemonDetails(pokemonDetails) {
  // Clear previous search results
  pokemonDetailsContainer.innerHTML = '';

  // Create details card container
  const detailsCard = document.createElement('div');
  detailsCard.classList.add('pokemon-details-card');

  // Create image element
  const pokemonImage = document.createElement('img');
  pokemonImage.src = pokemonDetails.sprites.front_default;
  pokemonImage.alt = pokemonDetails.name;
  detailsCard.appendChild(pokemonImage);

  // Create name element
  const pokemonName = document.createElement('h2');
  pokemonName.textContent = pokemonDetails.name;
  detailsCard.appendChild(pokemonName);

  // Create details elements
  const weight = document.createElement('p');
  weight.textContent = `Weight: ${pokemonDetails.weight} lbs`;
  detailsCard.appendChild(weight);

  const height = document.createElement('p');
  height.textContent = `Height: ${pokemonDetails.height} ft`;
  detailsCard.appendChild(height);

  const types = document.createElement('p');
  types.textContent = `Types: ${pokemonDetails.types.map(type => type.type.name).join(', ')}`;
  detailsCard.appendChild(types);

  const abilities = document.createElement('p');
  abilities.textContent = `Abilities: ${pokemonDetails.abilities.map(ability => ability.ability.name).join(', ')}`;
  detailsCard.appendChild(abilities);

  // Fetch and display weaknesses
  Promise.all(pokemonDetails.types.map(type => fetchPokemonWeaknesses(type.type.name)))
      .then(weaknessLists => {
          const weaknesses = weaknessLists.flat();
          const uniqueWeaknesses = [...new Set(weaknesses)]; // Remove duplicates
          const weaknessesElement = document.createElement('p');
          weaknessesElement.textContent = `Weaknesses: ${uniqueWeaknesses.join(', ')}`;
          detailsCard.appendChild(weaknessesElement);
      })
      .catch(error => {
          console.error('Error fetching weaknesses:', error);
          const weaknessesElement = document.createElement('p');
          weaknessesElement.textContent = 'Weaknesses data unavailable';
          detailsCard.appendChild(weaknessesElement);
      });

  // Append details card container to details container
  pokemonDetailsContainer.appendChild(detailsCard);

  // Scroll to the top of the page
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
}



// Function to render Pokémon card
function renderPokemonCard(pokemonDetails) {
  // Create card container
  const pokemonCard = document.createElement('div');
  pokemonCard.classList.add('pokemon-card');

  // Create image element
  const pokemonImage = document.createElement('img');
  pokemonImage.src = pokemonDetails.sprites.front_default;
  pokemonImage.alt = pokemonDetails.name;
  pokemonCard.appendChild(pokemonImage);

  // Create name element
  const pokemonName = document.createElement('p');
  pokemonName.textContent = pokemonDetails.name;
  pokemonCard.appendChild(pokemonName);

  // Add event listener to show details on card click
  pokemonCard.addEventListener('click', () => {
      renderPokemonDetails(pokemonDetails);
  });

  // Add event listener to toggle seen/unseen status on card click
  pokemonCard.addEventListener('click', () => {
      if (seenPokemons.has(pokemonDetails.id)) {
          seenPokemons.delete(pokemonDetails.id); // Remove from seenPokemons if already seen
      } else {
          seenPokemons.add(pokemonDetails.id); // Add to seenPokemons if not already seen
      }
      toggleSeenStatus(pokemonCard);
  });

  // Add 'seen' class if Pokémon is in seenPokemons set
  if (seenPokemons.has(pokemonDetails.id)) {
      pokemonCard.classList.add('seen');
      // Add tick icon if the Pokémon is in seenPokemons set
      const tickIcon = document.createElement('i');
      tickIcon.className = 'fas fa-check-circle';
      tickIcon.style.color = 'green';
      pokemonCard.appendChild(tickIcon);
  }

  return pokemonCard;
}


// Function to toggle 'seen' class on Pokémon card
function toggleSeenStatus(pokemonCard) {
    pokemonCard.classList.toggle('seen');
}

// Function to load more Pokémon
function loadMorePokemon() {
    // Check if we have already fetched 250 Pokémon
    if (lastPokemonId >= 100) {
        return; // Stop fetching if we've reached the limit
    }

    // Increment lastPokemonId to fetch the next set of Pokémon
    lastPokemonId += 20;

    // Fetch Pokémon details starting from lastPokemonId
    for (let i = lastPokemonId - 19; i <= lastPokemonId; i++) {
        searchPokemonDetailsById(i)
           .then(pokemonDetails => {
                const pokemonCard = renderPokemonCard(pokemonDetails);
                pokemonGrid.appendChild(pokemonCard);
            })
           .catch(error => console.error('Error fetching Pokemon details:', error));
    }
}

// Event listener for search button click
searchButton.addEventListener('click', () => {
    const pokemonName = pokemonNameInput.value.trim().toLowerCase();
     
    if (pokemonName) {
        searchPokemonDetailsByName(pokemonName)
         .then(pokemonDetails => {
               // Add the found Pokémon to the seenPokemons set
               seenPokemons.add(pokemonDetails.id);
               
               // Render the Pokémon details and update the UI
               renderPokemonDetails(pokemonDetails);
               // Update lastPokemonId to reflect the current state of the infinite scroll
               lastPokemonId = Math.max(lastPokemonId, pokemonDetails.id);
               
               // Trigger the UI update mechanism to add the tick sign
               renderPokemonCard(pokemonDetails);
           })
         .catch(error => {
               console.error('Error fetching Pokemon details:', error);
               // Display error message if Pokemon not found
               const errorMessage = document.createElement('div');
               errorMessage.classList.add('error-message');
               errorMessage.textContent = 'No Pokémon found with that name!';
               pokemonDetailsContainer.innerHTML = ''; // Clear previous search results
               pokemonDetailsContainer.appendChild(errorMessage);
           });
    } else {
        console.error('Please enter a Pokémon name.');
    }
});


// Infinite scrolling functionality
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        // Load more Pokémon when user reaches the bottom
        loadMorePokemon();
    }
});

// Load initial set of Pokémon
loadMorePokemon();
