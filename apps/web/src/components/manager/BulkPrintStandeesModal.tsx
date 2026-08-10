'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, TableProperties, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { openBulkPrintStandeesWindow } from '@/lib/qrGenerator';

interface BulkPrintStandeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: {
    _id?: string;
    name: string;
    code: string;
  };
  restaurantName?: string;
  tables: Array<{
    tableNumber: string;
    capacity: number;
    type?: string;
    seatingCategory?: string;
    isAc?: boolean;
  }>;
}

export function BulkPrintStandeesModal({
  isOpen,
  onClose,
  branch,
  restaurantName = 'Paragon',
  tables,
}: BulkPrintStandeesModalProps) {
  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://quickbite.app';

  const handlePrintAll = () => {
    openBulkPrintStandeesWindow({
      restaurantName,
      branchName: branch.name,
      branchCode: branch.code,
      tables,
      baseUrl: origin,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-[#070D1F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8 bg-[#091128]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Print All Table Standees
                </h3>
                <p className="text-xs text-slate-400">
                  {branch.name} ({branch.code}) • {tables.length} Total Tables
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white mb-0.5">Print-Ready Acrylic Table Standee Sheet</p>
                <p className="text-purple-300/80 leading-relaxed">
                  This generates formatted, high-resolution standee cards for all {tables.length} tables in your branch. Designed to fit standard A5/A6 acrylic table tents.
                </p>
              </div>
            </div>

            {/* Grid preview of tables */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tables Included ({tables.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
                {tables.map((t) => (
                  <div
                    key={t.tableNumber}
                    className="p-3.5 rounded-xl bg-[#030816] border border-white/8 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">Table {t.tableNumber}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {t.capacity} Guests • {t.type || 'Indoor'} • {t.isAc !== false ? '❄️ AC' : '🍃 Non-AC'}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/8 bg-[#050A18] flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Ready to generate <span className="text-white font-bold">{tables.length}</span> standee cards
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/10 hover:bg-white/6 text-white font-bold text-xs rounded-xl h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePrintAll}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-5 shadow-lg shadow-purple-600/25"
              >
                <Printer className="w-4 h-4" />
                <span>Open Print Dialog</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
