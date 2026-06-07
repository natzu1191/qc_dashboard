import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import './command-palette.css';

export function CommandPalette({ open, onOpenChange, actions = [] }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay" />
        <Dialog.Content className="cmd-shell" aria-label="Command palette">
          <Command label="Command palette">
            <div className="cmd-input-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Command.Input placeholder="Type a command or search…" className="cmd-input" autoFocus />
            </div>
            <Command.List className="cmd-list">
              <Command.Empty className="cmd-empty">No results.</Command.Empty>
              <Command.Group heading="Actions" className="cmd-group">
                {actions.map((a) => (
                  <Command.Item
                    key={a.id}
                    value={`${a.label} ${a.hint || ''}`}
                    onSelect={() => {
                      onOpenChange(false);
                      a.run();
                    }}
                    className="cmd-item"
                  >
                    <span className="cmd-item-label">{a.label}</span>
                    {a.hint ? <span className="cmd-item-hint">{a.hint}</span> : null}
                    {a.shortcut ? <kbd className="kbd kbd--sm">{a.shortcut}</kbd> : null}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
