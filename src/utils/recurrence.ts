import type { EventRow } from "@/types/events";

/**
 * Expand recurring events into virtual instances within a date range.
 * Each virtual instance copies the original event but with shifted start_at/end_at.
 * The id is suffixed with the date to keep it unique.
 */
export function expandRecurringEvents(
  recurringEvents: EventRow[],
  rangeStart: string,
  rangeEnd: string
): EventRow[] {
  const rStart = new Date(rangeStart);
  const rEnd = new Date(rangeEnd);
  const results: EventRow[] = [];

  for (const event of recurringEvents) {
    const eventStart = new Date(event.start_at);
    const eventEnd = new Date(event.end_at);
    const durationMs = eventEnd.getTime() - eventStart.getTime();

    const occurrences = getOccurrences(
      eventStart,
      event.recurrence as string,
      rStart,
      rEnd
    );

    for (const occStart of occurrences) {
      const occEnd = new Date(occStart.getTime() + durationMs);
      const dateKey = `${occStart.getFullYear()}-${String(occStart.getMonth() + 1).padStart(2, "0")}-${String(occStart.getDate()).padStart(2, "0")}`;

      results.push({
        ...event,
        id: `${event.id}_${dateKey}`,
        start_at: occStart.toISOString(),
        end_at: occEnd.toISOString(),
      });
    }
  }

  return results;
}

/** Get the original event ID from a possibly-suffixed recurrence instance ID */
export function getOriginalEventId(id: string): string {
  // Recurrence instance IDs look like: uuid_yyyy-MM-dd
  const match = id.match(/^(.+)_\d{4}-\d{2}-\d{2}$/);
  return match ? match[1] : id;
}

function getOccurrences(
  eventStart: Date,
  recurrence: string,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const results: Date[] = [];

  switch (recurrence) {
    case "daily": {
      const cursor = new Date(eventStart);
      // Advance cursor to rangeStart if needed
      if (cursor < rangeStart) {
        const diffDays = Math.ceil(
          (rangeStart.getTime() - cursor.getTime()) / 86400000
        );
        cursor.setDate(cursor.getDate() + diffDays);
      }
      while (cursor <= rangeEnd) {
        results.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      break;
    }
    case "weekly": {
      const cursor = new Date(eventStart);
      if (cursor < rangeStart) {
        const diffWeeks = Math.ceil(
          (rangeStart.getTime() - cursor.getTime()) / (7 * 86400000)
        );
        cursor.setDate(cursor.getDate() + diffWeeks * 7);
      }
      while (cursor <= rangeEnd) {
        results.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 7);
      }
      break;
    }
    case "monthly": {
      const day = eventStart.getDate();
      const startMonth =
        rangeStart.getFullYear() * 12 + rangeStart.getMonth();
      const eventMonth =
        eventStart.getFullYear() * 12 + eventStart.getMonth();
      const firstMonth = Math.max(startMonth, eventMonth);
      const endMonth = rangeEnd.getFullYear() * 12 + rangeEnd.getMonth();

      for (let m = firstMonth; m <= endMonth; m++) {
        const year = Math.floor(m / 12);
        const month = m % 12;
        // Handle months with fewer days (e.g., 31st → last day of month)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const actualDay = Math.min(day, daysInMonth);
        const occ = new Date(
          year,
          month,
          actualDay,
          eventStart.getHours(),
          eventStart.getMinutes()
        );
        if (occ >= rangeStart && occ <= rangeEnd) {
          results.push(occ);
        }
      }
      break;
    }
    case "yearly": {
      const month = eventStart.getMonth();
      const day = eventStart.getDate();
      const startYear = Math.max(rangeStart.getFullYear(), eventStart.getFullYear());
      const endYear = rangeEnd.getFullYear();

      for (let y = startYear; y <= endYear; y++) {
        const daysInMonth = new Date(y, month + 1, 0).getDate();
        const actualDay = Math.min(day, daysInMonth);
        const occ = new Date(
          y,
          month,
          actualDay,
          eventStart.getHours(),
          eventStart.getMinutes()
        );
        if (occ >= rangeStart && occ <= rangeEnd) {
          results.push(occ);
        }
      }
      break;
    }
  }

  return results;
}
