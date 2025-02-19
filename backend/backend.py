from flask import Flask, request, jsonify
import requests
import groq
import random
from flask_cors import CORS  # Allows frontend to call backend

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# API KEYS
GROQ_API_KEY = "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"
WEATHER_API_KEY = "78a5d0136a279b3b5e6f69c7d8c260ad"

groq_client = groq.Client(api_key=GROQ_API_KEY)
chat_history = []  # Store chat context

def get_weather_data(location):
    BASE_URL = "http://api.openweathermap.org/data/2.5/weather"
    
    try:
        response = requests.get(BASE_URL, params={"q": location, "appid": WEATHER_API_KEY, "units": "metric"})
        data = response.json()

        if data.get("cod") != 200:
            return {"error": "Invalid location or API issue"}

        temp = data["main"]["temp"]
        condition = data["weather"][0]["description"].capitalize()

        return {"location": location, "temperature": f"{temp}°C", "condition": condition}
    
    except Exception as e:
        return {"error": f"Failed to fetch weather data: {str(e)}"}

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
    data = request.json
    user_input = data.get("message", "")
    
    location = "Chennai"  # Default location
    if "in " in user_input:
        location = user_input.split("in ")[-1].strip().capitalize()
    
    weather_data = get_weather_data(location)
    if "error" in weather_data:
        return jsonify({"response": weather_data["error"]})
    
    weather_summary = f"Weather in {weather_data['location']}: {weather_data['temperature']}, {weather_data['condition']}."

    chat_history.append({"user": user_input, "bot": weather_summary})
    
    groq_prompt = "\n".join([f"User: {entry['user']}\nBot: {entry['bot']}" for entry in chat_history])
    groq_prompt += f"\nUser: {user_input}\nProvide a helpful response."
    
    try:
        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": groq_prompt}],
        )
        bot_response = response.choices[0].message.content
        chat_history.append({"user": user_input, "bot": bot_response})

        return jsonify({"response": bot_response + " " + generate_followup_question()})
    except Exception as e:
        return jsonify({"response": f"Error generating response: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)
