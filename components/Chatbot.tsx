

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGroq } from '../services/groqService';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'initial',
                sender: 'bot',
                text: '¡Hola! Soy tu asistente virtual de Ileana Martinez Real State, impulsado por Groq AI. ¿En qué puedo ayudarte hoy?'
            }]);
        }
    }, [isOpen]);

     useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: inputValue
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const botResponseText = await sendMessageToGroq(inputValue);
            const botMessage: ChatMessage = {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                text: botResponseText
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                sender: 'bot',
                text: 'Lo siento, no pude procesar tu mensaje. Intenta de nuevo.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-24 right-6 bg-ileana-navy w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-ileana-navy/90 transition-all duration-300 transform hover:scale-110 z-40 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                aria-label="Abrir chatbot"
            >
                <ChatIcon />
            </button>
            
            <div className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100%-3rem)] sm:w-96 h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {/* Header */}
                <div className="bg-ileana-navy text-white p-4 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Asistente Virtual</h3>
                        <p className="text-sm text-gray-300">Ileana Martinez Real State - Groq AI</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><CloseIcon /></button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'bot' && (
                                    <img
                                        src="/images/avatar_face.png"
                                        alt="Ileana Martinez Avatar"
                                        className="w-8 h-8 rounded-full border-2 border-ileana-orange flex-shrink-0"
                                    />
                                )}
                                <div className={`max-w-[75%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-ileana-navy text-white rounded-br-none' : 'bg-gray-200 text-ileana-navy rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="w-8 h-8 bg-ileana-orange rounded-full flex items-center justify-center flex-shrink-0">
                                        <UserIcon />
                                    </div>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start space-x-3 justify-start">
                                <img
                                    src="/images/avatar_face.png"
                                    alt="Ileana Martinez Avatar"
                                    className="w-8 h-8 rounded-full border-2 border-ileana-orange flex-shrink-0"
                                />
                               <div className="max-w-[75%] p-3 rounded-2xl bg-gray-200 text-ileana-navy rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-ileana-navy rounded-full animate-pulse delay-75"></span>
                                        <span className="w-2 h-2 bg-ileana-navy rounded-full animate-pulse delay-150"></span>
                                        <span className="w-2 h-2 bg-ileana-navy rounded-full animate-pulse delay-300"></span>
                                    </div>
                               </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white rounded-b-2xl">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-ileana-navy focus:border-transparent outline-none transition-shadow bg-white text-gray-800"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading} className="bg-ileana-navy text-white p-3 rounded-full hover:bg-ileana-navy/90 disabled:bg-gray-400 transition-colors">
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Chatbot;