export const MENU_JUMP_EVENT = 'kg:menu-jump';

/** Ask the menu section to show a group and scroll to it. */
export function jumpToMenuGroup(groupId) {
  window.dispatchEvent(new CustomEvent(MENU_JUMP_EVENT, { detail: groupId }));
}
