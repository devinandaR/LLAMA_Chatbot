import React, { useState } from 'react';
import './WeatherChat.css';

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

            const data = await response.json();
            const botMessage = { type: 'bot', content: data.response };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { type: 'bot', content: 'Sorry, there was an error processing your request.' };
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
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot">
                        <div className="message-content">
                            Thinking...
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