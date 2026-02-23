import requests
import json
from typing import Any, Dict, List, Optional
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

class ToolExecutor:
    """Execute external tools to provide real-time data to models"""
    
    def __init__(self):
        self.tools = {
            "web_search": self.web_search,
            "weather": self.get_weather,
            "news": self.get_news,
            "stock_price": self.get_stock_price,
            "crypto_price": self.get_crypto_price,
            "time": self.get_time,
            "calculator": self.calculator,
            "url_fetch": self.fetch_url,
            "currency_convert": self.currency_convert,
            "wikipedia": self.wikipedia_search,
        }
        
    def execute_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Execute a tool and return result"""
        try:
            if tool_name not in self.tools:
                return {
                    "status": "error",
                    "tool": tool_name,
                    "message": f"Tool '{tool_name}' not found"
                }
            
            logger.info(f"Executing tool: {tool_name} with args: {kwargs}")
            result = self.tools[tool_name](**kwargs)
            result["tool"] = tool_name
            result["status"] = "success"
            return result
        except Exception as e:
            logger.error(f"Tool execution error: {str(e)}")
            return {
                "status": "error",
                "tool": tool_name,
                "message": str(e)
            }

    def web_search(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """Search the web using DuckDuckGo"""
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            params = {
                'q': query,
                'format': 'json',
                'no_redirect': '1',
                'no_html': '1',
                'skip_disambig': '1'
            }
            response = requests.get(
                'https://api.duckduckgo.com/',
                params=params,
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            results = []
            
            # Get instant answer if available
            if data.get('AbstractText'):
                results.append({
                    "title": "Direct Answer",
                    "snippet": data['AbstractText'],
                    "url": data.get('AbstractURL', '')
                })
            
            # Get related topics
            for topic in data.get('RelatedTopics', [])[:max_results]:
                if 'Text' in topic:
                    results.append({
                        "title": topic.get('FirstURL', '').split('/')[-1],
                        "snippet": topic['Text'],
                        "url": topic.get('FirstURL', '')
                    })
            
            return {
                "query": query,
                "results": results[:max_results],
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Web search failed: {str(e)}")

    def get_weather(self, city: str, units: str = "metric") -> Dict[str, Any]:
        """Get current weather using Open-Meteo (no API key needed)"""
        try:
            # Clean city name - remove common phrases
            clean_city = city.replace("right now", "").replace("currently", "").replace("now", "").strip()
            # Extract just the city name (usually first word or two)
            clean_city = " ".join(clean_city.split()[:2])
            
            if not clean_city or len(clean_city) < 2:
                clean_city = "London"  # Default fallback
            
            # First get coordinates from city name
            geo_params = {
                'name': clean_city,
                'count': 1,
                'language': 'en',
                'format': 'json'
            }
            geo_response = requests.get(
                'https://geocoding-api.open-meteo.com/v1/search',
                params=geo_params,
                timeout=10
            )
            geo_response.raise_for_status()
            geo_data = geo_response.json()
            
            if not geo_data.get('results'):
                raise Exception(f"City '{clean_city}' not found")
            
            location = geo_data['results'][0]
            latitude = location['latitude']
            longitude = location['longitude']
            city_name = location['name']
            country = location.get('country', '')
            
            # Get weather data
            weather_params = {
                'latitude': latitude,
                'longitude': longitude,
                'current': 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
                'temperature_unit': 'Celsius' if units == 'metric' else 'Fahrenheit',
                'timezone': 'auto'
            }
            
            weather_response = requests.get(
                'https://api.open-meteo.com/v1/forecast',
                params=weather_params,
                timeout=10
            )
            weather_response.raise_for_status()
            weather_data = weather_response.json()
            
            current = weather_data['current']
            
            weather_codes = {
                0: 'Clear sky',
                1: 'Mainly clear',
                2: 'Partly cloudy',
                3: 'Overcast',
                45: 'Foggy',
                48: 'Foggy (rime)',
                51: 'Light drizzle',
                53: 'Moderate drizzle',
                55: 'Dense drizzle',
                61: 'Slight rain',
                63: 'Moderate rain',
                65: 'Heavy rain',
                80: 'Slight rain showers',
                81: 'Moderate rain showers',
                82: 'Violent rain showers',
                85: 'Slight snow showers',
                86: 'Heavy snow showers',
                95: 'Thunderstorm'
            }
            
            return {
                "location": f"{city_name}, {country}",
                "coordinates": {"latitude": latitude, "longitude": longitude},
                "temperature": current['temperature_2m'],
                "humidity": current['relative_humidity_2m'],
                "weather": weather_codes.get(current['weather_code'], 'Unknown'),
                "wind_speed": current['wind_speed_10m'],
                "units": 'Celsius' if units == 'metric' else 'Fahrenheit',
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Weather fetch failed: {str(e)}")

    def get_news(self, query: str = "latest", max_results: int = 5) -> Dict[str, Any]:
        """Get news using NewsAPI alternative"""
        try:
            # Using a free news source approach
            headers = {'User-Agent': 'Mozilla/5.0'}
            
            # Try multiple news sources
            news_results = []
            
            # BBC News RSS feed (no API key needed)
            try:
                response = requests.get(
                    'https://feeds.bbci.co.uk/news/rss.xml',
                    headers=headers,
                    timeout=10
                )
                if response.status_code == 200:
                    # Parse basic XML (simplified)
                    import xml.etree.ElementTree as ET
                    root = ET.fromstring(response.content)
                    
                    for item in root.findall('.//item')[:max_results]:
                        title = item.findtext('title', '')
                        description = item.findtext('description', '')
                        link = item.findtext('link', '')
                        
                        if query.lower() in title.lower() or query.lower() == 'latest':
                            news_results.append({
                                "title": title,
                                "description": description[:200],
                                "url": link,
                                "source": "BBC News"
                            })
            except:
                pass
            
            if not news_results:
                # Fallback: Return general information
                news_results = [{
                    "title": "Unable to fetch real-time news",
                    "description": "News API temporarily unavailable. Try web_search tool for latest information.",
                    "url": "",
                    "source": "Fallback"
                }]
            
            return {
                "query": query,
                "articles": news_results[:max_results],
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"News fetch failed: {str(e)}")

    def get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """Get stock price using yfinance alternative"""
        try:
            # Using Yahoo Finance alternative (finnhub or alpha vantage would need key)
            headers = {'User-Agent': 'Mozilla/5.0'}
            
            # Try to get from multiple sources
            response = requests.get(
                f'https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}',
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'quoteSummary' in data and data['quoteSummary']['result']:
                    result = data['quoteSummary']['result'][0]
                    price_data = result.get('price', {})
                    
                    return {
                        "symbol": symbol,
                        "price": price_data.get('regularMarketPrice', {}).get('raw'),
                        "currency": price_data.get('currency'),
                        "timestamp": datetime.now().isoformat()
                    }
            
            raise Exception(f"Could not fetch price for {symbol}")
        except Exception as e:
            raise Exception(f"Stock price fetch failed: {str(e)}")

    def get_crypto_price(self, crypto: str = "bitcoin", currency: str = "usd") -> Dict[str, Any]:
        """Get cryptocurrency price using CoinGecko (free, no API key)"""
        try:
            crypto_map = {
                "bitcoin": "bitcoin",
                "btc": "bitcoin",
                "ethereum": "ethereum",
                "eth": "ethereum",
                "cardano": "cardano",
                "ada": "cardano",
                "solana": "solana",
                "sol": "solana",
            }
            
            crypto_id = crypto_map.get(crypto.lower(), crypto.lower())
            
            response = requests.get(
                f'https://api.coingecko.com/api/v3/simple/price',
                params={
                    'ids': crypto_id,
                    'vs_currencies': currency,
                    'include_market_cap': 'true',
                    'include_24hr_vol': 'true',
                    'include_market_cap_change_24h': 'true'
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if crypto_id not in data:
                raise Exception(f"Crypto '{crypto}' not found")
            
            crypto_data = data[crypto_id]
            
            return {
                "cryptocurrency": crypto.upper(),
                "price": crypto_data.get(currency.lower()),
                "market_cap": crypto_data.get(f'{currency.lower()}_market_cap'),
                "volume_24h": crypto_data.get(f'{currency.lower()}_24h_vol'),
                "change_24h": crypto_data.get(f'{currency.lower()}_market_cap_change_24h'),
                "currency": currency.upper(),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Crypto price fetch failed: {str(e)}")

    def get_time(self, timezone: str = "UTC") -> Dict[str, Any]:
        """Get current time in timezone"""
        try:
            from datetime import timedelta, timezone as tz
            
            # Simple timezone support
            timezones = {
                "UTC": tz.utc,
                "EST": tz(timedelta(hours=-5)),
                "PST": tz(timedelta(hours=-8)),
                "CET": tz(timedelta(hours=1)),
                "IST": tz(timedelta(hours=5, minutes=30)),
                "JST": tz(timedelta(hours=9)),  # Japan
                "AEST": tz(timedelta(hours=10)),  # Australia
            }
            
            tz_offset = timezones.get(timezone.upper(), tz.utc)
            current_time = datetime.now(tz_offset)
            
            return {
                "timezone": timezone.upper(),
                "time": current_time.strftime("%H:%M:%S"),
                "date": current_time.strftime("%Y-%m-%d"),
                "iso_format": current_time.isoformat(),
                "day_of_week": current_time.strftime("%A")
            }
        except Exception as e:
            raise Exception(f"Time fetch failed: {str(e)}")

    def calculator(self, expression: str) -> Dict[str, Any]:
        """Safely evaluate mathematical expressions"""
        try:
            import math
            
            # Safe evaluation with allowed functions
            safe_dict = {
                'sin': math.sin,
                'cos': math.cos,
                'tan': math.tan,
                'sqrt': math.sqrt,
                'pi': math.pi,
                'e': math.e,
                'log': math.log,
                'log10': math.log10,
                'pow': pow,
                'abs': abs,
                'round': round,
            }
            
            result = eval(expression, {"__builtins__": {}}, safe_dict)
            
            return {
                "expression": expression,
                "result": result,
                "result_type": type(result).__name__
            }
        except Exception as e:
            raise Exception(f"Calculation failed: {str(e)}")

    def fetch_url(self, url: str, timeout: int = 10) -> Dict[str, Any]:
        """Fetch and summarize content from URL"""
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            
            # Extract text from HTML
            from html.parser import HTMLParser
            
            class SimpleHTMLParser(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.text = []
                    self.in_script = False
                    self.in_style = False
                
                def handle_starttag(self, tag, attrs):
                    if tag in ['script', 'style']:
                        self.in_script = True
                
                def handle_endtag(self, tag):
                    if tag in ['script', 'style']:
                        self.in_script = False
                
                def handle_data(self, data):
                    if not self.in_script:
                        text = data.strip()
                        if text:
                            self.text.append(text)
            
            parser = SimpleHTMLParser()
            parser.feed(response.text)
            
            content = ' '.join(parser.text)[:1000]  # Limit to 1000 chars
            
            return {
                "url": url,
                "status_code": response.status_code,
                "content_length": len(response.text),
                "summary": content,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"URL fetch failed: {str(e)}")

    def currency_convert(self, amount: float, from_currency: str, to_currency: str) -> Dict[str, Any]:
        """Convert between currencies using ExchangeRate-API"""
        try:
            response = requests.get(
                f'https://api.exchangerate-api.com/v4/latest/{from_currency.upper()}',
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if to_currency.upper() not in data['rates']:
                raise Exception(f"Currency '{to_currency}' not found")
            
            rate = data['rates'][to_currency.upper()]
            converted = amount * rate
            
            return {
                "amount": amount,
                "from_currency": from_currency.upper(),
                "to_currency": to_currency.upper(),
                "exchange_rate": rate,
                "converted_amount": round(converted, 2),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Currency conversion failed: {str(e)}")

    def wikipedia_search(self, query: str, max_results: int = 3) -> Dict[str, Any]:
        """Search Wikipedia"""
        try:
            response = requests.get(
                'https://en.wikipedia.org/w/api.php',
                params={
                    'action': 'query',
                    'list': 'search',
                    'srsearch': query,
                    'format': 'json',
                    'srlimit': max_results
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            results = []
            for item in data['query']['search']:
                results.append({
                    "title": item['title'],
                    "snippet": item['snippet'],
                    "url": f"https://en.wikipedia.org/wiki/{item['title'].replace(' ', '_')}"
                })
            
            return {
                "query": query,
                "results": results,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Wikipedia search failed: {str(e)}")

    def get_available_tools(self) -> Dict[str, str]:
        """Get list of available tools and their descriptions"""
        return {
            "web_search": "Search the web for information",
            "weather": "Get current weather for a location",
            "news": "Get latest news articles",
            "stock_price": "Get current stock price",
            "crypto_price": "Get cryptocurrency prices",
            "time": "Get current time in timezone",
            "calculator": "Evaluate mathematical expressions",
            "url_fetch": "Fetch and summarize URL content",
            "currency_convert": "Convert between currencies",
            "wikipedia": "Search Wikipedia for information"
        }

# Create global tool executor instance
tool_executor = ToolExecutor()
