import { useEffect, useRef } from 'react';

/* The device Back button closes whatever is open (a window, drawer or form) before
   it goes back a page. Each open layer adds one step to the browser history; Back
   closes the top layer. Closing a layer with its own button removes its step. */

interface Layer {
  id: number;
  close: () => void;
}

const layers: Layer[] = [];
let nextId = 1;
let ignorePops = 0;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (ignorePops > 0) {
      ignorePops--;
      return;
    }
    const top = layers.pop();
    top?.close();
  });
}

// Opens and closes that happen together (for example the cart closing as checkout
// opens) are added up and applied as one history change, so they never race.
let pending = 0;
let scheduled = false;
function applySoon() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    const change = pending;
    pending = 0;
    if (change > 0) {
      for (let i = 0; i < change; i++) window.history.pushState({ pmLayer: true }, '');
    } else if (change < 0) {
      ignorePops++;
      window.history.go(change);
    }
  });
}

function openLayer(close: () => void): number {
  const id = nextId++;
  layers.push({ id, close });
  pending++;
  applySoon();
  return id;
}

function closeLayer(id: number) {
  const i = layers.findIndex(l => l.id === id);
  if (i === -1) return; // already closed by Back
  layers.splice(i, 1);
  pending--;
  applySoon();
}

/** True while any window, drawer or form is open. */
export function hasOpenLayers(): boolean {
  return layers.length > 0;
}

/** Called when moving to another page from inside an open layer (for example the
 *  menu): the layers are forgotten so closing them does not undo the move. */
export function forgetOpenLayers(): boolean {
  // Steps already in the history (not ones still waiting to be added) can be reused.
  const inHistory = layers.length - Math.max(pending, 0);
  layers.length = 0;
  pending = 0;
  return inHistory > 0;
}

/** Makes Back close this window while it is open. */
export function useBackToClose(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const id = openLayer(() => closeRef.current());
    return () => closeLayer(id);
  }, [open]);
}
