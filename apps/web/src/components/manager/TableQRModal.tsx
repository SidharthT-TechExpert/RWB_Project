'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, X, Download, Printer, Copy, Check, ExternalLink,
  Sparkles, Layers, Users, MapPin, ShieldCheck, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { openPrintStandeeWindow, downloadQRImage } from '@/lib/qrGenerator';

interface TableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    tableNumber: string;
    capacity: number;
    type?: string;
    seatingCategory?: string;
    description?: string;
  };
  branch: {
    _id?: string;
    name: string;
    code: string;
  };
  restaurantName?: string;
}

export function TableQRModal({
  isOpen,
  onClose,
  table,
  branch,
  restaurantName = 'Paragon',
}: TableQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://quickbite.app';
  const dineInUrl = `${origin}/dine-in?branch=${branch.code}&table=${table.tableNumber}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(dineInUrl)}&format=png&qzone=1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dineInUrl);
    setCopied(true);
    toast.success('Dine-in URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      downloadQRImage(blobUrl, `QuickBite_${branch.code}_Table_${table.tableNumber}_QR.png`);
      URL.revokeObjectURL(blobUrl);
      toast.success('QR Code downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintStandee = () => {
    openPrintStandeeWindow({
      restaurantName,
      branchName: branch.name,
      branchCode: branch.code,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      qrUrl: dineInUrl,
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
          className="w-full max-w-md bg-[#070D1F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8 bg-[#091128]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Table {table.tableNumber} QR Code
                </h3>
                <p className="text-[11px] text-slate-400">
                  {branch.name} ({branch.code})
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

          {/* QR Preview Card */}
          <div className="p-6 space-y-5">
            <div className="bg-[#030816] rounded-2xl border border-white/8 p-6 flex flex-col items-center text-center relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-purple-600/20 blur-2xl pointer-events-none" />

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Dine-In QR
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                  {branch.code}
                </span>
              </div>

              {/* QR Image Container */}
              <div className="p-3.5 bg-white rounded-2xl shadow-xl shadow-purple-950/40 relative group my-1">
                <img
                  src={qrImageUrl}
                  alt={`QR Code for Table ${table.tableNumber}`}
                  className="w-48 h-48 object-contain block rounded-lg"
                />
                <div className="absolute inset-0 bg-black/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-lg"
                    title="Download PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePrintStandee}
                    className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors shadow-lg"
                    title="Print Standee"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table Pill */}
              <div className="mt-4 px-4 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-black tracking-wide">
                TABLE {table.tableNumber}
              </div>

              {/* Meta details */}
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" /> {table.capacity} Guests
                </span>
                <span>•</span>
                <span className="capitalize">{table.type || 'Indoor'}</span>
                {table.seatingCategory && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{table.seatingCategory}</span>
                  </>
                )}
              </div>
            </div>

            {/* Direct Link Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Direct Scan URL
              </label>
              <div className="flex items-center gap-2 bg-[#030816] border border-white/8 rounded-xl px-3 py-2 text-xs">
                <span className="text-slate-300 font-mono truncate flex-1">{dineInUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-white/6 hover:bg-white/10 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handlePrintStandee}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-11 shadow-lg shadow-purple-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Standee</span>
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="outline"
                className="border-white/10 hover:bg-white/6 text-white font-bold text-xs gap-2 rounded-xl h-11"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
              </Button>
            </div>

            {/* Test link */}
            <a
              href={dineInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium py-1 transition-colors"
            >
              <span>Test Customer Dine-In Flow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
