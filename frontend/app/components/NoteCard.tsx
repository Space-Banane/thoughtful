import type { Note } from "~/services/notebook";
import Card from "./Card";
import { CheckSquare, Link as LinkIcon } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const Icon = note.icon;
  
  // Calculate unfinished todos
  const unfinishedTodos = note.todos.reduce((total, list) => {
    return total + list.items.filter(item => !item.completed).length;
  }, 0);
  
  return (
    <Card hover onClick={onClick}>
      <div className="flex flex-col h-full">
        {/* Icon & Title */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-bg-elevated)] rounded-lg flex items-center justify-center border border-[var(--color-border)]">
            <Icon className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] line-clamp-2">
              {note.title}
            </h3>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-4 flex-1">
          {note.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-md border border-[var(--color-border)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Todos & Resources Summary */}
        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-tertiary)]">
          {unfinishedTodos > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{unfinishedTodos} todo{unfinishedTodos !== 1 ? 's' : ''}</span>
            </div>
          )}
          {note.resources.length > 0 && (
            <div className="flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{note.resources.length} resource{note.resources.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Date */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
          Updated {note.updatedAt.toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}
