import type { mkReweAuthedClient } from './rewe-api.js';
import type { Timeslot } from './types/rewe.js';

export type ReweClient = ReturnType<typeof mkReweAuthedClient>;

const weekdayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type Weekday = typeof weekdayNames[number];

export interface SchedulerConfig {
  scheduleWeekday: Weekday;
  scheduleTime: string;
  targetWeekday: Weekday;
  weeksAhead: number;
  pickupWindow: string;
}

export interface ParsedSchedulerConfig {
  scheduleWeekday: Weekday;
  scheduleHour: number;
  scheduleMinute: number;
  targetWeekday: Weekday;
  weeksAhead: number;
  windowStartMinutes: number;
  windowEndMinutes: number;
}

const parseWeekday = (value: string): Weekday => {
  const normalized = value.trim().slice(0, 3).toLowerCase();
  const weekday = weekdayNames.find((d) => d === normalized);
  if (!weekday) throw new Error(`Invalid weekday '${value}'. Expected one of: ${weekdayNames.join(', ')}`);
  return weekday;
};

const parseClockTime = (value: string): { hour: number; minute: number } => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error(`Invalid time '${value}'. Expected HH:MM.`);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error(`Invalid time '${value}'. Hour 0-23 and minute 0-59 expected.`);
  return { hour, minute };
};

const parsePickupWindow = (value: string): { startMinutes: number; endMinutes: number } => {
  const match = value.trim().match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
  if (!match) throw new Error(`Invalid pickup window '${value}'. Expected HH:MM-HH:MM.`);
  const start = parseClockTime(match[1]);
  const end = parseClockTime(match[2]);
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  if (startMinutes >= endMinutes) throw new Error(`Invalid pickup window '${value}'. Start must be before end.`);
  return { startMinutes, endMinutes };
};

export const parseSchedulerConfig = (input: SchedulerConfig): ParsedSchedulerConfig => {
  const scheduleTime = parseClockTime(input.scheduleTime);
  const pickupWindow = parsePickupWindow(input.pickupWindow);
  if (input.weeksAhead < 0) throw new Error('weeksAhead must be >= 0');
  return {
    scheduleWeekday: parseWeekday(input.scheduleWeekday),
    scheduleHour: scheduleTime.hour,
    scheduleMinute: scheduleTime.minute,
    targetWeekday: parseWeekday(input.targetWeekday),
    weeksAhead: input.weeksAhead,
    windowStartMinutes: pickupWindow.startMinutes,
    windowEndMinutes: pickupWindow.endMinutes
  };
};

const toWeekdayNumber = (day: Weekday): number => weekdayNames.indexOf(day);

export const computeTargetDate = (triggerDate: Date, targetWeekday: Weekday, weeksAhead: number): Date => {
  const result = new Date(triggerDate);
  result.setHours(0, 0, 0, 0);
  const firstOccurrenceDiff = (toWeekdayNumber(targetWeekday) - result.getDay() + 7) % 7;
  const additionalWeeks = Math.max(0, weeksAhead - 1);
  result.setDate(result.getDate() + firstOccurrenceDiff + additionalWeeks * 7);
  return result;
};

const slotMatchesWindow = (slot: Timeslot, targetDate: Date, startMinutes: number, endMinutes: number): boolean => {
  const datePart = slot.startTime.slice(0, 10);
  const timePart = slot.startTime.slice(11, 16);
  const targetKey = targetDate.toISOString().slice(0, 10);
  if (!/^\d{2}:\d{2}$/.test(timePart)) return false;
  if (datePart !== targetKey) return false;
  const [hour, minute] = timePart.split(':').map(Number);
  const totalMinutes = hour * 60 + minute;
  return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
};

export const findBestTimeslot = (slots: Timeslot[], parsed: ParsedSchedulerConfig, triggerDate: Date): Timeslot | undefined => {
  const targetDate = computeTargetDate(triggerDate, parsed.targetWeekday, parsed.weeksAhead);
  const matching = slots.filter((slot) => slotMatchesWindow(slot, targetDate, parsed.windowStartMinutes, parsed.windowEndMinutes));
  matching.sort((a, b) => new Date(a.startTime).valueOf() - new Date(b.startTime).valueOf());
  return matching[0];
};

const isDueNow = (parsed: ParsedSchedulerConfig, now: Date): boolean =>
  now.getDay() === toWeekdayNumber(parsed.scheduleWeekday)
  && now.getHours() === parsed.scheduleHour
  && now.getMinutes() === parsed.scheduleMinute;

export const executeScheduledPurchase = (client: ReweClient, parsed: ParsedSchedulerConfig, now = new Date()) => {
  const slots = client.slots().getTimeslotsCheckout;
  const slot = findBestTimeslot(slots, parsed, now);
  if (!slot) throw new Error('No matching timeslot found for configured target date/window.');
  client.checkoutTimeslot(slot.id);
  return client.orderCheckout();
};

export const startScheduler = (client: ReweClient, parsed: ParsedSchedulerConfig, runOnce = false) => {
  const tick = () => {
    const now = new Date();
    if (!isDueNow(parsed, now)) return;
    executeScheduledPurchase(client, parsed, now);
  };

  if (runOnce) {
    tick();
    return;
  }

  tick();
  setInterval(tick, 60_000);
};
