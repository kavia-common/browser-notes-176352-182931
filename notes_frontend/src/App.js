import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import { getNotes, saveNotes, createNote, updateNote, deleteNote } from './utils/storage';

// PUBLIC_INTERFACE
function App() {
  /** Root application for notes with localStorage persistence and responsive layout. */
  const [theme, setTheme] = useState('light');
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [query, setQuery] = useState('');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load notes on mount
  useEffect(() => {
    const initial = getNotes();
    // sort by updatedAt desc on load
    initial.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setNotes(initial);
    if (initial.length > 0) {
      setSelectedNoteId(initial[0].id);
    }
  }, []);

  // Persist notes with a simple debounce to avoid excessive writes
  const persistTimer = useRef(null);
  useEffect(() => {
    if (!notes) return;
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
    }
    persistTimer.current = setTimeout(() => {
      saveNotes(notes);
    }, 250);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [notes]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle light/dark theme */
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  // PUBLIC_INTERFACE
  const handleCreate = () => {
    /** Create a new note, select it, and update state */
    const n = createNote({ title: 'Untitled', body: '' });
    setNotes((prev) => [n, ...prev]);
    setSelectedNoteId(n.id);
  };

  // PUBLIC_INTERFACE
  const handleSelect = (id) => {
    /** Select a note by id */
    setSelectedNoteId(id);
  };

  // PUBLIC_INTERFACE
  const handleDelete = (id) => {
    /** Delete note and adjust selection */
    const deleted = deleteNote(id);
    if (!deleted) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedNoteId((current) => {
      if (current !== id) return current;
      // Select next available note (top of list after deletion)
      const remaining = notes.filter((n) => n.id !== id);
      return remaining.length ? remaining[0].id : null;
    });
  };

  // PUBLIC_INTERFACE
  const handleUpdateTitle = (title) => {
    /** Update title of the selected note */
    if (!selectedNoteId) return;
    const updated = updateNote(selectedNoteId, { title });
    if (!updated) return;
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === updated.id ? updated : n));
      next.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return next;
    });
  };

  // PUBLIC_INTERFACE
  const handleUpdateBody = (body) => {
    /** Update body of the selected note */
    if (!selectedNoteId) return;
    const updated = updateNote(selectedNoteId, { body });
    if (!updated) return;
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === updated.id ? updated : n));
      next.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return next;
    });
  };

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const filteredNotes = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const t = (n.title || '').toLowerCase();
      const b = (n.body || '').toLowerCase();
      return t.includes(q) || b.includes(q);
    });
  }, [notes, query]);

  return (
    <div className="App">
      <header className="topbar" role="banner">
        <div className="brand">Notes</div>
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="layout" role="main">
        <NotesList
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onCreate={handleCreate}
          query={query}
          onQueryChange={setQuery}
        />
        <NoteEditor
          note={selectedNote}
          onUpdateTitle={handleUpdateTitle}
          onUpdateBody={handleUpdateBody}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

export default App;
