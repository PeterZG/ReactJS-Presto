import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SlideOrderDialog from '../editor/SlideOrderDialog';

test('a closed order dialog does not retain references to deleted slides', () => {
  const firstSlide = { items: [{ layer: 0 }] };
  const secondSlide = { items: [] };
  const action = jest.fn();
  const { rerender } = render(
    <SlideOrderDialog presentation={{ slides: [firstSlide, secondSlide] }} action={action} />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Arrange slides' }));
  fireEvent.click(screen.getByRole('button', { name: 'Move slide 2 earlier' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save order' }));
  expect(action).toHaveBeenCalledWith({ slides: [secondSlide, firstSlide] });

  // Deleting a slide after arranging must not render the old two-slide draft.
  rerender(<SlideOrderDialog presentation={{ slides: [firstSlide] }} action={action} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Arrange slides' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText('Slide 1')).toBeInTheDocument();
  expect(within(dialog).queryByText('Slide 2')).not.toBeInTheDocument();
  expect(within(dialog).getByText('1 elements')).toBeInTheDocument();
});
