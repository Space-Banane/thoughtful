import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import Layout from "~/components/Layout";
import Button from "~/components/Button";
import NoteCard from "~/components/NoteCard";
import NoteModal from "~/components/NoteModal";
import { notebookService, type Note } from "~/services/notebook";
import { getIconName } from "~/utils/iconMap";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Notebook - Thoughtful" },
    { name: "description", content: "View and manage all your ideas in one place" },
  ];
}

export default function Notebook() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    // Load notes on mount
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedNotes = await notebookService.listNotes();
      setNotes(loadedNotes);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setError(err instanceof Error ? err.message : "Failed to load notes");
      // For now, set empty array when not implemented
      if (err instanceof Error && err.message === "Not implemented yet") {
        setNotes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = () => {
    setSelectedNote(undefined);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (selectedNote) {
        // Edit existing note
        const updatedNote = await notebookService.updateNote(selectedNote.id, {
          title: noteData.title!,
          description: noteData.description!,
          tags: noteData.tags!,
          icon: noteData.icon ? getIconName(noteData.icon) : undefined,
          todos: noteData.todos!,
          resources: noteData.resources!,
        });
        // Update the note in the local state
        setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n));
      } else {
        // Create new note
        const newNote = await notebookService.createNote({
          title: noteData.title!,
          description: noteData.description!,
          tags: noteData.tags!,
          icon: noteData.icon ? getIconName(noteData.icon) : "Lightbulb",
          todos: noteData.todos || [],
          resources: noteData.resources || [],
        });
        setNotes([newNote, ...notes]);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      setError(err instanceof Error ? err.message : "Failed to save note");
      alert(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.description.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    if (error === "No Cookie Provided") {
      setError("You must be logged in to view your notebook.");
      setLoggedIn(false);
    }
  }, [error]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
          My Notebook
              </h1>
              <p className="text-[var(--color-text-secondary)]">
          {notes.length} {notes.length === 1 ? "idea" : "ideas"} captured
              </p>
            </div>
            <Button
              onClick={handleCreateNote}
              size="lg"
              className="group"
              disabled={!loggedIn}
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Note
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, description, or tags..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              disabled={!loggedIn}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && error !== "Not implemented yet" && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Notes Grid */}
        {(isLoading || !loggedIn) ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)] animate-pulse">
              <Search className="w-10 h-10 text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-[var(--color-text-secondary)]">Loading notes...</p>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleEditNote(note)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
              <Search className="w-10 h-10 text-[var(--color-text-tertiary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              No notes found
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start by creating your first note"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNote}>
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Note
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={selectedNote}
        onSave={handleSaveNote}
      />
    </Layout>
  );
}
