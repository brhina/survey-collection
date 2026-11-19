import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Trash2, Loader2 } from 'lucide-react';
import { useAiDataChat } from '../hooks/useAiDataChat';
import Button from '../../../components/ui/Button';
import FormattedAiMessage from './FormattedAiMessage';

interface AiChatAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  surveyTitle: string;
  category: string;
}

export const AiChatAssistantDrawer: React.FC<AiChatAssistantDrawerProps> = ({
  isOpen,
  onClose,
  surveyId,
  surveyTitle,
  category
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const welcomeMessage = `Hello! I have analyzed the collected data for "${surveyTitle}" (${category}). Ask me any question regarding respondent feedback, scoring distributions, or operational insights.`;

  const { messages, isThinking, sendMessage, clearChat } = useAiDataChat(surveyId, welcomeMessage);

  const getSuggestedQuestions = () => {
    switch (category.toLowerCase()) {
      case 'inspection':
        return [
          'What are the most frequent safety violations?',
          'Which areas had the lowest compliance ratings?',
          'What immediate corrective actions are needed?'
        ];
      case 'application':
        return [
          'What are the strongest candidate qualifications?',
          'Why were candidates flagged for rejection?',
          'Suggest interview questions for borderline applicants.'
        ];
      case 'feedback':
        return [
          'What are users most dissatisfied with?',
          'What are the recurring feature requests?',
          'How does sentiment compare across cohorts?'
        ];
      case 'survey':
      default:
        return [
          'What are the key positive takeaways?',
          'Where is the greatest opinion polarization?',
          'Draft an email announcement to respondents.'
        ];
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;

    const query = inputText;
    setInputText('');
    await sendMessage(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-800/25 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                Collector Intelligence Assistant
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Data Interrogation • {surveyTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {msg.role === 'user' ? (
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-sm leading-relaxed bg-emerald-600 text-white shadow-2xs">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className="text-[9px] mt-1 text-right text-emerald-100">{msg.timestamp}</div>
                </div>
              ) : (
                <div className="max-w-[88%] flex-1">
                  <FormattedAiMessage content={msg.content} timestamp={msg.timestamp} />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-slate-200/80 text-slate-600 rounded-2xl rounded-tl-xs px-4 py-3 text-xs flex items-center gap-2.5 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="font-medium text-slate-700">Synthesizing insights from collector dataset...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block w-full mb-0.5">
              Suggested Questions:
            </span>
            {getSuggestedQuestions().map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything about this collector's data..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isThinking}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 disabled:bg-slate-50"
            />
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!inputText.trim() || isThinking}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiChatAssistantDrawer;
