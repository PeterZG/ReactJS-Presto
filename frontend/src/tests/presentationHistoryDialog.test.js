import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PresentationHistoryDialog from '../editor/PresentationHistoryDialog';
import { saveHistoryRecord } from '../services/presentationStorage';

test('opening history reads edits made after the dialog was mounted or closed', async () => {
  localStorage.clear();
  render(<PresentationHistoryDialog presentationId="deck-1" action={jest.fn()} switcher={<button>History</button>} />);
  saveHistoryRecord({ id: 'deck-1', name: 'First version', slides: [] });
  fireEvent.click(screen.getByRole('button', { name: 'History' }));
  expect(screen.getByText('First version')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Close', exact: true })[0]);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  saveHistoryRecord({ id: 'deck-1', name: 'Latest version', slides: [{}] });
  fireEvent.click(screen.getByRole('button', { name: 'History' }));
  expect(screen.getByText('Latest version')).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /version/ })).toHaveLength(2);
});
