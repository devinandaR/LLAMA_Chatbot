import React, { useState } from 'react';
import './WeatherChat.css';

const WeatherWeatherDay = ({ data, type }) => (
    <div className={`weather-day ${type === 'today' ? 'current' : ''}`}>
        <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
        <p className="date">{data.date}</p>
        <div className="weather-content">
            <p className="emoji">{data.emoji}</p>
            <p className="temp">{data.temp}°C</p>
            <p className="condition">{data.condition}</p>
        </div>
    </div>
);

const WeatherComparison = ({ weatherData }) => (
    <div className="weather-grid">
        <WeatherWeatherDay data={weatherData.yesterday} type="yesterday" />
        <WeatherWeatherDay data={weatherData.today} type="today" />
        <WeatherWeatherDay data={weatherData.tomorrow} type="tomorrow" />
    </div>
);

const WeatherChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check if there are any messages
    const hasMessages = messages.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = { type: 'user', content: inputMessage };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputMessage }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data) {
                throw new Error('No data received from server');
            }

            const botMessage = {
                type: 'bot',
                content: data.response,
                weatherData: data.weatherData
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                type: 'bot',
                content: error.message === 'Failed to fetch' 
                    ? '😕 Cannot connect to the server. Please make sure the backend is running!'
                    : '😅 Sorry, I had trouble getting that information. Please try again!'
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        setInputMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className={`chat-container ${hasMessages ? 'has-messages' : ''}`}>
            <div className="chat-header">
                <div className="logo"></div>
                <h1>How can I help you today?</h1>
                <p>Ask me about the weather in any city!</p>
            </div>

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        <div className="message-content">
                            {message.content}
                            {message.weatherData && (
                                <WeatherComparison weatherData={message.weatherData} />
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot">
                        <div className="message-content">
                            <p>🤔 Thinking...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="input-container">
                <div className="input-wrapper">
                    <div className="ai-icon"></div>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your prompt here..."
                        disabled={isLoading}
                    />
                    <button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        <span className="send-icon">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeatherChat; 