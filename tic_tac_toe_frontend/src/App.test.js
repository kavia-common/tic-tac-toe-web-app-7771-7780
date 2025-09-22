import { render, screen } from '@testing-library/react';
import App from './App';

test('renders status message', () => {
  render(<App />);
  const statusElement = screen.getByText(/Player X's turn/i);
  expect(statusElement).toBeInTheDocument();
});
