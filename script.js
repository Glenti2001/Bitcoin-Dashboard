let data = {
    labels: [],
    prices: [],
    lastPrice: null,
    historicalPrices: {
        "1min": null,
        "5min": null,
        "15min": null,
        "1hr": null,
        "24hr": null,
        "7d": null,
    }
};

let mainChart, sparklineChart;

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

ws.onmessage = (event) => {
    const tradeData = JSON.parse(event.data);
    const price = parseFloat(tradeData.p);
    updatePrice(price);
};

function updatePrice(newPrice) {
    if (data.lastPrice !== null) {
        const priceChange = ((newPrice - data.lastPrice) / data.lastPrice) * 100;
        updatePriceChangeDisplay(priceChange);
    }

    data.lastPrice = newPrice;
    updateMainPriceDisplay(newPrice);
    updateTimeBasedPrices(newPrice);
    updateChartsData(newPrice);
}

function updatePriceChangeDisplay(priceChange) {
    const changeElement = document.getElementById('priceChange');
    changeElement.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;
    changeElement.className = `change ${priceChange >= 0 ? 'positive' : 'negative'}`;
}

function updateMainPriceDisplay(price) {
    const priceDisplay = document.getElementById('bitcoinPrice');
    if (priceDisplay) {
        priceDisplay.textContent = `$${price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
}

function updateTimeBasedPrices(price) {
    data.historicalPrices["1min"] = price;
    document.getElementById('price1min').textContent = `$${price.toLocaleString()}`;
}

function updateChartsData(price) {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();

    data.labels.push(timeLabel);
    data.prices.push(price);

    if (data.labels.length > 100) {
        data.labels.shift();
        data.prices.shift();
    }

    if (mainChart) {
        mainChart.data.labels = data.labels;
        mainChart.data.datasets[0].data = data.prices;
        mainChart.update();
    }

    if (sparklineChart) {
        sparklineChart.data.labels = data.labels;
        sparklineChart.data.datasets[0].data = data.prices;
        sparklineChart.update();
    }
}

async function fetch24hHighLow() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        const data = await response.json();
        document.getElementById('priceHigh').textContent = `24h High: $${parseFloat(data.highPrice).toLocaleString()}`;
        document.getElementById('priceLow').textContent = `24h Low: $${parseFloat(data.lowPrice).toLocaleString()}`;
    } catch (error) {
        console.error('Error fetching 24h high/low:', error);
    }
}

async function fetchNews() {
    try {
        const response = await fetch('https://newsapi.org/v2/everything?q=bitcoin&apiKey=YOUR_API_KEY');
        const data = await response.json();
        const articles = data.articles.slice(0, 5);
        const newsContainer = document.getElementById('news');
        newsContainer.innerHTML = articles.map(article => `
            <div class="news-item">
                <a href="${article.url}" target="_blank">${article.title}</a>
                <p>${article.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

function initializeCharts() {
    const ctx = document.getElementById('bitcoinChart').getContext('2d');
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Bitcoin Price (USD)',
                data: data.prices,
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    display: true,
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    display: true
                }
            }
        }
    });

    const sparklineCtx = document.getElementById('priceSpark').getContext('2d');
    sparklineChart = new Chart(sparklineCtx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Bitcoin Price (Sparkline)',
                data: data.prices,
                borderColor: 'rgba(255, 152, 0, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

async function fetchHistoricalPrices() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60');
        const data = await response.json();
        const prices = data.map(item => parseFloat(item[4]));
        document.getElementById('price1min').textContent = `$${prices[prices.length - 1].toLocaleString()}`;
    } catch (error) {
        console.error('Error fetching historical prices:', error);
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

window.onload = () => {
    fetch24hHighLow();
    fetchNews();
    initializeCharts();
    fetchHistoricalPrices();
};