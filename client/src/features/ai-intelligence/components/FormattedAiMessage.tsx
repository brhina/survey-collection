import React, { useState } from 'react';
import { Copy, Check, Sparkles, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormattedAiMessageProps {
  content: string;
  timestamp?: string;
}

export const FormattedAiMessage: React.FC<FormattedAiMessageProps> = ({ content, timestamp }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Parses inline formatting: **bold**, *italic*, `code`
  const renderInline = (text: string): React.ReactNode => {
    // Regex matches **bold**, `code`, *italic*
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={idx} className="italic text-slate-600 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Parses blocks: headers, lists, note callouts, standard paragraphs
  const renderBlocks = () => {
    const rawLines = content.split('\n');
    const blocks: React.ReactNode[] = [];
    let bulletBuffer: string[] = [];
    let numberBuffer: Array<{ num: string; text: string }> = [];

    const flushLists = (keyPrefix: string) => {
      if (bulletBuffer.length > 0) {
        blocks.push(
          <ul key={`${keyPrefix}-bullets`} className="space-y-1.5 my-2 pl-1">
            {bulletBuffer.map((bText, bIdx) => (
              <li key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                <span className="flex-1">{renderInline(bText)}</span>
              </li>
            ))}
          </ul>
        );
        bulletBuffer = [];
      }

      if (numberBuffer.length > 0) {
        blocks.push(
          <ol key={`${keyPrefix}-numbers`} className="space-y-2 my-2.5 pl-1">
            {numberBuffer.map((nItem, nIdx) => (
              <li key={nIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {nItem.num}
                </span>
                <span className="flex-1">{renderInline(nItem.text)}</span>
              </li>
            ))}
          </ol>
        );
        numberBuffer = [];
      }
    };

    rawLines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushLists(`line-${idx}`);
        return;
      }

      // Check for Note Callout: *(Note: ...)* or *Note:...
      if (trimmed.startsWith('*(Note:') || trimmed.startsWith('*Note:')) {
        flushLists(`line-${idx}`);
        const noteClean = trimmed.replace(/^\*\(/, '').replace(/\)\*$/, '').replace(/^\*/, '').replace(/\*$/, '');
        blocks.push(
          <div
            key={idx}
            className="my-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs"
          >
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-normal">{renderInline(noteClean)}</div>
          </div>
        );
        return;
      }

      // Headers: ### or ## or #
      if (trimmed.startsWith('#')) {
        flushLists(`line-${idx}`);
        const headerText = trimmed.replace(/^#+\s*/, '');
        blocks.push(
          <h4
            key={idx}
            className="text-xs sm:text-sm font-black text-slate-900 tracking-tight mt-3 mb-1.5 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {renderInline(headerText)}
          </h4>
        );
        return;
      }

      // Bullet List item: - or *
      if (/^[-*]\s+/.test(trimmed)) {
        const bulletText = trimmed.replace(/^[-*]\s+/, '');
        bulletBuffer.push(bulletText);
        return;
      }

      // Numbered List item: 1. or 2.
      const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numberMatch) {
        numberBuffer.push({ num: numberMatch[1], text: numberMatch[2] });
        return;
      }

      // Standard paragraph
      flushLists(`line-${idx}`);
      blocks.push(
        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal my-1">
          {renderInline(trimmed)}
        </p>
      );
    });

    flushLists('final');
    return blocks;
  };

  return (
    <div className="bg-white rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300">
      {/* Top Assistant Meta Bar */}
      <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Collector Intelligence</span>
        </div>

        <div className="flex items-center gap-2">
          {timestamp && <span className="text-[10px] text-slate-400">{timestamp}</span>}
          <button
            onClick={handleCopy}
            title="Copy answer"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Structured Content Area */}
      <div className="p-4 sm:p-4.5 space-y-1">
        {renderBlocks()}
      </div>
    </div>
  );
};

export default FormattedAiMessage;
