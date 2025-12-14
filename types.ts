export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoList {
  id: string;
  title: string;
  items: TodoItem[];
  updatedAt: number;
}

export type ViewMode = 'notes' | 'todos';
export type FolderType = 'all_notes' | 'all_todos' | 'trash';

export type PolishTone = 'professional' | 'concise' | 'friendly' | 'creative';

export interface AIResponseState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}