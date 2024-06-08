"use client";

import React, { useState } from 'react';
import axios from 'axios';

const Chatbot: React.FC = () => {
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<{ sender: string, message: string }[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleSendMessage = async () => {
        if (userMessage.trim() === '') return;

        const newChatHistory = [...chatHistory, { sender: 'user', message: userMessage }];
        setChatHistory(newChatHistory);

        try {
            const response = await axios.post('/api/chat', { messages: [{ role: 'user', content: userMessage }] });

            const reader = response.data.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let chunkValue = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                chunkValue += decoder.decode(value, { stream: !done });

                setChatHistory((prevHistory) => [
                    ...prevHistory.filter((chat) => chat.sender !== 'bot'),
                    { sender: 'bot', message: chunkValue },
                ]);
            }

            setUserMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div>
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)} 
                className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full z-50"
            >
                {isChatOpen ? 'Close Chat' : 'Open Chat'}
            </button>
            {isChatOpen && (
                <div className="fixed bottom-16 right-4 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
                    <div className="chat-history h-64 overflow-y-scroll border-b mb-4">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`my-2 ${chat.sender === 'user' ? 'text-right text-blue-500' : 'text-left text-green-500'}`}>
                                <p>{chat.message}</p>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input flex">
                        <input
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-2 border"
                        />
                        <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white">Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
