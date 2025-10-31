const STORAGE_KEY = 'notes.v1';

/**
 * Safely parse JSON string, returning fallback on error.
 * @param {string} str
 * @param {any} fallback
 * @returns {any}
 */
function safeParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Get notes array from localStorage, ensuring it's an array.
 * Returns [] if missing/corrupt.
 */
export function getNotes() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Save notes array to localStorage.
 * If serialization fails, a no-op to avoid crashes.
 * @param {Array} notes
 */
export function saveNotes(notes) {
  try {
    const serialized = JSON.stringify(notes || []);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // no-op
  }
}

/**
 * Create a new note with defaults and persist it.
 * @param {{title?: string, body?: string}} payload
 * @returns {object} the created note
 */
// PUBLIC_INTERFACE
export function createNote(payload = {}) {
  /** Create a new note and persist it. */
  const now = Date.now();
  const note = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title ?? 'Untitled',
    body: payload.body ?? '',
    createdAt: now,
    updatedAt: now,
  };
  const notes = getNotes();
  notes.push(note);
  saveNotes(notes);
  return note;
}

/**
 * Update a note by id with provided fields and persist it.
 * @param {string} id
 * @param {{title?: string, body?: string}} updates
 * @returns {object|null} updated note or null if not found
 */
// PUBLIC_INTERFACE
export function updateNote(id, updates = {}) {
  /** Update a note by id and persist it. */
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === id);
  if (idx === -1) return null;
  const now = Date.now();
  const updated = {
    ...notes[idx],
    ...updates,
    updatedAt: now,
  };
  notes[idx] = updated;
  saveNotes(notes);
  return updated;
}

/**
 * Delete a note by id and persist it.
 * @param {string} id
 * @returns {boolean} true if deleted
 */
// PUBLIC_INTERFACE
export function deleteNote(id) {
  /** Delete a note by id and persist it. */
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== id);
  const changed = filtered.length !== notes.length;
  if (changed) saveNotes(filtered);
  return changed;
}
