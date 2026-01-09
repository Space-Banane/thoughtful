import type { FormEvent } from "react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, Rocket, BookOpen, Heart, Code, Palette, Music, Camera, Zap, Star, Trophy, Target, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import type { Note, TodoList, TodoItem, Resource } from "~/services/notebook";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note;
  onSave: (note: Partial<Note>) => void;
}

const iconOptions: { icon: LucideIcon; name: string }[] = [
  { icon: Lightbulb, name: "Lightbulb" },
  { icon: Rocket, name: "Rocket" },
  { icon: BookOpen, name: "Book" },
  { icon: Heart, name: "Heart" },
  { icon: Code, name: "Code" },
  { icon: Palette, name: "Palette" },
  { icon: Music, name: "Music" },
  { icon: Camera, name: "Camera" },
  { icon: Zap, name: "Zap" },
  { icon: Star, name: "Star" },
  { icon: Trophy, name: "Trophy" },
  { icon: Target, name: "Target" },
];

export default function NoteModal({ isOpen, onClose, note, onSave }: NoteModalProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [description, setDescription] = useState(note?.description || "");
  const [tags, setTags] = useState(note?.tags.join(", ") || "");
  const [selectedIcon, setSelectedIcon] = useState<LucideIcon>(note?.icon || Lightbulb);
  const [todos, setTodos] = useState<TodoList[]>(note?.todos || []);
  const [resources, setResources] = useState<Resource[]>(note?.resources || []);

  const addTodoList = () => {
    if (todos.length < 5) {
      setTodos([...todos, { id: crypto.randomUUID(), title: "", items: [] }]);
    }
  };

  const removeTodoList = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const updateTodoListTitle = (id: string, title: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, title } : todo));
  };

  const addTodoItem = (listId: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === listId && todo.items.length < 100) {
        return {
          ...todo,
          items: [...todo.items, { id: crypto.randomUUID(), text: "", completed: false }]
        };
      }
      return todo;
    }));
  };

  const removeTodoItem = (listId: string, itemId: string) => {
    setTodos(todos.map(todo => 
      todo.id === listId 
        ? { ...todo, items: todo.items.filter(item => item.id !== itemId) }
        : todo
    ));
  };

  const updateTodoItem = (listId: string, itemId: string, text: string) => {
    setTodos(todos.map(todo => 
      todo.id === listId 
        ? { 
            ...todo, 
            items: todo.items.map(item => item.id === itemId ? { ...item, text } : item) 
          }
        : todo
    ));
  };

  const toggleTodoItem = (listId: string, itemId: string) => {
    setTodos(todos.map(todo => 
      todo.id === listId 
        ? { 
            ...todo, 
            items: todo.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item) 
          }
        : todo
    ));
  };

  const addResource = () => {
    setResources([...resources, { name: "", link: "" }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, field: 'name' | 'link', value: string) => {
    setResources(resources.map((resource, i) => 
      i === index ? { ...resource, [field]: value } : resource
    ));
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const parsedTags = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    
    if (parsedTags.length > 5) {
      alert("Maximum 5 tags allowed");
      return;
    }
    
    const noteData: Partial<Note> = {
      id: note?.id || Date.now().toString(),
      title,
      description,
      tags: parsedTags,
      icon: selectedIcon,
      todos: todos.filter(todo => todo.title.trim()),
      resources: resources.filter(resource => resource.name.trim() && resource.link.trim()),
      updatedAt: new Date(),
      createdAt: note?.createdAt || new Date(),
    };
    
    onSave(noteData);
    handleClose();
  };
  
  const handleClose = () => {
    setTitle(note?.title || "");
    setDescription(note?.description || "");
    setTags(note?.tags.join(", ") || "");
    setSelectedIcon(note?.icon || Lightbulb);
    setTodos(note?.todos || []);
    setResources(note?.resources || []);
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={note ? "Edit Note" : "New Note"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            placeholder="Enter note title..."
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none"
            placeholder="Describe your idea..."
            required
          />
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            placeholder="design, mobile, ui/ux (comma separated)"
          />
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">Separate tags with commas (max 5)</p>
        </div>
        
        {/* Icon Selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
            Icon
          </label>
          <div className="grid grid-cols-6 gap-3">
            {iconOptions.map(({ icon: Icon, name }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedIcon(Icon)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedIcon === Icon
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
                }`}
                title={name}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Todo Lists */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Todo Lists (max 5)
            </label>
            <button
              type="button"
              onClick={addTodoList}
              disabled={todos.length >= 5}
              className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add List
            </button>
          </div>
          <div className="space-y-4">
            {todos.map((todoList) => (
              <div key={todoList.id} className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={todoList.title}
                    onChange={(e) => updateTodoListTitle(todoList.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    placeholder="List title..."
                  />
                  <button
                    type="button"
                    onClick={() => removeTodoList(todoList.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 mb-2">
                  {todoList.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTodoItem(todoList.id, item.id)}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                      >
                        {item.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateTodoItem(todoList.id, item.id, e.target.value)}
                        className="flex-1 px-2 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-transparent"
                        placeholder="Todo item..."
                      />
                      <button
                        type="button"
                        onClick={() => removeTodoItem(todoList.id, item.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addTodoItem(todoList.id)}
                  disabled={todoList.items.length >= 100}
                  className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item (max 100)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-[var(--color-text-primary)]">
              Resources
            </label>
            <button
              type="button"
              onClick={addResource}
              className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => updateResource(index, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    placeholder="Resource name..."
                  />
                  <input
                    type="url"
                    value={resource.link}
                    onChange={(e) => updateResource(index, 'link', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeResource(index)}
                  className="text-red-500 hover:text-red-600 p-1 mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--color-border)]">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {note ? "Save Changes" : "Create Note"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
