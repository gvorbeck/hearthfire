import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/app';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';

export const renderRoute = (element: React.ReactElement, path: string, route: string): RenderResult =>
  render(
    <HelmetProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={route} element={element} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </HelmetProvider>
  );

export const renderWithProviders = (element: React.ReactElement): RenderResult =>
  render(
    <HelmetProvider>
      <ToastProvider>
        <MemoryRouter>
          {element}
        </MemoryRouter>
      </ToastProvider>
    </HelmetProvider>
  );
