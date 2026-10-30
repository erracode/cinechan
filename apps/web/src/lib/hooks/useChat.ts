import { useState } from 'react';
import { sendMessage } from '../api';

export interface ChatMessage {
    id: string;
    role: 'user' | 'bot';
    content: string;
    audioText?: string;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const appendMessage = (role: 'user' | 'bot', content: string, audioText?: string) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString() + Math.random().toString(), role, content, audioText },
        ]);
    };

    const submitMessage = async (content: string) => {
        if (!content.trim()) return;

        appendMessage('user', content);
        setIsLoading(true);
        setError(null);

        try {
            const { response, audio_text } = await sendMessage(content);
            appendMessage('bot', response, audio_text);
            return { response, audio_text };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            appendMessage('bot', 'Lo siento, ha ocurrido un error al procesar tu mensaje. 🍿');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        error,
        submitMessage,
        setMessages
    };
}
