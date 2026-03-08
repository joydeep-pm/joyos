/**
 * Director Notes Management
 *
 * Manages local director notes on feature requests
 */

import { readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import { nanoid } from "nanoid";
import path from "path";

const NOTES_DIR = path.join(process.cwd(), ".cache", "control-tower");
const NOTES_FILE = path.join(NOTES_DIR, "director-notes.json");

export interface DirectorNote {
  id: string;
  featureRequestId: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesCache {
  notes: DirectorNote[];
  lastUpdated: string;
}

/**
 * Read all director notes from cache
 */
export async function readDirectorNotes(): Promise<NotesCache | null> {
  try {
    const cache = await readJsonFile<NotesCache | null>(NOTES_FILE, null);
    return cache;
  } catch (error) {
    console.error("Error reading director notes:", error);
    return null;
  }
}

/**
 * Write director notes to cache
 */
export async function writeDirectorNotes(cache: NotesCache): Promise<void> {
  await writeJsonFile(NOTES_FILE, cache);
}

/**
 * Get notes for a specific feature request
 */
export async function getNotesForFeatureRequest(
  featureRequestId: string
): Promise<DirectorNote[]> {
  const cache = await readDirectorNotes();
  if (!cache) {
    return [];
  }

  return cache.notes.filter((note) => note.featureRequestId === featureRequestId);
}

/**
 * Add a new director note
 */
export async function addDirectorNote(
  featureRequestId: string,
  content: string,
  author: string = "Director"
): Promise<DirectorNote> {
  const cache = await readDirectorNotes();
  const notes = cache?.notes || [];

  const newNote: DirectorNote = {
    id: `note-${nanoid(10)}`,
    featureRequestId,
    content,
    author,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.push(newNote);

  await writeDirectorNotes({
    notes,
    lastUpdated: new Date().toISOString()
  });

  return newNote;
}

/**
 * Update an existing director note
 */
export async function updateDirectorNote(
  noteId: string,
  content: string
): Promise<DirectorNote | null> {
  const cache = await readDirectorNotes();
  if (!cache) {
    return null;
  }

  const noteIndex = cache.notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    return null;
  }

  cache.notes[noteIndex].content = content;
  cache.notes[noteIndex].updatedAt = new Date().toISOString();

  await writeDirectorNotes({
    ...cache,
    lastUpdated: new Date().toISOString()
  });

  return cache.notes[noteIndex];
}

/**
 * Delete a director note
 */
export async function deleteDirectorNote(noteId: string): Promise<boolean> {
  const cache = await readDirectorNotes();
  if (!cache) {
    return false;
  }

  const noteIndex = cache.notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    return false;
  }

  cache.notes.splice(noteIndex, 1);

  await writeDirectorNotes({
    ...cache,
    lastUpdated: new Date().toISOString()
  });

  return true;
}
