// Get DOM elements
const input = document.getElementById('input');
const searchBtn = document.getElementById('search-btn');
const output = document.getElementById('output');
const mapEl = document.getElementById('map');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');

/**
 * Initialize the map using the user's current IP address.
 */
async function initMap() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    getGEO(data.ip);
    input.value = data.ip;
  } catch (error) {
    handleFetchError(error, 'Failed to fetch IP information.');
  }
}

input.addEventListener('input', function () {
  errorContainer.style.display = 'none';
});

/**
 * Search for the geolocation information of the provided IP address.
 * @param {Event} e - The click event.
 */
function searchIP(e) {
  mapEl.style.display = 'block';
  output.style.display = 'block';
  const IP = input.value;
  getGEO(IP);
  e.preventDefault();
}

/**
 * Fetch geolocation information for the given IP address and display it.
 * @param {string} IP - The IP address to search for.
 */
async function getGEO(IP) {
  let data;
  try {
    const response = await fetch(
      `https://geo.ipify.org/api/v1?apiKey=at_wuvOQ7NKYsA7ReFthDnzqtIvnKo9C&ipAddress=${IP}`
    );
    data = await response.json();

    const {
      ip,
      location: { region, timezone, country, lat, lng },
      as: { name: provider },
    } = data;

    showOutput(ip, region, timezone, provider, country);
    showMap(lat, lng, ip);

    // Add the searched IP to history
    addToHistory(input.value);
  } catch (error) {
    handleFetchError(data, 'Failed to fetch geolocation information.');
  }
}

/**
 * Display the map with a marker at the specified coordinates.
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @param {string} ip - The IP address for the marker popup.
 */
function showMap(lat, lng, ip) {
  mapEl.innerHTML = '<div id="mapid"></div>';
  let mymap = L.map('mapid').setView([lat, lng], 13);
  let marker = L.marker([lat, lng]).addTo(mymap);
  marker.bindPopup(ip).openPopup();

  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      maxZoom: 18,
      id: JSON.parse(localStorage.getItem('darkMode'))
        ? 'mapbox/dark-v10'
        : 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoibWJlbGx5ZG8iLCJhIjoiY2tqb2E1anFmMGx2djJ2bzhpeDRkdHFyayJ9.DEAvUgh9QjI7vbAWdxHeaw',
    }
  ).addTo(mymap);
}

/**
 * Display the geolocation information in the output section.
 * @param {string} ip - The IP address.
 * @param {string} region - The region.
 * @param {string} timezone - The timezone.
 * @param {string} provider - The provider.
 * @param {string} country - The country code.
 */
function showOutput(ip, region, timezone, provider, country) {
  output.innerHTML = `
    <ul class="output-card">
      <li class="item">
        <h2>IP ADDRESS</h2>
        <p>${ip}</p>
      </li>
      <li class="item">
        <h2>LOCATION</h2>
        <p>${region}</p>
      </li>
      <li class="item">
        <h2>TIMEZONE</h2>
        <p>${timezone}</p>
      </li>
      <li class="item">
        <h2>Provider</h2>
        <p>${provider}</p>
      </li>
      <li class="item">
        <h2>Country</h2>
        <div class="country">
          <img src="https://flagcdn.com/w640/${country.toLowerCase()}.png" alt="">
        </div>
      </li>
    </ul>
  `;
}

/**
 * Handle fetch errors by displaying an error message.
 * @param {Error} error - The error object.
 * @param {string} message - The error message to display.
 */
function handleFetchError(error, message) {
  mapEl.style.display = 'none';
  output.style.display = 'none';
  errorContainer.style.display = 'block';
  errorMessage.textContent = error.messages || `${message}`;
}

// Event listeners
searchBtn.addEventListener('click', searchIP);

// Function to add an IP to local storage
function addToHistory(IP) {
  let history = JSON.parse(localStorage.getItem('ipHistory')) || [];

  // Check if the IP is not already in history
  if (!history.includes(IP)) {
    IP && history.push(IP);
    localStorage.setItem('ipHistory', JSON.stringify(history));

    // Update the history section
    updateHistorySection(history);
  }
}

// Function to update the history section
function updateHistorySection(history) {
  const historyList = document.querySelector('.history-list');
  historyList.innerHTML = '';

  history.forEach((ip) => {
    const listItem = document.createElement('li');
    listItem.classList.add('history-list-item');
    listItem.textContent = ip;

    // Add delete icon
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-trash-alt', 'delete-icon');
    deleteIcon.addEventListener('click', (e) => {
      // Remove the IP from history and stop the event from propagating
      e.stopPropagation();
      removeFromHistory(ip);
    });

    listItem.appendChild(deleteIcon);
    historyList.appendChild(listItem);

    // Add a click event listener only for displaying the IP in the input field
    listItem.addEventListener('click', () => {
      input.value = ip;
      searchIP(new Event('click'));
    });
  });
}

// Event listener for the form submission
searchBtn.addEventListener('click', function (e) {
  e.preventDefault();
  searchIP(e);
});

// Initial history section update
updateHistorySection(JSON.parse(localStorage.getItem('ipHistory')) || []);

function removeFromHistory(IP) {
  let history = JSON.parse(localStorage.getItem('ipHistory')) || [];
  history = history.filter((item) => item !== IP);
  localStorage.setItem('ipHistory', JSON.stringify(history));
  console.log(1, { history });
  // Update the history section
  updateHistorySection(history);
}

// Function to clear the entire history
function clearHistory() {
  localStorage.removeItem('ipHistory');
  updateHistorySection([]);
}

// Event listener for the clear history button
document
  .getElementById('clear-history-btn')
  .addEventListener('click', clearHistory);

// Function to toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
  initMap();
}

// Event listener for the dark mode toggle button
document
  .getElementById('toggle-dark-mode')
  .addEventListener('click', toggleDarkMode);

// Initial map initialization
initMap();

localStorage.setItem('darkMode', false);
