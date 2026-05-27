import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/primitives';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';

export const renderRoute = (element: React.ReactElement, path: string, route: string): RenderResult =>
  render(
    <HelmetProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {element}
        </MemoryRouter>
      </ToastProvider>
    </HelmetProvider>
  );
