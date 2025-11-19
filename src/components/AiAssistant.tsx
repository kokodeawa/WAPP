import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

interface AiAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    averageBudgetData: {
        averageTotalIncome: number;
        averageCategories: { id: string; name: string; amount: number; }[];
    }
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, averageBudgetData }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { sender: 'ai', text: '¡Hola! Soy tu asistente financiero. Basado en tus presupuestos anteriores, puedo ofrecerte consejos. ¿En qué puedo ayudarte hoy?' }
            ]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const formatBudgetDataForPrompt = () => {
        if (averageBudgetData.averageTotalIncome === 0) {
            return "El usuario aún no tiene presupuestos guardados. Responde amigablemente y anímale a crear uno para obtener análisis personalizados."
        }
        let budgetString = `Ingreso Total Promedio: $${averageBudgetData.averageTotalIncome.toFixed(2)}\n`;
        budgetString += "Distribución de Gastos Promedio:\n";
        averageBudgetData.averageCategories.forEach(cat => {
            if (cat.amount > 0) {
                budgetString += `- ${cat.name}: $${cat.amount.toFixed(2)}\n`;
            }
        });
        return budgetString;
    };
    
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        if (!navigator.onLine) {
            const offlineMessage: Message = { sender: 'ai', text: 'Necesito una conexión a la red para funcionar.' };
            setMessages(prev => [...prev, offlineMessage]);
            setIsLoading(false);
            return;
        }

        try {
            const budgetContext = formatBudgetDataForPrompt();
            const prompt = `Eres un asistente financiero amigable y útil. Analiza el presupuesto promedio del usuario y responde su pregunta de manera concisa, útil y fácil de entender. Usa markdown para formatear la respuesta si es necesario (listas, negritas). Aquí está el presupuesto:\n\n${budgetContext}\n\nPregunta del usuario: "${currentInput}"\n\nRespuesta:`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: Message = { sender: 'ai', text: 'Lo siento, he encontrado un problema. Por favor, intenta de nuevo más tarde.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
        >
            <div 
                className="bg-neutral-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col transform transition-all animate-fade-in-scale"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-neutral-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i> Asistente Financiero IA
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full active:bg-neutral-700" aria-label="Cerrar">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <span className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-solid fa-robot text-blue-400"></i>
                                </span>
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-neutral-700 text-neutral-200 rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                             <span className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                <i className="fa-solid fa-robot text-blue-400"></i>
                            </span>
                             <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-neutral-700 text-neutral-200 rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                             </div>
                         </div>
                    )}
                </div>

                <div className="p-4 border-t border-neutral-700 flex-shrink-0">
                    <div className="flex items-center gap-3 bg-neutral-700 rounded-xl">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ej: ¿Cómo puedo ahorrar en comida?"
                            className="w-full bg-transparent p-3 text-white focus:outline-none"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 text-white disabled:text-neutral-500 disabled:cursor-not-allowed">
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-scale {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};