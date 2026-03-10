import { create } from "zustand";
import { toDateString } from "@/utils/date";

interface CalendarState {
  selectedDate: string;
  currentMonth: Date;
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (month: Date) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: toDateString(new Date()),
  currentMonth: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
}));
