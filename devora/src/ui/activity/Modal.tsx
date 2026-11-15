// Accessible modal on Radix Dialog: focus trap, Escape, focus returns to what opened it.
// Desktop: centered, scale 0.96 to 1 in 260ms. Phone: a bottom sheet on the drawer curve.

import { useEffect, useRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  kicker?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export const Modal = ({ open, onOpenChange, title, kicker, description, children, footer }: ModalProps) => {
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) opener.current = document.activeElement;
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="nb-overlay" />
        <Dialog.Content
          className="nb-modal"
          aria-describedby={description ? undefined : undefined}
          onCloseAutoFocus={(e) => {
            if (opener.current?.isConnected) {
              e.preventDefault();
              opener.current.focus({ preventScroll: true });
            }
          }}
        >
          <div className="nb-modal-head">
            <div className="nb-modal-heading">
              {kicker ? <p className="nb-kicker font-pixel">{kicker}</p> : null}
              <Dialog.Title className="nb-modal-title font-display">{title}</Dialog.Title>
              {description ? <Dialog.Description className="nb-modal-desc">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close className="nb-icon-btn" aria-label="Close">
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="nb-modal-body">{children}</div>
          {footer ? <div className="nb-modal-foot">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
