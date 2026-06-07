import * as Dialog from '@radix-ui/react-dialog';
import './modal.css';

export function Modal({ open, onOpenChange, children, width = 600 }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal" style={{ '--modal-w': `${width}px` }}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="modal-header">
      <div>
        <Dialog.Title className="modal-title">{title}</Dialog.Title>
        {subtitle ? <Dialog.Description className="modal-subtitle">{subtitle}</Dialog.Description> : null}
      </div>
      <Dialog.Close className="modal-close" aria-label="Close" onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Dialog.Close>
    </div>
  );
}

function ModalBody({ children, padded = true }) {
  return <div className={padded ? 'modal-body modal-body--padded' : 'modal-body'}>{children}</div>;
}

function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
