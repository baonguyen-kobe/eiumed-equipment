'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayRequests, getBorrowRequest, issueDevices, returnDevices } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, ArrowRightLeft, PackageCheck, PackageX, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { BorrowRequest, HandoverItemInput } from '@/types';

export default function HandoverPage() {
  const searchParams = useSearchParams();
  const requestIdParam = searchParams.get('request');
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [dialogType, setDialogType] = useState<'issue' | 'return' | null>(null);
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverItems, setHandoverItems] = useState<Map<string, HandoverItemInput>>(new Map());
  
  // Fetch today's requests
  const { data: issueRequests, isLoading: issueLoading } = useQuery({
    queryKey: ['today-requests', 'issue'],
    queryFn: () => getTodayRequests('issue'),
  });
  
  const { data: returnRequests, isLoading: returnLoading } = useQuery({
    queryKey: ['today-requests', 'return'],
    queryFn: () => getTodayRequests('return'),
  });
  
  // Fetch specific request if provided in URL
  const { data: paramRequest } = useQuery({
    queryKey: ['borrow-request', requestIdParam],
    queryFn: () => getBorrowRequest(requestIdParam!),
    enabled: !!requestIdParam,
  });
  
  // Issue mutation
  const issueMutation = useMutation({
    mutationFn: ({ requestId, items, note }: { requestId: string; items: HandoverItemInput[]; note?: string }) =>
      issueDevices(requestId, items, note),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['today-requests'] });
        queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
        setDialogType(null);
        setSelectedRequest(null);
        setHandoverNote('');
        setHandoverItems(new Map());
        toast.success('Giao thiết bị thành công');
      } else {
        toast.error(result.error || 'Có lỗi xảy ra');
      }
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Return mutation
  const returnMutation = useMutation({
    mutationFn: ({ requestId, items, note }: { requestId: string; items: HandoverItemInput[]; note?: string }) =>
      returnDevices(requestId, items, note),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['today-requests'] });
        queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
        setDialogType(null);
        setSelectedRequest(null);
        setHandoverNote('');
        setHandoverItems(new Map());
        toast.success('Nhận trả thiết bị thành công');
      } else {
        toast.error(result.error || 'Có lỗi xảy ra');
      }
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  const openHandoverDialog = (request: BorrowRequest, type: 'issue' | 'return') => {
    setSelectedRequest(request);
    setDialogType(type);
    
    // Initialize handover items
    const items = new Map<string, HandoverItemInput>();
    request.items?.forEach(item => {
      items.set(item.device_id, {
        device_id: item.device_id,
        condition: 'Tốt',
        is_missing: false,
        is_broken: false,
      });
    });
    setHandoverItems(items);
  };
  
  const handleSubmitHandover = () => {
    if (!selectedRequest || !dialogType) return;
    
    const items = Array.from(handoverItems.values());
    
    if (dialogType === 'issue') {
      issueMutation.mutate({
        requestId: selectedRequest.id,
        items,
        note: handoverNote,
      });
    } else {
      returnMutation.mutate({
        requestId: selectedRequest.id,
        items,
        note: handoverNote,
      });
    }
  };
  
  const updateHandoverItem = (deviceId: string, updates: Partial<HandoverItemInput>) => {
    setHandoverItems(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(deviceId) || { device_id: deviceId };
      newMap.set(deviceId, { ...current, ...updates });
      return newMap;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Giao - Nhận thiết bị</h2>
        <p className="text-gray-600">
          Quản lý giao và nhận trả thiết bị cho các phiếu mượn
        </p>
      </div>

      {/* Today summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chờ giao</CardTitle>
            <PackageCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issueRequests?.length || 0}</div>
            <p className="text-xs text-gray-500">phiếu đã duyệt hôm nay</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chờ trả</CardTitle>
            <PackageX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returnRequests?.length || 0}</div>
            <p className="text-xs text-gray-500">phiếu đang mượn hôm nay</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'issue' | 'return')}>
        <TabsList>
          <TabsTrigger value="issue">
            Giao thiết bị ({issueRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="return">
            Nhận trả ({returnRequests?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="issue" className="mt-4">
          {issueLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : issueRequests?.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                Không có phiếu nào cần giao hôm nay
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {issueRequests?.map((request) => (
                <RequestCard 
                  key={request.id} 
                  request={request}
                  actionLabel="Giao thiết bị"
                  onAction={() => openHandoverDialog(request, 'issue')}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="return" className="mt-4">
          {returnLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : returnRequests?.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                Không có phiếu nào cần nhận trả hôm nay
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {returnRequests?.map((request) => (
                <RequestCard 
                  key={request.id} 
                  request={request}
                  actionLabel="Nhận trả"
                  onAction={() => openHandoverDialog(request, 'return')}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Handover Dialog */}
      <Dialog open={!!dialogType} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'issue' ? 'Giao thiết bị' : 'Nhận trả thiết bị'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Phiếu mượn của <strong>{selectedRequest.creator?.full_name}</strong> - 
                  Ca {selectedRequest.time_slot?.name} - 
                  Phòng {selectedRequest.room || 'Chưa xác định'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Device list */}
            <div className="space-y-3">
              {selectedRequest?.items?.map((item) => {
                const handoverItem = handoverItems.get(item.device_id);
                return (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.device?.name}</p>
                        <p className="text-sm text-gray-500">{item.device?.code}</p>
                      </div>
                    </div>
                    
                    {dialogType === 'return' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`missing-${item.device_id}`}
                            checked={handoverItem?.is_missing || false}
                            onCheckedChange={(checked) => 
                              updateHandoverItem(item.device_id, { is_missing: !!checked })
                            }
                          />
                          <label 
                            htmlFor={`missing-${item.device_id}`}
                            className="text-sm text-red-600"
                          >
                            Thiếu / Mất
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`broken-${item.device_id}`}
                            checked={handoverItem?.is_broken || false}
                            onCheckedChange={(checked) => 
                              updateHandoverItem(item.device_id, { is_broken: !!checked })
                            }
                          />
                          <label 
                            htmlFor={`broken-${item.device_id}`}
                            className="text-sm text-orange-600"
                          >
                            Hỏng
                          </label>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Tình trạng {dialogType === 'issue' ? 'khi giao' : 'khi trả'}
                      </Label>
                      <Select
                        value={handoverItem?.condition || 'Tốt'}
                        onValueChange={(value) => 
                          updateHandoverItem(item.device_id, { condition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tốt">Tốt</SelectItem>
                          <SelectItem value="Bình thường">Bình thường</SelectItem>
                          <SelectItem value="Có vấn đề nhỏ">Có vấn đề nhỏ</SelectItem>
                          <SelectItem value="Cần kiểm tra">Cần kiểm tra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Note */}
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                placeholder="Ghi chú về việc giao/nhận..."
                rows={3}
              />
            </div>
            
            {/* Warning for issues */}
            {dialogType === 'return' && 
              Array.from(handoverItems.values()).some(item => item.is_missing || item.is_broken) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">
                  Một số thiết bị có vấn đề. Hệ thống sẽ tự động cập nhật trạng thái thiết bị.
                </span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitHandover}
              disabled={issueMutation.isPending || returnMutation.isPending}
            >
              {(issueMutation.isPending || returnMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận {dialogType === 'issue' ? 'giao' : 'nhận trả'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({ 
  request, 
  actionLabel, 
  onAction 
}: { 
  request: BorrowRequest; 
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{request.creator?.full_name}</span>
              <Badge variant="outline">{request.time_slot?.name}</Badge>
              {request.room && (
                <Badge variant="secondary">Phòng {request.room}</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {request.items?.length || 0} thiết bị • 
              Tạo lúc {format(new Date(request.created_at), 'HH:mm', { locale: vi })}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {request.items?.slice(0, 3).map((item) => (
                <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {item.device?.code}
                </span>
              ))}
              {(request.items?.length || 0) > 3 && (
                <span className="text-xs text-gray-500">
                  +{(request.items?.length || 0) - 3} khác
                </span>
              )}
            </div>
          </div>
          
          <Button onClick={onAction}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
