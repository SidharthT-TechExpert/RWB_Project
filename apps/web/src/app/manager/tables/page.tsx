'use client';

import { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CalendarCheck, Users, Plus, CheckCircle2, Clock, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface TableItem {
  id: string;
  tableNo: string;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentGuest?: string;
  reservedTime?: string;
}

export default function ManagerTablesPage() {
  const [tables, setTables] = useState<TableItem[]>([
    { id: '1', tableNo: 'T-01', capacity: 2, section: 'Main Hall', status: 'occupied', currentGuest: 'Neha Patel' },
    { id: '2', tableNo: 'T-02', capacity: 4, section: 'Main Hall', status: 'available' },
    { id: '3', tableNo: 'T-03', capacity: 4, section: 'Patio', status: 'reserved', currentGuest: 'Rahul M.', reservedTime: '7:30 PM' },
    { id: '4', tableNo: 'T-04', capacity: 6, section: 'VIP Lounge', status: 'occupied', currentGuest: 'Rohan Sharma' },
    { id: '5', tableNo: 'T-05', capacity: 2, section: 'Main Hall', status: 'cleaning' },
    { id: '6', tableNo: 'T-06', capacity: 4, section: 'Patio', status: 'available' },
    { id: '7', tableNo: 'T-07', capacity: 8, section: 'VIP Lounge', status: 'reserved', currentGuest: 'Corporate Dinner', reservedTime: '8:00 PM' },
    { id: '8', tableNo: 'T-08', capacity: 4, section: 'Main Hall', status: 'occupied', currentGuest: 'Vikram Singh' },
  ]);

  const updateTableStatus = (id: string, status: TableItem['status']) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Table status updated to ${status.toUpperCase()}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#030816]">
      <ManagerHeader pageTitle="Branch Tables & Reservations" />

      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto pb-16">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070D1F] p-6 rounded-2xl border border-white/8 shadow-xl">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-purple-400" /> Floor Plan & Seating Roster
            </h2>
            <p className="text-xs text-slate-400 mt-1">Manage live table availability, guest check-ins, and walk-in assignments.</p>
          </div>

          <Button onClick={() => toast.success('Add Walk-in Check-in Modal')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-4">
            <UserPlus className="w-4 h-4" />
            <span>Walk-in Check-in</span>
          </Button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl bg-[#060C1E] border border-white/8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-lg text-white">{t.tableNo}</span>
                  <p className="text-[10px] text-slate-400 font-medium">{t.section}</p>
                </div>
                <Badge
                  variant={
                    t.status === 'occupied'
                      ? 'destructive'
                      : t.status === 'reserved'
                      ? 'warning'
                      : t.status === 'cleaning'
                      ? 'secondary'
                      : 'success'
                  }
                  className="capitalize font-bold text-xs px-2.5 py-0.5"
                >
                  {t.status}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-white/4 border border-white/6 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Capacity:</span>
                  <span className="font-bold text-white">{t.capacity} Guests</span>
                </div>
                {t.currentGuest && (
                  <div className="flex justify-between text-slate-400">
                    <span>Guest:</span>
                    <span className="font-bold text-white">{t.currentGuest}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {t.status !== 'available' && (
                  <Button size="sm" variant="outline" onClick={() => updateTableStatus(t.id, 'available')} className="h-8 text-xs font-bold text-emerald-400 border-emerald-500/30">
                    Set Free
                  </Button>
                )}
                {t.status === 'available' && (
                  <Button size="sm" onClick={() => updateTableStatus(t.id, 'occupied')} className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white col-span-2">
                    Occupy Table
                  </Button>
                )}
                {t.status === 'occupied' && (
                  <Button size="sm" variant="outline" onClick={() => updateTableStatus(t.id, 'cleaning')} className="h-8 text-xs font-bold text-purple-400 border-purple-500/30">
                    Clean Table
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
