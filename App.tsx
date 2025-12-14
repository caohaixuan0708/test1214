import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { TodoList } from './components/TodoList';
import { ViewMode, Note, TodoList as TodoListType, FolderType } from './types';
import { Menu, FileText, CheckSquare, X } from 'lucide-react';

// Mock Initial Data 测试合并分支
const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: '项目构思',
    content: '1. AI 记事本\n2. 带诗歌的天气应用\n3. 会评判你的预算追踪器\n\n需要查看 Gemini API 文档以了解润色功能。',
    updatedAt: Date.now()
  },
  {
    id: '2',
    title: '会议记录',
    content: '参会者：张三、李四、王五\n\n议题：\n- Q3 目标：提高用户留存率 5%。\n- 市场营销：在十月推出新活动。\n\n行动项：\n- 李四起草邮件。',
    updatedAt: Date.now() - 100000
  }
];

const INITIAL_TODOS: TodoListType[] = [
  {
    id: '1',
    title: '购物清单',
    items: [
      { id: '101', text: '牛奶', completed: false },
      { id: '102', text: '鸡蛋', completed: true },
      { id: '103', text: '全麦面包', completed: false }
    ],
    updatedAt: Date.now()
  },
  {
    id: '2',
    title: '周末计划',
    items: [
      { id: '201', text: '洗车', completed: false },
      { id: '202', text: '给妈妈打电话', completed: false }
    ],
    updatedAt: Date.now() - 200000
  }
];

const App: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<FolderType>('all_notes');
  const [viewMode, setViewMode] = useState<ViewMode>('notes'); // Actually editing mode
  
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [todos, setTodos] = useState<TodoListType[]>(INITIAL_TODOS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Initial selection
  useEffect(() => {
    if (!selectedId) {
       if (notes.length > 0) {
           setSelectedId(notes[0].id);
           setViewMode('notes');
           setCurrentFolder('all_notes');
       } else if (todos.length > 0) {
           setSelectedId(todos[0].id);
           setViewMode('todos');
           setCurrentFolder('all_todos');
       }
    }
  }, []);

  const handleCreate = (type: ViewMode) => {
    const newId = Date.now().toString();
    if (type === 'notes') {
      const newNote: Note = {
        id: newId,
        title: '',
        content: '',
        updatedAt: Date.now()
      };
      setNotes([newNote, ...notes]);
      setSelectedId(newId);
      setViewMode('notes');
      setCurrentFolder('all_notes');
    } else {
      const newList: TodoListType = {
        id: newId,
        title: '',
        items: [],
        updatedAt: Date.now()
      };
      setTodos([newList, ...todos]);
      setSelectedId(newId);
      setViewMode('todos');
      setCurrentFolder('all_todos');
    }
    setIsNewModalOpen(false);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleUpdateTodo = (updatedList: TodoListType) => {
    setTodos(todos.map(t => t.id === updatedList.id ? updatedList : t));
  };

  const handleSelect = (id: string, type: ViewMode) => {
      setSelectedId(id);
      setViewMode(type);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
  }

  const getSelectedContent = () => {
    if (viewMode === 'notes') {
      const note = notes.find(n => n.id === selectedId);
      if (!note) return null;
      return <NoteEditor note={note} onUpdate={handleUpdateNote} />;
    } else {
      const todo = todos.find(t => t.id === selectedId);
      if (!todo) return null;
      return <TodoList todoList={todo} onUpdate={handleUpdateTodo} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-apple-text font-sans">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 rounded-lg shadow-sm">
            <Menu size={20} />
         </button>
      </div>

      {/* Sidebar - responsive visibility */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}>
        <Sidebar
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          notes={notes}
          todos={todos}
          selectedId={selectedId}
          onSelect={handleSelect}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Main Content Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden bg-white w-full">
        {selectedId ? (
          getSelectedContent()
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <div className="text-6xl mb-4 opacity-30">📄</div>
            <p>选择一个文档以开始</p>
          </div>
        )}
      </main>

      {/* New Modal (Popover Style) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setIsNewModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-[600px] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">新建笔记</h2>
                    <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-4 gap-4">
                    <button 
                        onClick={() => handleCreate('notes')}
                        className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <FileText size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">空白文档</span>
                    </button>
                    
                    <button 
                        onClick={() => handleCreate('todos')}
                        className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-green-50 hover:border-green-200 border border-transparent transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-100 text-green-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <CheckSquare size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">待办清单</span>
                    </button>

                    {/* Placeholder for visual consistency with screenshot */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center mb-3">
                            <span className="font-bold">M</span>
                        </div>
                        <span className="text-sm font-medium text-gray-400">Markdown</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 rounded-lg opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 bg-orange-100 text-orange-400 rounded-lg flex items-center justify-center mb-3">
                           <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-400">流程图</span>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 text-xs text-gray-400 border-t border-gray-100">
                    更多功能开发中...
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;