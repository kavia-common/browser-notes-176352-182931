import { render, screen } from '@testing-library/react';
import App from './App';

describe('App initial render and accessibility', () => {
  test('renders theme toggle button with accessible label', () => {
    render(<App />);
    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  test('renders sidebar with New Note button and search', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /new note/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /search notes/i })).toBeInTheDocument();
  });

  test('renders editor empty state initially', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: /note editor/i })).toBeInTheDocument();
  });
});
