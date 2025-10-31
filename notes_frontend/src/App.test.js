import { render, screen } from '@testing-library/react';
import App from './App';

describe('App initial render and accessibility', () => {
  test('renders theme toggle button with accessible label', () => {
    render(<App />);
    // Button should have an accessible label describing the action
    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  test('renders Learn React link with correct role and href', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /learn react/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://reactjs.org');
  });

  test('shows current theme text', () => {
    render(<App />);
    expect(screen.getByText(/current theme:/i)).toBeInTheDocument();
  });
});
