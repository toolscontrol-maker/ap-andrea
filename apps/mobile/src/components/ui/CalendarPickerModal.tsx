import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { triggerHaptic } from '../../utils/haptics';

interface CalendarPickerModalProps {
  visible: boolean;
  initialDate?: string; // YYYY-MM-DD
  title?: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function CalendarPickerModal({
  visible,
  initialDate,
  title = 'Selecciona una fecha',
  onSelectDate,
  onClose,
}: CalendarPickerModalProps) {
  const initial = initialDate ? new Date(initialDate) : new Date();
  const validInitial = isNaN(initial.getTime()) ? new Date() : initial;

  const [currentYear, setCurrentYear] = useState(validInitial.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(validInitial.getMonth());
  const [selectedDay, setSelectedDay] = useState(validInitial.getDate());

  const handlePrevMonth = () => {
    triggerHaptic('light');
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic('light');
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

  const handleSelectDay = (day: number) => {
    triggerHaptic('selection');
    setSelectedDay(day);
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateString = currentYear + '-' + mm + '-' + dd;
    onSelectDate(dateString);
    onClose();
  };

  const handleSetToday = () => {
    triggerHaptic('selection');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateString = yyyy + '-' + mm + '-' + dd;
    onSelectDate(dateString);
    onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    return selectedDay === day;
  };

  // Build grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Month / Year navigation */}
          <View style={styles.monthNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>◀</Text>
            </TouchableOpacity>

            <Text style={styles.monthYearText}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>

            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Day of week labels */}
          <View style={styles.weekLabelsRow}>
            {DAY_LABELS.map((lbl, idx) => (
              <Text key={idx} style={styles.weekLabelText}>
                {lbl}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <View key={idx} style={styles.dayCellEmpty} />;
              }

              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    today && styles.dayCellToday,
                    selected && styles.dayCellSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      today && styles.dayTextToday,
                      selected && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer Quick Actions */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSetToday} style={styles.todayBtn}>
              <Text style={styles.todayBtnText}>⭐ Hoy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#766B72',
    fontWeight: '700',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  navBtn: {
    padding: 6,
  },
  navBtnText: {
    fontSize: 14,
    color: '#EF826A',
    fontWeight: '700',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  weekLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  weekLabelText: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#A89FA4',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCellEmpty: {
    width: 38,
    height: 38,
    marginVertical: 2,
  },
  dayCell: {
    width: 38,
    height: 38,
    marginVertical: 2,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#EF826A',
  },
  dayCellSelected: {
    backgroundColor: '#EF826A',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A2F38',
  },
  dayTextToday: {
    color: '#EF826A',
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 47, 56, 0.08)',
  },
  todayBtn: {
    backgroundColor: '#FFF3EE',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF826A',
  },
  cancelBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#766B72',
  },
});
