/**
 * Registry aller Rollen. Die Reihenfolge hier ist die Reihenfolge
 * in der Rollenauswahl.
 */
import { housekeeping } from "./housekeeping.js";
import { reception } from "./reception.js";
import { breakfast } from "./breakfast.js";
import { cleaning } from "./cleaning.js";

export const ROLES = [housekeeping, reception, breakfast, cleaning];

export function getRole(id) {
  return ROLES.find((r) => r.id === id) || null;
}
