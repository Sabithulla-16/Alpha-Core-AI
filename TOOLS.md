# Real-Time Tools Integration

Your AI models now have access to real-time data through intelligent tool calling!

## 🔧 Available Tools

### 1. **Web Search** 🌐
- **Description**: Search the web for information using DuckDuckGo
- **Auto-Triggered**: Keywords like "search", "look up", "find", "what is", "who is"
- **Example**: "Search for information about AI safety"
- **Returns**: Top results with titles, snippets, and URLs

### 2. **Weather** 🌤️
- **Description**: Get current weather for any city using Open-Meteo API (no key needed)
- **Auto-Triggered**: Keywords like "weather", "temperature", "forecast", "rain", "sunny"
- **Example**: "What's the weather in London?"
- **Returns**: Temperature, humidity, weather condition, wind speed

### 3. **News** 📰
- **Description**: Get latest news from BBC News RSS
- **Auto-Triggered**: Keywords like "news", "headlines", "today", "current events"
- **Example**: "Tell me the latest AI news"
- **Returns**: Recent articles with titles and descriptions

### 4. **Stock Prices** 📈
- **Description**: Real-time stock market data
- **Auto-Triggered**: Keywords like "stock", "price", "$", "market", "trading"
- **Example**: "What's the price of Apple stock?"
- **Returns**: Current price, currency, market data

### 5. **Cryptocurrency** 💰
- **Description**: Real-time crypto prices using CoinGecko (free)
- **Auto-Triggered**: Keywords like "bitcoin", "ethereum", "crypto", "BTC", "ETH"
- **Example**: "What's the current Bitcoin price?"
- **Returns**: Price, market cap, 24h volume, price change

### 6. **Time & Timezone** ⏰
- **Description**: Current time in any timezone
- **Auto-Triggered**: Keywords like "time", "what time", "timezone"
- **Example**: "What time is it in Tokyo?"
- **Returns**: Time, date, day of week, timezone

### 7. **Calculator** 🧮
- **Description**: Safe mathematical expression evaluation
- **Auto-Triggered**: Keywords like "calculate", "math", "solve", "equation"
- **Example**: "Calculate 2^10 + sqrt(144)"
- **Returns**: Expression result

### 8. **URL Fetch** 📄
- **Description**: Fetch and summarize content from URLs
- **Auto-Triggered**: Keywords like "read", "fetch", "check link"
- **Example**: "Fetch and summarize https://example.com"
- **Returns**: Page content summary

### 9. **Currency Converter** 💱
- **Description**: Real-time currency exchange using ExchangeRate-API
- **Auto-Triggered**: Keywords like "convert", "exchange", "currency", "dollar"
- **Example**: "Convert 100 USD to EUR"
- **Returns**: Exchange rate, converted amount

### 10. **Wikipedia Search** 📚
- **Description**: Search Wikipedia for information
- **Auto-Triggered**: Keywords like "wiki", "wikipedia", "learn about", "tell me about"
- **Example**: "Tell me about the history of computers"
- **Returns**: Wikipedia article summaries

---

## 🚀 How It Works

### Automatic Tool Usage
1. **User sends message** → Backend analyzes keywords
2. **Tools detected** → Automatically executes relevant tools (up to 3 per query)
3. **Real data collected** → Tools gather live information
4. **Enhanced context** → Model receives tool results alongside the query
5. **Intelligent response** → Model generates answer using real-time data
6. **Tool indicators** → Chat displays which tools were used

### Example Flow

```
User: "What's the weather in Paris and Bitcoin price?"
                    ↓
Backend: Detects keywords → weather, bitcoin
                    ↓
Executes: get_weather(city="Paris") + get_crypto_price(crypto="bitcoin")
                    ↓
Returns: {"temperature": 15°C, "weather": "Cloudy"} + {"price": 42,500}
                    ↓
Model: "In Paris, it's currently 15°C and cloudy. Bitcoin is trading at $42,500..."
                    ↓
Chat shows: "🔧 Using tools: weather, crypto price"
```

---

## 🔌 API Endpoints

### Get Available Tools
```
GET /tools

Response:
{
  "tools": {
    "web_search": "Search the web for information",
    "weather": "Get current weather for a location",
    ...
  },
  "total": 10
}
```

### Execute Specific Tool
```
POST /execute-tool
Content-Type: application/json

Body:
{
  "tool": "weather",
  "params": {
    "city": "London"
  }
}

Response:
{
  "status": "success",
  "tool": "weather",
  "location": "London, United Kingdom",
  "temperature": 12,
  "humidity": 65,
  "weather": "Cloudy"
}
```

