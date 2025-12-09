import { createClient } from '@/lib/supabase/client';
import type { TimeSlot, User } from '@/types';

const supabase = createClient();

// Time Slots
export async function getTimeSlots(activeOnly = true): Promise<TimeSlot[]> {
  let query = supabase
    .from('time_slots')
    .select('*')
    .order('start_time');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function createTimeSlot(input: { 
  code: string; 
  name: string; 
  start_time: string; 
  end_time: string;
}): Promise<TimeSlot> {
  const { data, error } = await supabase
    .from('time_slots')
    .insert(input)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTimeSlot(id: string, input: Partial<{ 
  code: string; 
  name: string; 
  start_time: string; 
  end_time: string;
  is_active: boolean;
}>): Promise<TimeSlot> {
  const { data, error } = await supabase
    .from('time_slots')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTimeSlot(id: string): Promise<void> {
  const { error } = await supabase
    .from('time_slots')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('full_name');
  
  if (error) throw error;
  return data || [];
}

export async function updateUserRole(id: string, role: 'ADMIN' | 'QTVT' | 'GIANGVIEN'): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Reports
export async function getCurrentBorrows() {
  const { data, error } = await supabase
    .from('devices')
    .select(`
      *,
      category:device_categories(*),
      reservations:device_reservations(
        *,
        borrow_request:borrow_requests(
          *,
          creator:users!borrow_requests_created_by_fkey(*),
          time_slot:time_slots(*)
        )
      )
    `)
    .eq('status', 'IN_USE');
  
  if (error) throw error;
  return data || [];
}

export async function getDeviceBorrowHistory(deviceId: string) {
  const { data, error } = await supabase
    .from('borrow_request_items')
    .select(`
      *,
      borrow_request:borrow_requests(
        *,
        creator:users!borrow_requests_created_by_fkey(*),
        time_slot:time_slots(*)
      )
    `)
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getUserBorrowHistory(userId: string) {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
      *,
      time_slot:time_slots(*),
      items:borrow_request_items(*, device:devices(*))
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}
