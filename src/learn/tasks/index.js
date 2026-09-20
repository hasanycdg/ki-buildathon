/** Registry aller Rollen. Reihenfolge = Reihenfolge in der Auswahl. */
import { housekeepingTasks } from "./housekeeping.js";
import { receptionTasks } from "./reception.js";
import { breakfastTasks } from "./breakfast.js";
import { cleaningTasks } from "./cleaning.js";

export const ROLES = [housekeepingTasks, receptionTasks, breakfastTasks, cleaningTasks];

export function getRole(id) {
  return ROLES.find((r) => r.id === id) || null;
}
