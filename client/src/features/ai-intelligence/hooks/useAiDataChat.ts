import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import aiApi from '../api/aiApi';
import { ChatMessage } from '../types/aiTypes';

export interface UseAiDataChatReturn {
  messages: ChatMessage[];
  isThinking: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

export const useAiDataChat = (surveyId: string, initialWelcome?: string): UseAiDataChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return initialWelcome
      ? [
          {
            id: 'welcome-1',
            role: 'assistant',
            content: initialWelcome,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      : [];
  });
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !surveyId) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      try {
        const historyPayload = messages.map((m) => ({
          role: m.role,
          content: m.content
        }));

        const response = await aiApi.chat(surveyId, text.trim(), historyPayload);

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error('AI chat failed:', err);
        toast.error(err.response?.data?.message || 'Failed to get answer from AI');
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an error querying the collector dataset. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [surveyId, messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isThinking,
    sendMessage,
    clearChat
  };
};

export default useAiDataChat;
