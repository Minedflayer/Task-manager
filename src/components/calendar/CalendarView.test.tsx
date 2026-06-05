import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CalendarView } from './CalendarView';
import { state$ } from '@/lib/state/store';

describe('CalendarView', () => {
  it('renders a daily/weekly toggle and defaults to weekly view', () => {
    render(<CalendarView />);
    
    const weeklyBtn = screen.getByRole('button', { name: /weekly/i });
    const dailyBtn = screen.getByRole('button', { name: /daily/i });
    
    expect(weeklyBtn).toBeInTheDocument();
    expect(dailyBtn).toBeInTheDocument();
    
    // Default is weekly: should show day headers
    expect(screen.getByText(/mon/i)).toBeInTheDocument();
  });

  it('switches to daily view when daily button is clicked', async () => {
    render(<CalendarView />);
    
    const dailyBtn = screen.getByRole('button', { name: /daily/i });
    fireEvent.click(dailyBtn);
    
    // Daily view shows a single "Today" heading or a date string
    // waitFor handles Framer Motion's AnimatePresence animation delay
    await waitFor(() => {
      expect(screen.getByText(/today/i)).toBeInTheDocument();
    });
    
    // Should NOT show multiple day column headers
    expect(screen.queryByText(/^tue$/i)).not.toBeInTheDocument();
  });

  it('shows tasks in the correct time slot', () => {
    state$.tasks.set([
      { id: 'task-1', title: 'Morning standup', status: 'pending', category_id: null, scheduled_date: '2026-06-08', scheduled_time: '09:00' }
    ]);
    
    render(<CalendarView referenceDate={new Date('2026-06-08')} />);
    
    // The task title should appear in the calendar
    expect(screen.getByText('Morning standup')).toBeInTheDocument();
  });
});
