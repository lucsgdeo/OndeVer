import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JsonScheduleRepository } from './infrastructure/JsonScheduleRepository';
import { App } from './presentation/App';
import './presentation/styles.css';

const repository = new JsonScheduleRepository(`${import.meta.env.BASE_URL}data/games.json`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App repository={repository} />
  </StrictMode>,
);
