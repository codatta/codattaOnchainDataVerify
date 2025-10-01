import { createRoot } from 'react-dom/client';
import Page from './page';
import './style.css';

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}
const root = createRoot(rootElement);
root.render(<Page />);