import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { formatTime24Hour, generateHourlySlots } from '@/lib/timeFormatter';

export const useAvailability = () => {
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [weekly, excepts, books] = await Promise.all([
        pb.collection('weekly_availability').getFullList({ $autoCancel: false }),
        pb.collection('availability_exceptions').getFullList({ $autoCancel: false }),
        pb.collection('bookings').getFullList({ 
          sort: '-date',
          $autoCancel: false 
        })
      ]);

      setWeeklyAvailability(weekly);
      setExceptions(excepts);
      setBookings(books);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getDayName = useCallback((date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }, []);

  const formatDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getDailyConfig = useCallback((date) => {
    const dateStr = formatDate(date);
    
    const exception = exceptions.find(e => e.exceptionDate.split(' ')[0] === dateStr);
    if (exception) {
      if (exception.isClosed) return { isClosed: true, ranges: [] };
      const ranges = Array.isArray(exception.timeSlots) ? exception.timeSlots : [];
      return { isClosed: false, ranges };
    }

    const dayName = getDayName(date);
    const weekly = weeklyAvailability.find(w => w.dayOfWeek === dayName);
    
    if (weekly) {
      const ranges = Array.isArray(weekly.timeSlots) ? weekly.timeSlots : [];
      return { isClosed: false, ranges };
    }

    return { isClosed: true, ranges: [] };
  }, [exceptions, weeklyAvailability, formatDate, getDayName]);

  const getAvailableTimesForDate = useCallback((date) => {
    const config = getDailyConfig(date);
    if (config.isClosed) return [];

    let allSlots = [];
    const ranges = Array.isArray(config.ranges) ? config.ranges : [];

    ranges.forEach(range => {
      if (range && typeof range === 'object' && range.startTime && range.endTime) {
        try {
          const slots = generateHourlySlots(range.startTime, range.endTime);
          allSlots = [...allSlots, ...slots];
        } catch (e) {
          // Silently handle
        }
      }
    });

    return [...new Set(allSlots)].sort();
  }, [getDailyConfig]);

  const getSlotCapacity = useCallback((date, time) => {
    const dateStr = formatDate(date);
    const timeStr = formatTime24Hour(time);
    
    const slotBookings = bookings.filter(b => {
      const bookingDate = b.date.split(' ')[0];
      const bookingTime = formatTime24Hour(b.time);
      return bookingDate === dateStr && bookingTime === timeStr;
    });

    const totalClients = slotBookings.reduce((acc, b) => acc + (b.numberOfClients || 1), 0);
    const maxCapacity = 2;
    
    return {
      totalSpots: maxCapacity, 
      totalClients,
      maxCapacity,
      remainingSpots: Math.max(0, maxCapacity - totalClients),
      isFull: totalClients >= maxCapacity
    };
  }, [bookings, formatDate]);

  return {
    loading,
    error,
    refresh: fetchData,
    getAvailableTimesForDate,
    getSlotCapacity,
    weeklyAvailability,
    exceptions
  };
};