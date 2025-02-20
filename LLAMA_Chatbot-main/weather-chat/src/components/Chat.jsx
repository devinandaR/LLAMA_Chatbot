import { useState, useEffect } from 'react';
import '../styles/Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  
  // Add this function or connect to your actual weather API
  const getWeatherForDate = async (location, date) => {
    // Implement your weather API call here
    // This is just a placeholder
    return {
      temperature: 20,
      conditions: "Sunny"
    };
  };

  const fetchWeatherData = async (location) => {
    try {
      // Fetch weather for yesterday, today, and tomorrow
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // You'll need to modify your weather API call to get data for all three days
      const weatherData = {
        yesterday: await getWeatherForDate(location, yesterday),
        today: await getWeatherForDate(location, new Date()),
        tomorrow: await getWeatherForDate(location, tomorrow)
      };

      return (
        <div className="weather-info">
          <div className="weather-day">
            <h3>Yesterday's Weather</h3>
            <p>Temperature: {weatherData.yesterday.temperature}°C</p>
            <p>Conditions: {weatherData.yesterday.conditions}</p>
          </div>
          
          <div className="weather-day">
            <h3>Today's Weather</h3>
            <p>Temperature: {weatherData.today.temperature}°C</p>
            <p>Conditions: {weatherData.today.conditions}</p>
          </div>
          
          <div className="weather-day">
            <h3>Tomorrow's Weather</h3>
            <p>Temperature: {weatherData.tomorrow.temperature}°C</p>
            <p>Conditions: {weatherData.tomorrow.conditions}</p>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return <div>Sorry, I couldn't fetch the weather information.</div>;
    }
  };

  const renderMessage = (message, isUser) => (
    <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
      {message}
    </div>
  );

  return (
    <div className="chat-container">
      {messages.map((msg, index) => renderMessage(msg.content, msg.isUser))}
      {/* Your input form here */}
    </div>
  );
};

export default Chat; 