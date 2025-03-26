A simple, real-time Bitcoin (BTC) price tracker built to display the latest market value of Bitcoin in USD.

🚀 Features
Live price updates via Binance WebSocket
24h high/low and 1-minute historical data (Binance API)
Interactive charts (Chart.js)
Dark/light mode toggle

🛠️ Tech Stack
Frontend: JavaScript (Vanilla)
APIs: Binance (WebSocket + REST), NewsAPI (optional)
Charts: Chart.js
Styling: CSS

🔌 Data Sources
Real-time price: wss://stream.binance.com:9443/ws/btcusdt@trade
24h stats: https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT
