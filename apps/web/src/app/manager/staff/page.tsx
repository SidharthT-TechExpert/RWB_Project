'use client';

import { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, UserCheck, Plus, CheckCircle2, Phone, Mail, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  shift: string;
  status: 'on_duty' | 'off_duty' | 'break';
}

export default function ManagerStaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: '1', name: 'Rajesh Kumar', role: 'Head Waiter', phone: '+1 212-555-0188', shift: '09:00 AM - 05:00 PM', status: 'on_duty' },
    { id: '2', name: 'Sunita Devi', role: 'Line Chef', phone: '+1 212-555-0177', shift: '10:00 AM - 06:00 PM', status: 'on_duty' },
    { id: '3', name: 'Amit Roy', role: 'Cashier', phone: '+1 212-555-0144', shift: '08:00 AM - 04:00 PM', status: 'on_duty' },
    { id: '4', name: 'Pooja Singh', role: 'Junior Waiter', phone: '+1 212-555-0122', shift: '04:00 PM - 11:00 PM', status: 'off_duty' },
  ]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#030816]">
      <ManagerHeader pageTitle="Branch Staff Roster & Attendance" />

      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070D1F] p-6 rounded-2xl border border-white/8 shadow-xl">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Outlet Staff Directory & Shifts
            </h2>
            <p className="text-xs text-slate-400 mt-1">Manage shift rosters, waiter assignments, and attendance logs for your outlet.</p>
          </div>

          <Button onClick={() => toast.success('Staff check-in logged')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-4">
            <UserCheck className="w-4 h-4" />
            <span>Clock-in Staff</span>
          </Button>
        </div>

        {/* Staff Table */}
        <div className="rounded-2xl border border-white/8 bg-[#060C1E] overflow-hidden shadow-xl">
          <table className="w-full text-sm">
            <thead className="bg-white/4 border-b border-white/8">
              <tr>
                {['Staff Member', 'Role', 'Contact Phone', 'Assigned Shift', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 font-extrabold text-white">{s.name}</td>
                  <td className="px-5 py-4 text-xs text-blue-400 font-bold">{s.role}</td>
                  <td className="px-5 py-4 text-xs text-slate-300 font-mono">{s.phone}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">{s.shift}</td>
                  <td className="px-5 py-4">
                    <Badge variant={s.status === 'on_duty' ? 'success' : 'secondary'} className="capitalize font-bold text-xs px-2.5 py-0.5">
                      {s.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
