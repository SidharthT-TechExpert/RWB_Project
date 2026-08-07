'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Phone, Calendar, Award, Filter, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
  status: 'VIP' | 'Regular' | 'New';
}

const mockGuests: Guest[] = [
  { id: '1', name: 'Alex Morgan', email: 'alex.m@example.com', phone: '+1 212-555-0182', totalVisits: 14, totalSpent: 1240, lastVisit: '2 days ago', status: 'VIP' },
  { id: '2', name: 'Sophia Chen', email: 'sophia.c@example.com', phone: '+1 212-555-0199', totalVisits: 8, totalSpent: 620, lastVisit: 'Yesterday', status: 'Regular' },
  { id: '3', name: 'Marcus Vance', email: 'marcus.v@example.com', phone: '+1 212-555-0143', totalVisits: 22, totalSpent: 2890, lastVisit: 'Today', status: 'VIP' },
  { id: '4', name: 'Elena Rostova', email: 'elena.r@example.com', phone: '+1 212-555-0176', totalVisits: 1, totalSpent: 95, lastVisit: '3 days ago', status: 'New' },
  { id: '5', name: 'David Miller', email: 'david.m@example.com', phone: '+1 212-555-0121', totalVisits: 5, totalSpent: 340, lastVisit: '1 week ago', status: 'Regular' },
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filteredGuests = mockGuests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || g.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09122B]/90 p-6 rounded-2xl border border-white/8 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            Guest Directory & CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View customer order histories, visit frequencies, and VIP loyalty status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guests by name or email..."
              className="pl-9 h-10 w-full pr-4 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Total Registered Guests</p>
            <p className="text-xl font-black text-white">1,482 Guests</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">VIP Loyalty Members</p>
            <p className="text-xl font-black text-purple-400">238 VIPs</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Avg Spend Per Visit</p>
            <p className="text-xl font-black text-emerald-400">$118.50</p>
          </div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="rounded-2xl border border-white/8 bg-[#080F22]/90 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">All Guests</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="all" className="bg-[#080F22]">All Statuses</option>
              <option value="vip" className="bg-[#080F22]">VIP</option>
              <option value="regular" className="bg-[#080F22]">Regular</option>
              <option value="new" className="bg-[#080F22]">New</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/3 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/6">
              <tr>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Visits</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black">
                      {guest.name.charAt(0)}
                    </div>
                    {guest.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{guest.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{guest.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{guest.totalVisits} visits</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">${guest.totalSpent.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-400">{guest.lastVisit}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      guest.status === 'VIP' ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' :
                      guest.status === 'Regular' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' :
                      'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    }`}>
                      {guest.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
