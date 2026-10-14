import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Test Title">
        <p>Body Content</p>
      </Modal>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(
      <Modal isOpen onClose={() => {}} title="ARIA Test">
        <p>Content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Close Test">
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Tutup'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Escape Test">
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll when open and restores on unmount', () => {
    const { unmount } = render(
      <Modal isOpen onClose={() => {}} title="Scroll Lock">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen onClose={() => {}} title="No Close" showCloseButton={false}>
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByLabelText('Tutup')).not.toBeInTheDocument();
  });
});
