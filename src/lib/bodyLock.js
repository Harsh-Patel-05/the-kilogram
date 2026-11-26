/** Reference-counted body scroll lock so stacked overlays don't unlock early. */
let locks = 0;

export function lockBody() {
  locks += 1;
  if (locks === 1) document.body.classList.add('is-locked');
}

export function unlockBody() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.body.classList.remove('is-locked');
}
