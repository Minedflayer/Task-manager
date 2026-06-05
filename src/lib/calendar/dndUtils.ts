import { state$, Task } from '@/lib/state/store';

/**
 * Updates a task's scheduled_date and scheduled_time in the global state
 * when it is dropped on a calendar slot.
 *
 * @param taskId - The ID of the dragged task
 * @param date   - Target date string (YYYY-MM-DD)
 * @param hour   - Target hour string (HH:00)
 */
export function scheduleTask(taskId: string, date: string, hour: string): void {
  const tasks = state$.tasks.get();
  const index = tasks.findIndex((t: Task) => t.id === taskId);
  if (index === -1) return;

  state$.tasks[index].scheduled_date.set(date);
  state$.tasks[index].scheduled_time.set(hour);
}
