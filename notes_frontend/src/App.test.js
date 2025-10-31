import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

function getThemeToggle() {
  return screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });
}

function getNewNoteButton() {
  return screen.getByRole('button', { name: /new note/i });
}

function getSearchInput() {
  // The input has aria-label "Search notes by title or body" and a visible placeholder "Search notes..."
  // Prefer role + label for resilience.
  return screen.getByRole('textbox', { name: /search notes/i });
}

function getEditorRegion() {
  return screen.getByRole('region', { name: /note editor/i });
}

describe('Notes App - smoke and accessibility', () => {
  test('renders theme toggle with accessible label', () => {
    render(<App />);
    expect(getThemeToggle()).toBeInTheDocument();
  });

  test('renders sidebar controls: New Note and Search', () => {
    render(<App />);
    expect(getNewNoteButton()).toBeInTheDocument();
    expect(getSearchInput()).toBeInTheDocument();
  });

  test('renders editor region (empty state initially)', () => {
    render(<App />);
    const editor = getEditorRegion();
    expect(editor).toBeInTheDocument();
    // Empty state text should be present when no notes exist
    expect(editor).toHaveTextContent(/select a note from the left or create a new one/i);
  });
});

describe('Notes App - create, edit, delete flows', () => {
  test('create a new note selects it and shows default fields', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getNewNoteButton());

    // Selected note appears in editor with inputs
    const editor = getEditorRegion();
    const titleInput = within(editor).getByLabelText(/note title/i);
    const bodyTextarea = within(editor).getByLabelText(/note body/i);

    expect(titleInput).toHaveValue('Untitled');
    expect(bodyTextarea).toHaveValue('');

    // Notes list should show one note item with Untitled and No content snippet
    const list = screen.getByRole('list', { name: /notes list/i });
    expect(within(list).getByText(/untitled/i)).toBeInTheDocument();
    expect(within(list).getByText(/no content/i)).toBeInTheDocument();
  });

  test('editing title and body updates list ordering and snippet', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create two notes
    await user.click(getNewNoteButton());
    await user.click(getNewNoteButton());

    const editor = getEditorRegion();
    const titleInput = within(editor).getByLabelText(/note title/i);
    const bodyTextarea = within(editor).getByLabelText(/note body/i);

    // Update the currently selected note (the most recently created)
    await user.clear(titleInput);
    await user.type(titleInput, 'Groceries');
    await user.type(bodyTextarea, 'Buy milk and eggs');

    // The list shows updated title/snippet; the most recently updated should sort to top
    const list = screen.getByRole('list', { name: /notes list/i });
    const items = within(list).getAllByRole('button', { name: /.+/ });
    // First item should be the selected and updated one (has aria-current=true)
    expect(items[0]).toHaveAttribute('aria-current', 'true');
    expect(within(items[0]).getByText(/groceries/i)).toBeInTheDocument();
    expect(within(items[0]).getByText(/buy milk and eggs/i)).toBeInTheDocument();
  });

  test('delete a note via editor Delete button removes it and updates selection', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create two notes to have a next selection
    await user.click(getNewNoteButton());
    await user.click(getNewNoteButton());

    const list = screen.getByRole('list', { name: /notes list/i });
    let noteButtons = within(list).getAllByRole('button', { name: /.+/ });
    expect(noteButtons.length).toBe(2);

    // Delete current (selected) note using editor delete
    const editor = getEditorRegion();
    const deleteBtn = within(editor).getByRole('button', { name: /delete current note/i });
    await user.click(deleteBtn);

    // One note remains, selected should have aria-current=true
    noteButtons = within(list).getAllByRole('button', { name: /.+/ });
    expect(noteButtons.length).toBe(1);
    expect(noteButtons[0]).toHaveAttribute('aria-current', 'true');
  });

  test('delete from list item delete icon removes that note without selecting it first', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create two notes and name them to disambiguate
    await user.click(getNewNoteButton());
    let editor = getEditorRegion();
    await user.type(within(editor).getByLabelText(/note title/i), 'First');
    await user.click(getNewNoteButton());
    editor = getEditorRegion();
    await user.clear(within(editor).getByLabelText(/note title/i));
    await user.type(within(editor).getByLabelText(/note title/i), 'Second');

    const list = screen.getByRole('list', { name: /notes list/i });
    let firstItem = within(list).getByText(/first/i).closest('button');
    let secondItem = within(list).getByText(/second/i).closest('button');

    // Delete "First" using its list delete icon button
    const firstItemContainer = firstItem.parentElement; // li -> button is inside li
    const deleteIcon = within(firstItemContainer).getByRole('button', { name: /delete note "first"/i });
    await user.click(deleteIcon);

    // Only "Second" remains
    expect(screen.queryByText(/first/i)).not.toBeInTheDocument();
    expect(screen.getByText(/second/i)).toBeInTheDocument();

    // Selection should still be on current/last edited (which is "Second")
    secondItem = within(list).getByText(/second/i).closest('button');
    expect(secondItem).toHaveAttribute('aria-current', 'true');
  });
});

describe('Notes App - search filtering', () => {
  test('filters notes by title or body text', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create and label three notes
    await user.click(getNewNoteButton());
    let editor = getEditorRegion();
    await user.clear(within(editor).getByLabelText(/note title/i));
    await user.type(within(editor).getByLabelText(/note title/i), 'Work');
    await user.type(within(editor).getByLabelText(/note body/i), 'Finish report and email');

    await user.click(getNewNoteButton());
    editor = getEditorRegion();
    await user.clear(within(editor).getByLabelText(/note title/i));
    await user.type(within(editor).getByLabelText(/note title/i), 'Home');
    await user.type(within(editor).getByLabelText(/note body/i), 'Clean kitchen and living room');

    await user.click(getNewNoteButton());
    editor = getEditorRegion();
    await user.clear(within(editor).getByLabelText(/note title/i));
    await user.type(within(editor).getByLabelText(/note title/i), 'Ideas');
    await user.type(within(editor).getByLabelText(/note body/i), 'Brainstorm app concepts');

    // Search for "clean" (matches body of Home)
    const search = getSearchInput();
    await user.type(search, 'clean');

    const list = screen.getByRole('list', { name: /notes list/i });
    const visibleButtons = within(list).queryAllByRole('button');
    // Only one note should show
    expect(visibleButtons.length).toBe(1);
    expect(within(list).getByText(/home/i)).toBeInTheDocument();
    expect(screen.queryByText(/work/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ideas/i)).not.toBeInTheDocument();

    // Clear search to show all again
    await user.clear(search);
    expect(within(list).getByText(/work/i)).toBeInTheDocument();
    expect(within(list).getByText(/home/i)).toBeInTheDocument();
    expect(within(list).getByText(/ideas/i)).toBeInTheDocument();
  });
});

describe('Notes App - additional accessibility checks', () => {
  test('notes list has proper roles and labels', () => {
    render(<App />);
    const sidebar = screen.getByLabelText(/notes sidebar/i);
    expect(sidebar).toBeInTheDocument();

    const list = screen.getByRole('list', { name: /notes list/i });
    expect(list).toBeInTheDocument();
  });

  test('note selection indicated via aria-current attribute', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getNewNoteButton()); // creates one note and selects it

    const list = screen.getByRole('list', { name: /notes list/i });
    const itemButtons = within(list).getAllByRole('button', { name: /.+/ });
    expect(itemButtons[0]).toHaveAttribute('aria-current', 'true');
  });
});
