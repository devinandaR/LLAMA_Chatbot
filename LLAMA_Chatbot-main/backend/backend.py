from flask import Flask, request, jsonify
import requests
import groq
import random
from flask_cors import CORS  # Allows frontend to call backend
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# API KEYS
GROQ_API_KEY = "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"
WEATHER_API_KEY = "78a5d0136a279b3b5e6f69c7d8c260ad"

groq_client = groq.Client(api_key=GROQ_API_KEY)
chat_history = []  # Store chat context

def get_weather_data(location):
    BASE_URL = "http://api.openweathermap.org/data/2.5/forecast"
    
    try:
        response = requests.get(BASE_URL, params={
            "q": location, 
            "appid": WEATHER_API_KEY, 
            "units": "metric"
        })
        data = response.json()

        if data.get("cod") != "200":
            return {"error": "Invalid location or API issue"}

        # Get dates
        today = datetime.now()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        # Get current weather
        current_weather = data["list"][0]
        
        # Get tomorrow's weather (24 hours from now)
        tomorrow_weather = data["list"][8]  # Assuming 3-hour intervals
        
        # For yesterday's weather, you might need a different API endpoint
        yesterday_weather = {
            "temp": current_weather["main"]["temp"] - 2,  # Placeholder
            "condition": current_weather["weather"][0]["description"],
            "date": yesterday.strftime("%d %b")
        }

        weather_data = {
            "yesterday": yesterday_weather,
            "today": {
                "temp": current_weather["main"]["temp"],
                "condition": current_weather["weather"][0]["description"],
                "date": today.strftime("%d %b")
            },
            "tomorrow": {
                "temp": tomorrow_weather["main"]["temp"],
                "condition": tomorrow_weather["weather"][0]["description"],
                "date": tomorrow.strftime("%d %b")
            }
        }

        return weather_data
    
    except Exception as e:
        return {"error": f"Failed to fetch weather data: {str(e)}"}

def get_weather_emoji(condition):
    condition = condition.lower()
    weather_emojis = {
        'clear': '☀️',
        'sunny': '☀️',
        'cloudy': '☁️',
        'partly cloudy': '⛅',
        'rain': '🌧️',
        'light rain': '🌦️',
        'heavy rain': '⛈️',
        'thunderstorm': '⚡',
        'snow': '❄️',
        'mist': '🌫️',
        'fog': '🌫️',
        'haze': '🌫️'
    }
    
    for key in weather_emojis:
        if key in condition:
            return weather_emojis[key]
    return '🌈'

def get_temp_advice(temp):
    if temp > 30:
        return [
            "🧴 Don't forget your sunscreen! UV rays are strong today",
            "🕶️ Wear sunglasses and a hat for sun protection",
            "💧 Stay hydrated! Carry water with you",
            "👕 Light, breathable clothing recommended"
        ]
    elif temp > 20:
        return [
            "👕 Perfect weather for light layers!",
            "🚶‍♂️ Great conditions for outdoor activities",
            "🧴 Light sunscreen recommended"
        ]
    elif temp > 10:
        return [
            "🧥 Light jacket weather!",
            "👟 Good conditions for a walk or run",
            "☕ Enjoy some outdoor café time"
        ]
    else:
        return [
            "🧤 Don't forget gloves and a warm hat!",
            "🧣 Layer up with warm clothing",
            "☕ Perfect weather for hot drinks"
        ]

def generate_followup_question():
    questions = [
        "Would you like to check another location?",
        "Do you need advice on what to wear today?",
        "Want to know the best time for outdoor activities?",
        "Need recommendations for indoor activities based on the weather?"
    ]
    return random.choice(questions)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_input = data.get("message", "")
        
        if not user_input:
            return jsonify({
                "response": "😅 Please enter a message!",
                "weatherData": None
            })
        
        location = "Chennai"  # Default location
        if "in " in user_input:
            location = user_input.split("in ")[-1].strip().capitalize()
        
        print(f"Fetching weather data for: {location}")  # Debug log
        
        weather_data = get_weather_data(location)
        if "error" in weather_data:
            print(f"Weather API error: {weather_data['error']}")  # Debug log
            return jsonify({
                "response": f"😕 {weather_data['error']}. Please try another location!",
                "weatherData": None
            })
        
        # Add emojis to weather conditions
        for day in weather_data:
            weather_data[day]['emoji'] = get_weather_emoji(weather_data[day]['condition'])
        
        # Get advice based on today's temperature
        advice = get_temp_advice(weather_data['today']['temp'])
        
        # Create a friendly, point-wise response without using Groq
        response_points = [
            f"👋 Hey there! Here's the weather update for {location}!",
            f"\n📍 Current Weather ({weather_data['today']['date']}):",
            f"• Temperature: {weather_data['today']['temp']}°C {weather_data['today']['emoji']}",
            f"• Conditions: {weather_data['today']['condition'].capitalize()}",
            "\n💡 Based on the weather, here's what you should know:"
        ] + advice

        if abs(weather_data['today']['temp'] - weather_data['tomorrow']['temp']) > 5:
            response_points.append(f"\n⚠️ Heads up! Big temperature change tomorrow!")
        
        response_points.append(f"\n❓ {generate_followup_question()}")
        
        return jsonify({
            "response": "\n".join(response_points),
            "weatherData": weather_data
        })

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # Add detailed logging
        return jsonify({
            "response": "😅 Oops! I had trouble processing that request. Please make sure the backend server is running and try again!",
            "weatherData": None
        })

if __name__ == "__main__":
    app.run(debug=True)
