import React from 'react';

/**
 * Editor pane for a single note with title and body controls.
 */
export default function NoteEditor({
  note,
  onUpdateTitle,
  onUpdateBody,
  onDelete,
}) {
  if (!note) {
    return (
      <section className="editor empty" aria-label="Note editor">
        <div className="empty-message">
          <p>Select a note from the left or create a new one.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="editor" aria-label="Note editor">
      <div className="editor-header">
        <label htmlFor="note-title" className="sr-only">Note title</label>
        <input
          id="note-title"
          className="title-input"
          type="text"
          value={note.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Note title"
        />
        <button
          className="btn btn-danger"
          onClick={() => onDelete(note.id)}
          aria-label={`Delete current note "${note.title || 'Untitled'}"`}
        >
          Delete
        </button>
      </div>

      <label htmlFor="note-body" className="sr-only">Note body</label>
      <textarea
        id="note-body"
        className="body-textarea"
        value={note.body}
        onChange={(e) => onUpdateBody(e.target.value)}
        placeholder="Start typing your note..."
      />
    </section>
  );
}
