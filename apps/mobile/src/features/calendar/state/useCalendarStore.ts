import { useState, useCallback } from 'react';
import { SanitizedEventItem } from '../domain/calendar.types';

export function useCalendarState() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().split('T')[0]);

  // Modals & Bottom Sheets
  const [isIdeasSheetOpen, setIsIdeasSheetOpen] = useState<boolean>(false);
  const [isSurpriseSelectorOpen, setIsSurpriseSelectorOpen] = useState<boolean>(false);
  const [isCreateSurpriseFlowOpen, setIsCreateSurpriseFlowOpen] = useState<boolean>(false);
  const [isRandomDateModalOpen, setIsRandomDateModalOpen] = useState<boolean>(false);
  const [isFutureLetterModalOpen, setIsFutureLetterModalOpen] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [completedEventForMemory, setCompletedEventForMemory] = useState<SanitizedEventItem | null>(null);

  const prevMonth = useCallback(() => {
    setCurrentMonthIndex((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonthIndex((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  return {
    currentYear,
    currentMonthIndex,
    selectedDate,
    setSelectedDate,
    prevMonth,
    nextMonth,
    isIdeasSheetOpen,
    setIsIdeasSheetOpen,
    isSurpriseSelectorOpen,
    setIsSurpriseSelectorOpen,
    isCreateSurpriseFlowOpen,
    setIsCreateSurpriseFlowOpen,
    isRandomDateModalOpen,
    setIsRandomDateModalOpen,
    isFutureLetterModalOpen,
    setIsFutureLetterModalOpen,
    selectedEventId,
    setSelectedEventId,
    completedEventForMemory,
    setCompletedEventForMemory,
  };
}
