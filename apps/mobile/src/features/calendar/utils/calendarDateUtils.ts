export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const WEEKDAYS_SHORT_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export interface MonthGridDay {
  dayNumber: number | null;
  dateString: string | null;
  isToday: boolean;
}

export function buildMonthGrid(year: number, monthIndex: number): MonthGridDay[] {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // 0 = Lunes, 6 = Domingo
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  const todayStr = '2026-08-23'; // Reference current date
  const grid: MonthGridDay[] = [];

  // Blank days before first day of month
  for (let i = 0; i < adjustedFirstDay; i++) {
    grid.push({ dayNumber: null, dateString: null, isToday: false });
  }

  for (let d = 1; d <= totalDays; d++) {
    const mStr = (monthIndex + 1).toString().padStart(2, '0');
    const dStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    grid.push({
      dayNumber: d,
      dateString: dateStr,
      isToday: dateStr === todayStr,
    });
  }

  return grid;
}

export function formatDateNice(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    return `${d} de ${MONTH_NAMES_ES[m - 1]} de ${y}`;
  } catch {
    return dateStr;
  }
}

export function getDaysUntil(targetDateStr: string): number {
  try {
    const now = new Date('2026-08-23T00:00:00');
    const target = new Date(`${targetDateStr}T00:00:00`);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
