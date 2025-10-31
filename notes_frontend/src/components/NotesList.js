import React from 'react';

/**
 * Sidebar list of notes with search and new note button.
 * Accessible roles and keyboard-friendly.
 */
export default function NotesList({
  notes,
  selectedNoteId,
  onSelect,
  onDelete,
  onCreate,
  query,
  onQueryChange,
}) {
  return (
    <aside className="sidebar" aria-label="Notes sidebar">
      <div className="sidebar-header">
        <button className="btn btn-primary" onClick={onCreate} aria-label="Create a new note">
          + New Note
        </button>
        <div className="search-wrapper">
          <label htmlFor="notes-search" className="sr-only">
            Search notes
          </label>
          <input
            id="notes-search"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search notes..."
            className="input"
            aria-label="Search notes by title or body"
          />
        </div>
      </div>

      <ul className="notes-list" role="list" aria-label="Notes list">
        {notes.length === 0 ? (
          <li className="empty-state" aria-live="polite">No notes yet. Click "New Note" to get started.</li>
        ) : (
          notes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            const snippet = note.body?.trim() ? note.body.split('\n')[0].slice(0, 80) : 'No content';
            const date = new Date(note.updatedAt);
            const displayDate = isNaN(date.getTime()) ? '' : date.toLocaleString();

            return (
              <li key={note.id}>
                <button
                  className={`note-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelect(note.id)}
                  aria-current={isSelected ? 'true' : 'false'}
                >
                  <div className="note-item-main">
                    <div className="note-title" title={note.title || 'Untitled'}>
                      {note.title || 'Untitled'}
                    </div>
                    <div className="note-snippet" title={snippet}>
                      {snippet}
                    </div>
                  </div>
                  <div className="note-meta">
                    <time className="note-updated" dateTime={date.toISOString()}>{displayDate}</time>
                    <button
                      className="icon-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                      }}
                      aria-label={`Delete note "${note.title || 'Untitled'}"`}
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
