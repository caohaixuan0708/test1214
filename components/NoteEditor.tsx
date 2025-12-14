import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Check, X, Loader2, 
  Bold, Italic, Underline, 
  AlignLeft, List, Image as ImageIcon, 
  MoreHorizontal, Share, Cloud
} from 'lucide-react';
import { Note, PolishTone } from '../types';
import { polishText } from '../services/geminiService';

interface NoteEditorProps {
  note: Note;
  onUpdate: (updatedNote: Note) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setIsAiMenuOpen(false);
    setPolishError(null);
  }, [note.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        const now = Date.now();
        onUpdate({
          ...note,
          title,
          content,
          updatedAt: now
        });
        setLastSaved(now);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [title, content, note, onUpdate]);

  const handleAiPolish = async (tone: PolishTone) => {
    setIsAiMenuOpen(false);
    setIsPolishing(true);
    setPolishError(null);
    try {
      const polished = await polishText(content, tone);
      setContent(polished);
    } catch (err) {
      setPolishError("文本润色失败。");
    } finally {
      setIsPolishing(false);
    }
  };

  const ToolbarButton = ({ icon: Icon, active = false, onClick }: { icon: any, active?: boolean, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600 ${active ? 'bg-gray-100 text-black' : ''}`}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );

  const ToolbarDivider = () => <div className="w-[1px] h-5 bg-gray-200 mx-1" />;

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Header Row (Title & Meta) */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="无标题笔记"
              className="text-lg font-semibold text-gray-800 placeholder-gray-400 outline-none bg-transparent min-w-[200px]"
            />
            <span className="text-xs text-gray-400 flex items-center">
              <Cloud size={12} className="mr-1" />
              {title !== note.title || content !== note.content ? '保存中...' : '已保存'}
            </span>
        </div>
        <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded transition-colors">
                保存
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                <Share size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                <MoreHorizontal size={18} />
            </button>
        </div>
      </div>

      {/* Toolbar Row */}
      <div className="px-6 py-2 flex items-center border-b border-gray-100 bg-white sticky top-0 z-10 space-x-1">
        <ToolbarButton icon={Bold} />
        <ToolbarButton icon={Italic} />
        <ToolbarButton icon={Underline} />
        <ToolbarDivider />
        <ToolbarButton icon={AlignLeft} />
        <ToolbarButton icon={List} />
        <ToolbarDivider />
        
        {/* AI Button Group */}
        <div className="relative">
            <button 
                onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-purple-600 hover:bg-purple-50 transition-colors ${isPolishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isPolishing}
            >
                {isPolishing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span className="text-sm font-medium">AI 润色</span>
            </button>

             {/* AI Menu */}
            {isAiMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20">
                <button onClick={() => handleAiPolish('professional')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                    👔 专业语气
                </button>
                <button onClick={() => handleAiPolish('friendly')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                    🤝 友好语气
                </button>
                <button onClick={() => handleAiPolish('concise')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                    ✂️ 简洁明了
                </button>
                <button onClick={() => handleAiPolish('creative')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                    🎨 创意丰富
                </button>
                </div>
            )}
        </div>

        <ToolbarDivider />
        <ToolbarButton icon={ImageIcon} />
        <ToolbarButton icon={Check} />

        {polishError && (
          <span className="ml-auto text-xs text-red-500 flex items-center">
            <X size={12} className="mr-1" /> {polishError}
          </span>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30 flex justify-center">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在此输入内容..."
          className="w-full max-w-4xl p-10 bg-white min-h-[calc(100vh-140px)] shadow-sm outline-none text-lg leading-relaxed text-gray-800 font-sans resize-none mt-4 mb-8"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
