import { createClient } from '@/lib/supabase/client';
import type { Device, DeviceCategory, CreateDeviceInput, UpdateDeviceInput, DeviceEvent, CreateDeviceEventInput } from '@/types';

const supabase = createClient();

// Device Categories
export async function getDeviceCategories(): Promise<DeviceCategory[]> {
  const { data, error } = await supabase
    .from('device_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createDeviceCategory(input: { name: string; code_prefix: string; description?: string }): Promise<DeviceCategory> {
  const { data, error } = await supabase
    .from('device_categories')
    .insert(input)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDeviceCategory(id: string, input: Partial<{ name: string; code_prefix: string; description?: string }>): Promise<DeviceCategory> {
  const { data, error } = await supabase
    .from('device_categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteDeviceCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('device_categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Devices
export async function getDevices(filters?: {
  category_id?: string;
  status?: string;
  search?: string;
}): Promise<Device[]> {
  let query = supabase
    .from('devices')
    .select('*, category:device_categories(*)');
  
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query.order('code');
  
  if (error) throw error;
  return data || [];
}

export async function getDevice(id: string): Promise<Device | null> {
  const { data, error } = await supabase
    .from('devices')
    .select('*, category:device_categories(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createDevice(input: CreateDeviceInput): Promise<Device> {
  const { data, error } = await supabase
    .from('devices')
    .insert({
      ...input,
      status: 'AVAILABLE',
    })
    .select('*, category:device_categories(*)')
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDevice(id: string, input: UpdateDeviceInput): Promise<Device> {
  const { data, error } = await supabase
    .from('devices')
    .update(input)
    .eq('id', id)
    .select('*, category:device_categories(*)')
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteDevice(id: string): Promise<void> {
  const { error } = await supabase
    .from('devices')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Device Events
export async function getDeviceEvents(deviceId: string): Promise<DeviceEvent[]> {
  const { data, error } = await supabase
    .from('device_events')
    .select('*, performer:users(*)')
    .eq('device_id', deviceId)
    .order('event_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createDeviceEvent(input: CreateDeviceEventInput): Promise<DeviceEvent> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('device_events')
    .insert({
      ...input,
      performed_by: user?.id,
    })
    .select('*, performer:users(*)')
    .single();
  
  if (error) throw error;
  return data;
}

// Available devices for borrowing
export async function getAvailableDevices(date: string, timeSlotId: string): Promise<Device[]> {
  // First get all available devices
  const { data: devices, error: devicesError } = await supabase
    .from('devices')
    .select('*, category:device_categories(*)')
    .eq('status', 'AVAILABLE')
    .order('code');
  
  if (devicesError) throw devicesError;
  
  // Get reserved device IDs for the given date and time slot
  const { data: reservations, error: reservationsError } = await supabase
    .from('device_reservations')
    .select('device_id, borrow_request:borrow_requests!inner(status)')
    .eq('date', date)
    .eq('time_slot_id', timeSlotId)
    .in('borrow_request.status', ['APPROVED', 'IN_USE']);
  
  if (reservationsError) throw reservationsError;
  
  const reservedDeviceIds = new Set(reservations?.map(r => r.device_id) || []);
  
  // Filter out reserved devices
  return (devices || []).filter(d => !reservedDeviceIds.has(d.id));
}

// Generate next device code
export async function generateDeviceCode(categoryId: string): Promise<string> {
  // Get category prefix
  const { data: category, error: categoryError } = await supabase
    .from('device_categories')
    .select('code_prefix')
    .eq('id', categoryId)
    .single();
  
  if (categoryError) throw categoryError;
  
  // Get the last device code with this prefix
  const { data: lastDevice, error: lastDeviceError } = await supabase
    .from('devices')
    .select('code')
    .ilike('code', `${category.code_prefix}%`)
    .order('code', { ascending: false })
    .limit(1)
    .single();
  
  if (lastDeviceError && lastDeviceError.code !== 'PGRST116') {
    throw lastDeviceError;
  }
  
  let nextNumber = 1;
  if (lastDevice) {
    const match = lastDevice.code.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  
  return `${category.code_prefix}${String(nextNumber).padStart(4, '0')}`;
}
