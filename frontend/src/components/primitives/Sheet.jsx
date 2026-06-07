import * as Dialog from '@radix-ui/react-dialog';
import './sheet.css';

/**
 * Right-side slide-over sheet. Used for forms (Log Entry, Complaint,
 * Edit Case) so users stay anchored to dashboard context.
 *
 * <Sheet open onOpenChange>
 *   <Sheet.Header title="…" subtitle="…" />
 *   <Sheet.Body>…</Sheet.Body>
 *   <Sheet.Footer>…</Sheet.Footer>
 * </Sheet>
 */
export function Sheet({ open, onOpenChange, children, width = 520 }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="sheet" style={{ '--sheet-w': `${width}px` }}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SheetHeader({ title, subtitle, onClose }) {
  return (
    <div className="sheet-header">
      <div>
        <Dialog.Title className="sheet-title">{title}</Dialog.Title>
        {subtitle ? <Dialog.Description className="sheet-subtitle">{subtitle}</Dialog.Description> : null}
      </div>
      <Dialog.Close className="sheet-close" aria-label="Close" onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Dialog.Close>
    </div>
  );
}

function SheetBody({ children }) {
  return <div className="sheet-body">{children}</div>;
}

function SheetFooter({ children }) {
  return <div className="sheet-footer">{children}</div>;
}

Sheet.Header = SheetHeader;
Sheet.Body = SheetBody;
Sheet.Footer = SheetFooter;
