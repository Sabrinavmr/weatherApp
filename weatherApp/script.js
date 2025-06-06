document.addEventListener('DOMContentLoaded', () => {
    const API_KEY ="48a964a78aae4f58512fef203533fb5f";
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    const currentCity = document.getElementById('current-city');
    const currentTemp = document.getElementById('current-temp');
    const currentFeelsLike = document.getElementById('current-feels-like');
    const currentHumidity = document.getElementById('current-humidity');
    const currentWindSpeed = document.getElementById('current-wind-speed');
    const currentConditions = document.getElementById('current-conditions');
    const currentIcon = document.getElementById('current-icon');
    const forecastContainer = document.getElementById('forecast-container');

    // Function to fetch weather data
    async function getWeatherData(city) {
        if (!city) {
            alert('Please enter a city name.');
            return;
        }

        try {
            // Get coordinates for the city
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
            const geoResponse = await fetch(geoUrl);
            if (!geoResponse.ok) throw new Error(`HTTP error! status: ${geoResponse.status}`);
            const geoData = await geoResponse.json();

            if (geoData.length === 0) {
                alert('City not found. Please try again.');
                return;
            }

            const { lat, lon, name } = geoData[0];

            // Get current weather
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            const currentResponse = await fetch(currentWeatherUrl);
            if (!currentResponse.ok) throw new Error(`HTTP error! status: ${currentResponse.status}`);
            const currentWeatherData = await currentResponse.json();

            // Get 5-day forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) throw new Error(`HTTP error! status: ${forecastResponse.status}`);
            const forecastData = await forecastResponse.json();

            displayCurrentWeather(currentWeatherData, name);
            displayForecast(forecastData);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Could not retrieve weather data. Please check the city name or your API key.');
        }
    }

    // Function to display current weather
    function displayCurrentWeather(data, cityName) {
        currentCity.textContent = cityName;
        currentTemp.textContent = `${Math.round(data.main.temp)}°C`;
        currentFeelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        currentHumidity.textContent = `${data.main.humidity}%`;
        currentWindSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
        currentConditions.textContent = data.weather[0].description
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '); // Capitalize first letter of each word
        currentIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        currentIcon.alt = data.weather[0].main;
    }

    // Function to display 5-day forecast
    function displayForecast(data) {
        forecastContainer.innerHTML = ''; // Clear previous forecast

        // OpenWeatherMap forecast provides data every 3 hours.
        // We need to filter for one entry per day, ideally around noon.
        const dailyForecasts = [];
        const seenDates = new Set();

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toLocaleDateString(); // e.g., "6/7/2025"

            // Look for a forecast around midday (e.g., 12 PM - 3 PM) for each day
            if (!seenDates.has(dateString) && date.getHours() >= 11 && date.getHours() <= 14) {
                dailyForecasts.push(item);
                seenDates.add(dateString);
            }
        });

        // If fewer than 5 unique days with midday data, grab the first entry for each unique day
        // This ensures we always get 5 cards even if the data is sparse for midday
        if (dailyForecasts.length < 5) {
            const fallbackDailyForecasts = [];
            const fallbackSeenDates = new Set();
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateString = date.toLocaleDateString();
                if (!fallbackSeenDates.has(dateString)) {
                    fallbackDailyForecasts.push(item);
                    fallbackSeenDates.add(dateString);
                }
            });
            // Take the first 5 unique days
            dailyForecasts.length = 0; // Clear it
            dailyForecasts.push(...fallbackDailyForecasts.slice(0, 5));
        }


        dailyForecasts.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Fri"
            const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g., "Jun 7"

            const card = document.createElement('div');
            card.classList.add('forecast-card');
            card.innerHTML = `
                <h3>${dayName}, ${dateFormatted}</h3>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].main}">
                <p>Temp: ${Math.round(item.main.temp)}°C</p>
                <p>Humidity: ${item.main.humidity}%</p>
                <p>Conditions: ${item.weather[0].description
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}</p>
            `;
            forecastContainer.appendChild(card);
        });
    }

    // Event Listener for Search Button
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        getWeatherData(city);
    });

    // Event Listener for Enter key in input field
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchBtn.click(); // Simulate a click on the search button
        }
    });

    // Load weather for a default city on page load
    getWeatherData('Belgrano'); // Uses the current location from your prompt
});