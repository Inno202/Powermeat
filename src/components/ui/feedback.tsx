import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

/* Site-wide feedback: toasts for results and one confirmation dialog that
   replaces the browser's own "this site says" pop-ups. */

type ToastTone = 'success' | 'info' | 'error';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}
interface ConfirmRequest extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

let pushToast: ((t: ToastItem) => void) | null = null;
let openConfirm: ((r: ConfirmRequest) => void) | null = null;
let nextId = 1;

export function toast(message: string, tone: ToastTone = 'success') {
  pushToast?.({ id: nextId++, message, tone });
}

/** Asks a clear question and resolves true only when the named action is chosen. */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise(resolve => {
    if (!openConfirm) {
      resolve(false);
      return;
    }
    openConfirm({ ...options, resolve });
  });
}

const TOAST_ICON = { success: CheckCircle2, info: Info, error: XCircle };

export const FeedbackHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    pushToast = t => {
      setToasts(prev => [...prev.slice(-2), t]);
      window.setTimeout(
        () => setToasts(prev => prev.filter(x => x.id !== t.id)),
        t.tone === 'error' ? 7000 : 3500
      );
    };
    openConfirm = r => setRequest(r);
    return () => {
      pushToast = null;
      openConfirm = null;
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (request && dialog && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
  }, [request]);

  const finish = (ok: boolean) => {
    dialogRef.current?.close();
    request?.resolve(ok);
    setRequest(null);
  };

  return (
    <>
      <div className="fixed z-[200] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col gap-2 items-stretch sm:items-end pointer-events-none">
        {toasts.map(t => {
          const Icon = TOAST_ICON[t.tone];
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="toast-in pointer-events-auto flex items-center gap-3 bg-ink text-white rounded-full pl-4 pr-5 py-3 text-sm font-medium shadow-lg sm:max-w-md"
            >
              <Icon
                size={18}
                className={`shrink-0 ${t.tone === 'error' ? 'text-brand-accent-soft' : t.tone === 'success' ? 'text-emerald-400' : 'text-brand-yellow'}`}
              />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        aria-labelledby="confirm-title"
        onCancel={e => {
          e.preventDefault();
          finish(false);
        }}
        onClick={e => {
          if (e.target === dialogRef.current) finish(false);
        }}
      >
        {request && (
          <div className="p-6 sm:p-7">
            <div className="flex items-start gap-3">
              {request.tone === 'danger' && (
                <span className="shrink-0 w-10 h-10 rounded-full bg-red-50 text-brand-accent-deep flex items-center justify-center">
                  <AlertTriangle size={20} />
                </span>
              )}
              <div>
                <h2 id="confirm-title" className="display text-3xl">
                  {request.title}
                </h2>
                <p className="mt-2 text-ink-soft">{request.message}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button ref={cancelRef} type="button" className="btn btn-outline" onClick={() => finish(false)}>
                {request.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                className={`btn ${request.tone === 'danger' ? 'btn-danger-solid' : 'btn-primary'}`}
                onClick={() => finish(true)}
              >
                {request.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
};