### Enhanced Chat with Tools
```
POST /chat
Content-Type: application/json

Body:
{
  "message": "What's the weather in NYC?",
  "model": "mistral",
  "use_tools": true,
  "tools": ["weather", "web_search"]  // Optional: specify which tools
}

Stream Response:
data: {"tools_used": ["weather"]}
data: {"token": "It"}
data: {"token": "'s"}
...
data: [DONE]
```

---

## 💡 Configuration

### Enable/Disable Tools
In chat request, set `use_tools` to enable/disable:
```json
{
  "message": "Your query",
  "use_tools": true     // Enable tool calling
}
```

### Select Specific Tools
```json
{
  "message": "Your query",
  "tools": ["weather", "calculator"]  // Only use these tools
}
```

### Tool Keywords
The system automatically detects tool usage based on keywords:

| Tool | Keywords |
|------|----------|
| web_search | search, look up, find, google, what is, who is, latest |
| weather | weather, temperature, forecast, rain, sunny, climate |
| news | news, headlines, today, current events |
| stock_price | stock, price, $, market, trading |
| crypto_price | bitcoin, ethereum, crypto, digital, btc, eth |
| time | time, what time, current time, timezone |
| calculator | calculate, math, solve, equation, plus, minus |
| currency_convert | convert, exchange, currency, dollar, euro |
| wikipedia | wiki, wikipedia, learn about, tell me about |

---

## 📊 Real-Time Data Sources

All tools use **free, public APIs** with no authentication required:

| Tool | Data Source | Response Time |
|------|-------------|----------------|
| Web Search | DuckDuckGo | ~2-3 seconds |
| Weather | Open-Meteo | ~1-2 seconds |
| Crypto | CoinGecko | ~1-2 seconds |
| Currency | ExchangeRate-API | ~1-2 seconds |
| Wikipedia | Wikipedia API | ~1-2 seconds |

---

## ⚡ Performance

- **Tool detection**: <100ms
- **Tool execution**: 1-3 seconds per tool
- **Model response**: Unchanged (uses tool data in context)
- **Total response time**: 2-5 seconds typical

### Example Timing:
```
Message sent: 0ms
Tool detection: 50ms
Tool execution: 2 seconds
Model inference: 3 seconds
Response received: 5 seconds
```

---

## 🎯 Best Practices

1. **Specific Queries**: More specific queries → More accurate tool selection
   - ✅ Good: "What is Bitcoin's price today?"
   - ❌ Vague: "Tell me about crypto"

2. **Tool Combinations**: Multiple tools work together
   - Example: "Weather in London + USD to GBP conversion"
   - Uses: weather + currency_convert

3. **Real-Time Updates**: Tools fetch fresh data every request
   - No caching (always current)
   - Useful for: prices, weather, news

4. **Fallback Behavior**: If a tool fails, model responds anyway
   - Graceful degradation
   - Non-blocking errors

---

## 🚀 Usage Examples

### Weather Query
```
User: "Should I bring an umbrella to Paris tomorrow?"
Tools Used: weather
Response: "Based on the Paris forecast with 60% chance of rain, yes, bring an umbrella!"
```

### Financial Query
```
User: "Convert 500 EUR to JPY and check Intel stock price"
Tools Used: currency_convert, stock_price
Response: "€500 is approximately ¥75,000. Intel is trading at $38.50 per share."
```

### Knowledge Query
```
User: "Tell me about quantum computing"
Tools Used: web_search, wikipedia
Response: "Quantum computing uses quantum bits (qubits)... [Real-time definitions]"
```

### Math Query
```
User: "Calculate the area of a circle with radius 5"
Tools Used: calculator
Response: "Area = πr² = 3.14159 × 25 = 78.54 square units"
```

---

## 🔒 Privacy & Security

- **No API keys required** for most tools
- **Local processing**: All computations happen on your PC
- **No data logging**: Queries aren't stored on external servers (except API responses)
- **Safe evaluation**: Calculator uses sandboxed execution

---

## 🐛 Troubleshooting

### Tool Not Executing
- Check keywords in your query
- Verify internet connection
- Try explicit tool execution: POST /execute-tool

### Slow Response
- Tool execution is slower ~2-3s per tool
- Normal for network requests
- Consider disabling tools: `"use_tools": false`

### Wrong Tool Selected
- Use POST /execute-tool to run specific tool
- Or disable unwanted tools: `"tools": ["web_search"]`

---

## 🚀 Future Enhancements

Potential tools to add:
- 🎬 YouTube video search
- 🏨 Hotel/flight search
- 📧 Gmail integration
- 🐙 GitHub API integration
- 📚 Academic paper search
- 🎵 Music search (Spotify)
- 🗺️ Map/location services
- 🎮 Game database search
