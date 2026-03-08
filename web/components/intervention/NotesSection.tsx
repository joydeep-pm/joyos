"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";
import type { DirectorNote } from "@/lib/control-tower/notes";

interface NotesSectionProps {
  featureRequestId: string;
  onAddNote?: () => void;
}

export function NotesSection({ featureRequestId, onAddNote }: NotesSectionProps) {
  const [notes, setNotes] = useState<DirectorNote[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [featureRequestId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `/api/control-tower/notes?featureRequestId=${featureRequestId}`
      );
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/control-tower/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId,
          content: newNoteContent,
          author: "Director"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([...notes, data.note]);
        setNewNoteContent("");
        setIsAdding(false);
        onAddNote?.();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/control-tower/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(notes.map((n) => (n.id === noteId ? data.note : n)));
        setEditingNoteId(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/control-tower/notes/${noteId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (note: DirectorNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Director Notes</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Note
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Add a director note..."
            className="w-full p-2 border border-blue-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isLoading}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddNote}
              disabled={isLoading || !newNoteContent.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNoteContent("");
              }}
              disabled={isLoading}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 italic">No notes yet</p>
      )}

      <div className="space-y-2">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            {editingNoteId === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={isLoading}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdateNote(note.id)}
                    disabled={isLoading || !editContent.trim()}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label="Edit note"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{note.author}</span>
                  <span>•</span>
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  {note.updatedAt !== note.createdAt && (
                    <>
                      <span>•</span>
                      <span className="italic">edited</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
