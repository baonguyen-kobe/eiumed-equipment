import { createClient } from '@/lib/supabase/client';
import type { BorrowRequest, BorrowRequestItem, CreateBorrowRequestInput, ApproveRequestResult, HandoverItemInput } from '@/types';

const supabase = createClient();

// Borrow Requests
export async function getBorrowRequests(filters?: {
  status?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
}): Promise<BorrowRequest[]> {
  let query = supabase
    .from('borrow_requests')
    .select(`
      *,
      creator:users!borrow_requests_created_by_fkey(*),
      approver:users!borrow_requests_approved_by_fkey(*),
      time_slot:time_slots(*),
      items:borrow_request_items(*, device:devices(*, category:device_categories(*)))
    `);
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by);
  }
  
  if (filters?.date_from) {
    query = query.gte('requested_date', filters.date_from);
  }
  
  if (filters?.date_to) {
    query = query.lte('requested_date', filters.date_to);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getBorrowRequest(id: string): Promise<BorrowRequest | null> {
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(`
      *,
      creator:users!borrow_requests_created_by_fkey(*),
      approver:users!borrow_requests_approved_by_fkey(*),
      time_slot:time_slots(*),
      items:borrow_request_items(*, device:devices(*, category:device_categories(*)))
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createBorrowRequest(input: CreateBorrowRequestInput): Promise<BorrowRequest> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Không tìm thấy thông tin người dùng');
  
  // Create the request
  const { data: request, error: requestError } = await supabase
    .from('borrow_requests')
    .insert({
      created_by: user.id,
      requested_date: input.requested_date,
      time_slot_id: input.time_slot_id,
      room: input.room,
      purpose: input.purpose,
      note: input.note,
      status: 'SUBMITTED', // Auto-submit
    })
    .select()
    .single();
  
  if (requestError) throw requestError;
  
  // Create request items
  const items = input.device_ids.map(device_id => ({
    borrow_request_id: request.id,
    device_id,
    quantity_requested: 1,
  }));
  
  const { error: itemsError } = await supabase
    .from('borrow_request_items')
    .insert(items);
  
  if (itemsError) {
    // Rollback: delete the request
    await supabase.from('borrow_requests').delete().eq('id', request.id);
    throw itemsError;
  }
  
  // Fetch the complete request
  return getBorrowRequest(request.id) as Promise<BorrowRequest>;
}

export async function updateBorrowRequest(
  id: string, 
  input: Partial<CreateBorrowRequestInput>
): Promise<BorrowRequest> {
  const { device_ids, ...requestInput } = input;
  
  // Update request
  const { error: requestError } = await supabase
    .from('borrow_requests')
    .update(requestInput)
    .eq('id', id);
  
  if (requestError) throw requestError;
  
  // Update items if provided
  if (device_ids) {
    // Delete existing items
    await supabase
      .from('borrow_request_items')
      .delete()
      .eq('borrow_request_id', id);
    
    // Insert new items
    const items = device_ids.map(device_id => ({
      borrow_request_id: id,
      device_id,
      quantity_requested: 1,
    }));
    
    const { error: itemsError } = await supabase
      .from('borrow_request_items')
      .insert(items);
    
    if (itemsError) throw itemsError;
  }
  
  return getBorrowRequest(id) as Promise<BorrowRequest>;
}

export async function submitBorrowRequest(id: string): Promise<BorrowRequest> {
  const { error } = await supabase
    .from('borrow_requests')
    .update({ status: 'SUBMITTED' })
    .eq('id', id);
  
  if (error) throw error;
  
  return getBorrowRequest(id) as Promise<BorrowRequest>;
}

export async function cancelBorrowRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('borrow_requests')
    .update({ status: 'CANCELLED' })
    .eq('id', id);
  
  if (error) throw error;
}

// Approval functions (calls database functions)
export async function approveBorrowRequest(id: string, note?: string): Promise<ApproveRequestResult> {
  const { data, error } = await supabase
    .rpc('approve_borrow_request', {
      p_request_id: id,
      p_qtvt_note: note,
    });
  
  if (error) throw error;
  return data as ApproveRequestResult;
}

export async function rejectBorrowRequest(id: string, note?: string): Promise<ApproveRequestResult> {
  const { data, error } = await supabase
    .rpc('reject_borrow_request', {
      p_request_id: id,
      p_qtvt_note: note,
    });
  
  if (error) throw error;
  return data as ApproveRequestResult;
}

// Handover functions
export async function issueDevices(
  requestId: string, 
  items: HandoverItemInput[], 
  note?: string
): Promise<{ success: boolean; error?: string; handover_id?: string }> {
  const { data, error } = await supabase
    .rpc('issue_devices', {
      p_request_id: requestId,
      p_items: items,
      p_note: note,
    });
  
  if (error) throw error;
  return data;
}

export async function returnDevices(
  requestId: string, 
  items: HandoverItemInput[], 
  note?: string
): Promise<{ success: boolean; error?: string; handover_id?: string }> {
  const { data, error } = await supabase
    .rpc('return_devices', {
      p_request_id: requestId,
      p_items: items,
      p_note: note,
    });
  
  if (error) throw error;
  return data;
}

// Get today's requests for handover
export async function getTodayRequests(type: 'issue' | 'return'): Promise<BorrowRequest[]> {
  const today = new Date().toISOString().split('T')[0];
  
  let query = supabase
    .from('borrow_requests')
    .select(`
      *,
      creator:users!borrow_requests_created_by_fkey(*),
      time_slot:time_slots(*),
      items:borrow_request_items(*, device:devices(*, category:device_categories(*)))
    `)
    .eq('requested_date', today);
  
  if (type === 'issue') {
    query = query.eq('status', 'APPROVED');
  } else {
    query = query.eq('status', 'IN_USE');
  }
  
  const { data, error } = await query.order('time_slot_id');
  
  if (error) throw error;
  return data || [];
}

// Get handover history for a request
export async function getHandoverRecords(requestId: string) {
  const { data, error } = await supabase
    .from('handover_records')
    .select(`
      *,
      performer:users(*),
      items:handover_items(*, device:devices(*))
    `)
    .eq('borrow_request_id', requestId)
    .order('performed_at');
  
  if (error) throw error;
  return data || [];
}
