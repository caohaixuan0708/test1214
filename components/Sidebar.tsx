import React, { useState } from 'react';
import { 
  Search, Plus, ChevronDown, ChevronRight, 
  FileText, CheckSquare, FolderOpen, Trash2, 
  Settings, User
} from 'lucide-react';
import { ViewMode, Note, TodoList, FolderType } from '../types';

interface SidebarProps {
  currentFolder: FolderType;
  setCurrentFolder: (folder: FolderType) => void;
  notes: Note[];
  todos: TodoList[];
  selectedId: string | null;
  onSelect: (id: string, type: ViewMode) => void;
  onOpenNewModal: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFolder,
  setCurrentFolder,
  notes,
  todos,
  selectedId,
  onSelect,
  onOpenNewModal,
  searchTerm,
  setSearchTerm
}) => {
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter items based on current folder view
  let displayItems: { id: string, title: string, updatedAt: number, type: ViewMode, desc?: string }[] = [];

  if (currentFolder === 'all_notes') {
    displayItems = notes
      .filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(n => ({ ...n, type: 'notes' as ViewMode, desc: n.content }));
  } else if (currentFolder === 'all_todos') {
    displayItems = todos
      .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(t => ({ ...t, type: 'todos' as ViewMode, desc: `${t.items.filter(i=>i.completed).length}/${t.items.length} 完成` }));
  }

  // Sort by updated recently
  displayItems.sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="w-full md:w-64 bg-[#F7F7F9] flex flex-col h-full border-r border-gray-200 text-[#1D1D1F]">
      {/* User Profile Mock */}
      <div className="p-4 flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <User className="text-gray-500" size={16} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">我的笔记</div>
          <div className="text-xs text-apple-blue cursor-pointer">开通会员</div>
        </div>
        <Settings size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      {/* New Button */}
      <div className="px-4 mb-2">
        <button
          onClick={onOpenNewModal}
          className="w-full bg-apple-blue hover:bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>新建</span>
        </button>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto mt-2">
        <div className="px-2">
           {/* Folder Header */}
           <div 
             className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-200/50 rounded-md"
             onClick={() => setIsFoldersExpanded(!isFoldersExpanded)}
           >
             {isFoldersExpanded ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
             我的文件夹
           </div>

           {/* Folder Items */}
           {isFoldersExpanded && (
             <div className="ml-2 mt-1 space-y-0.5">
               <button
                 onClick={() => setCurrentFolder('all_notes')}
                 className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                   currentFolder === 'all_notes' ? 'bg-[#E8E8ED] text-black font-medium' : 'text-gray-600 hover:bg-gray-200/50'
                 }`}
               >
                 <FileText size={16} className="text-blue-500" />
                 <span>所有笔记</span>
                 <span className="ml-auto text-xs text-gray-400">{notes.length}</span>
               </button>
               
               <button
                 onClick={() => setCurrentFolder('all_todos')}
                 className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                   currentFolder === 'all_todos' ? 'bg-[#E8E8ED] text-black font-medium' : 'text-gray-600 hover:bg-gray-200/50'
                 }`}
               >
                 <CheckSquare size={16} className="text-green-500" />
                 <span>待办清单</span>
                 <span className="ml-auto text-xs text-gray-400">{todos.length}</span>
               </button>
             </div>
           )}

           <div className="mt-4 pt-4 border-t border-gray-200/60">
             <div className="px-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                  <input 
                    type="text"
                    placeholder="搜索笔记..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white pl-8 pr-3 py-1.5 rounded-md border border-gray-200 text-xs focus:border-apple-blue focus:ring-1 focus:ring-apple-blue outline-none transition-all"
                  />
                </div>
             </div>
             
             {/* List of items in current folder */}
             <div className="mt-1 space-y-0.5 px-2">
                {displayItems.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-4">
                    无内容
                  </div>
                ) : (
                  displayItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onSelect(item.id, item.type)}
                      className={`group px-3 py-2.5 rounded-md cursor-pointer transition-all ${
                        selectedId === item.id ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-gray-200/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-medium truncate ${selectedId === item.id ? 'text-apple-blue' : 'text-gray-800'}`}>
                          {item.title || '无标题文档'}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                          {formatDate(item.updatedAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate h-4 leading-4">
                        {item.desc?.slice(0, 30).replace(/\n/g, ' ')}
                      </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
      
      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-500 flex items-center hover:text-gray-700 cursor-pointer transition-colors">
        <Trash2 size={14} className="mr-2" />
        回收站
      </div>
    </div>
  );
};