import { useEffect } from 'react';
import { toast } from 'sonner';

export function useDisableContextMenuAndCopy(enabled = true) {
      useEffect(() => {
            if (!enabled) return;
            
            const showToast = (msg, desc) => {
                  toast.warning(msg, {
                        description: desc,
                        position: "bottom-right",
                  });
            };

            const handleContextMenu = (e) => {
                  e.preventDefault();
                  showToast("Protected Content", "Right-click is disabled.");
            };

            const handleClipboard = (e) => {
                  e.preventDefault();
                  showToast("Action Blocked", "Copy / Paste is disabled.");
            };

            const handleSelect = (e) => {
                  e.preventDefault();
            };

            const handleDrag = (e) => {
                  e.preventDefault();
            };

            // Disable keyboard shortcuts
            const handleKeyDown = (e) => {
                  if (!e) {
                        console.error('No event object provided');
                        return;
                  }
                  const key = e.key.toLowerCase();

                  if (
                        (e.ctrlKey || e.metaKey) &&
                        ['c', 'v', 'x', 'a', 'u', 's'].includes(key)
                  ) {
                        e.preventDefault();
                        showToast("Shortcut Blocked", "This shortcut is disabled.");
                  }

                  if (e.ctrlKey && e.shiftKey && key === 'v') {
                        e.preventDefault();
                  }

                  if (e.metaKey && key === 'v') {
                        e.preventDefault();
                  }

                  if (key === 'f12') {
                        e.preventDefault();
                  }
            };

            document.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('copy', handleClipboard);
            document.addEventListener('cut', handleClipboard);
            document.addEventListener('paste', handleClipboard);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('selectstart', handleSelect);
            document.addEventListener('dragstart', handleDrag);

            return () => {
                  document.removeEventListener('contextmenu', handleContextMenu);
                  document.removeEventListener('copy', handleClipboard);
                  document.removeEventListener('cut', handleClipboard);
                  document.removeEventListener('paste', handleClipboard);
                  document.removeEventListener('keydown', handleKeyDown);
                  document.removeEventListener('selectstart', handleSelect);
                  document.removeEventListener('dragstart', handleDrag);
            };
      }, [enabled]);
}
