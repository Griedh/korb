import { describe, expect, it } from 'vitest';
import { computeTargetDate, findBestTimeslot, parseSchedulerConfig } from '../src/scheduler.js';

describe('scheduler', () => {
  it('computes target date for friday two weeks ahead from saturday trigger', () => {
    const trigger = new Date('2026-04-11T12:05:00Z'); // Saturday
    const target = computeTargetDate(trigger, 'fri', 2);
    expect(target.toISOString().slice(0, 10)).toBe('2026-04-24');
  });

  it('picks a matching timeslot within requested window', () => {
    const cfg = parseSchedulerConfig({
      scheduleWeekday: 'sat',
      scheduleTime: '12:05',
      targetWeekday: 'fri',
      weeksAhead: 2,
      pickupWindow: '18:00-20:00'
    });
    const trigger = new Date('2026-04-11T12:05:00+02:00');
    const slot = findBestTimeslot([
      { id: '1', startTime: '2026-04-24T17:00:00+02:00', endTime: '2026-04-24T18:00:00+02:00', fee: 0 },
      { id: '2', startTime: '2026-04-24T18:30:00+02:00', endTime: '2026-04-24T19:30:00+02:00', fee: 0 },
      { id: '3', startTime: '2026-04-24T19:30:00+02:00', endTime: '2026-04-24T20:30:00+02:00', fee: 0 }
    ], cfg, trigger);

    expect(slot?.id).toBe('2');
  });
});
