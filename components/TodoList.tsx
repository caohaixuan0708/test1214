import React, { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle2, X } from 'lucide-react';
import { TodoList as TodoListType, TodoItem } from '../types';

interface TodoListProps {
  todoList: TodoListType;
  onUpdate: (updatedList: TodoListType) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todoList, onUpdate }) => {
  const [title, setTitle] = useState(todoList.title);
  const [items, setItems] = useState<TodoItem[]>(todoList.items);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    setTitle(todoList.title);
    setItems(todoList.items);
  }, [todoList.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
        onUpdate({
          ...todoList,
          title,
          items,
          updatedAt: Date.now()
        });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false
    };

    setItems([...items, newItem]);
    setNewItemText('');
  };

  const toggleItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const activeItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="列表名称"
          className="w-full text-3xl font-bold text-apple-text placeholder-gray-300 outline-none bg-transparent"
        />
        <div className="text-xs text-apple-blue font-medium mt-2">
          剩余 {activeItems.length} 项
        </div>
      </div>

      {/* Input Area */}
      <div className="px-8 pb-6">
        <form onSubmit={handleAddItem} className="relative">
          <Plus className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="添加新项目..."
            className="w-full bg-gray-50 text-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
          />
        </form>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-10">
        <div className="space-y-1">
          {activeItems.map((item) => (
            <div 
              key={item.id} 
              className="group flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              onClick={() => toggleItem(item.id)}
            >
              <button 
                className="text-gray-300 hover:text-apple-blue transition-colors mr-3"
              >
                <Circle size={22} strokeWidth={1.5} />
              </button>
              <span className="flex-1 text-lg text-gray-700">{item.text}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Completed Section */}
        {completedItems.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide px-3">已完成</h3>
            <div className="space-y-1">
              {completedItems.map((item) => (
                <div 
                  key={item.id} 
                  className="group flex items-center p-3 rounded-xl transition-colors cursor-pointer opacity-60 hover:opacity-100"
                  onClick={() => toggleItem(item.id)}
                >
                  <button 
                    className="text-apple-blue mr-3"
                  >
                    <CheckCircle2 size={22} className="fill-apple-blue text-white" />
                  </button>
                  <span className="flex-1 text-lg text-gray-400 line-through decoration-gray-300">{item.text}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};