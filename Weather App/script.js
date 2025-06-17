const apiKey = "YOUR_API_KEY"; // 🔑 Replace with your OpenWeatherMap API key
let currentCity = "";

// Function to fetch and display weather data
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const weatherBox = document.getElementById("weatherBox");
  const sound = document.getElementById("searchSound");

  if (!city) {
    weatherBox.innerHTML = "<p>Please enter a city name 🌆</p>";
    return;
  }

  sound.play(); // 🎵 play sound on search
  currentCity = city;
  weatherBox.innerHTML = `<p class="loading">⏳ Fetching weather data...</p>`;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();

    if (data.cod !== 200) {
      weatherBox.innerHTML = `<p>❌ City not found</p>`;
      return;
    }

    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const weatherType = data.weather[0].main.toLowerCase();
    updateBackground(weatherType);

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    const uvi = await fetchUV(data.coord.lat, data.coord.lon);
    const uvBadge = getUVBadge(uvi);

    weatherBox.innerHTML = `
      <img class="animated" src="${icon}" alt="${data.weather[0].description}">
      <p><strong>${data.name}, ${data.sys.country}</strong></p>
      <p>🌡️ Temp: ${data.main.temp}°C (Feels like: ${data.main.feels_like}°C)</p>
      <p>☁️ Weather: ${data.weather[0].main} - ${data.weather[0].description}</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌬️ Wind: ${data.wind.speed} m/s</p>
      <p>🌇 Sunrise: ${sunrise} | 🌆 Sunset: ${sunset}</p>
      <p class="badge ${uvBadge.class}">UV Index: ${uvi} (${uvBadge.label})</p>
    `;
  } catch (error) {
    console.error(error);
    weatherBox.innerHTML = "<p>⚠️ Error fetching data</p>";
  }
}

// Function to refresh weather for current city
function refreshWeather() {
  if (currentCity) {
    getWeather(currentCity);
  }
}

// Fetch UV index data
async function fetchUV(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    return data.value;
  } catch (err) {
    console.error("Failed to fetch UV index", err);
    return "N/A";
  }
}

// Get color-coded badge based on UV index value
function getUVBadge(value) {
  if (value < 3) return { label: "Low", class: "low" };
  if (value < 6) return { label: "Moderate", class: "moderate" };
  if (value < 8) return { label: "High", class: "high" };
  return { label: "Very High", class: "very-high" };
}

// Change background based on weather
function updateBackground(type) {
  document.body.className = document.body.className
    .replace(/(clear|clouds|rain|snow|thunderstorm)/g, "")
    .trim();

  if (["clear", "clouds", "rain", "snow", "thunderstorm"].includes(type)) {
    document.body.classList.add(type);
  }
}

// Toggle light/dark mode
document.getElementById("modeToggle").addEventListener("change", function () {
  document.body.classList.toggle("dark-mode");
  document.getElementById("modeLabel").innerText = this.checked
    ? "Dark Mode"
    : "Light Mode";
});

// Live date and time
function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById("datetime").textContent = `📅 ${formatted}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();
