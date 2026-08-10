'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, X, Download, Printer, Copy, Check, ExternalLink,
  Sparkles, Building2, MapPin, Store, UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { downloadQRImage } from '@/lib/qrGenerator';

interface BranchQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: {
    _id?: string;
    name: string;
    code: string;
    address?: { street: string; city: string };
    tablesCount?: number;
  };
  restaurantName?: string;
}

export function BranchQRModal({
  isOpen,
  onClose,
  branch,
  restaurantName = 'Paragon',
}: BranchQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://quickbite.app';
  const branchMenuUrl = `${origin}/dine-in?branch=${branch.code}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(branchMenuUrl)}&format=png&qzone=1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(branchMenuUrl);
    setCopied(true);
    toast.success('Branch menu URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      downloadQRImage(blobUrl, `QuickBite_${branch.code}_Branch_QR.png`);
      URL.revokeObjectURL(blobUrl);
      toast.success('Branch QR Code downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintCounterStandee = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QuickBite Counter Standee - ${branch.name} (${branch.code})</title>
          <style>
            @page { size: A5 portrait; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body { background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
            .standee-card { width: 380px; background: #0f172a; color: #ffffff; border-radius: 28px; padding: 36px 24px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
            .brand-badge { display: inline-flex; background: rgba(147, 51, 234, 0.2); border: 1px solid rgba(147, 51, 234, 0.4); color: #c084fc; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
            .restaurant-title { font-size: 24px; font-weight: 900; color: #ffffff; margin-bottom: 4px; }
            .branch-subtitle { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
            .tagline { background: #7c3aed; color: #ffffff; font-size: 15px; font-weight: 800; padding: 8px 20px; border-radius: 12px; display: inline-block; margin-bottom: 16px; }
            .qr-wrapper { background: #ffffff; border-radius: 20px; padding: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.3); margin-bottom: 20px; }
            .qr-image { width: 220px; height: 220px; display: block; }
            .instructions { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
            .sub-instructions { font-size: 11px; color: #64748b; }
            .footer-logo { margin-top: 24px; font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            @media print { body { background: transparent; padding: 0; } .standee-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="brand-badge">⚡ QuickBite Digital Order</div>
            <div class="restaurant-title">${restaurantName}</div>
            <div class="branch-subtitle">${branch.name} • ${branch.code}</div>
            <div class="tagline">TAKEAWAY &amp; COUNTER ORDERING</div>
            <div class="qr-wrapper">
              <img class="qr-image" src="${qrImageUrl}" alt="Scan QR for ${branch.name}" />
            </div>
            <div class="instructions">Scan to Browse Menu &amp; Order</div>
            <div class="sub-instructions">Point camera at QR code • Live Branch Menu &amp; Specials</div>
            <div class="footer-logo">Powered by QuickBite OS</div>
          </div>
          <script>window.onload = function() { setTimeout(function() { window.print(); }, 600); };</script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
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
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Branch Reception QR
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
                  <Sparkles className="w-2.5 h-2.5" /> Takeaway &amp; Reception QR
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                  {branch.code}
                </span>
              </div>

              {/* QR Image */}
              <div className="p-3.5 bg-white rounded-2xl shadow-xl shadow-purple-950/40 relative group my-1">
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${branch.name}`}
                  className="w-48 h-48 object-contain block rounded-lg"
                />
              </div>

              {/* Branch Title Pill */}
              <div className="mt-4 px-4 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-black tracking-wide">
                {branch.name}
              </div>

              {/* Address */}
              {branch.address?.street && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {branch.address.street}, {branch.address.city}
                </p>
              )}
            </div>

            {/* Direct Link Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Direct Scan URL
              </label>
              <div className="flex items-center gap-2 bg-[#030816] border border-white/8 rounded-xl px-3 py-2 text-xs">
                <span className="text-slate-300 font-mono truncate flex-1">{branchMenuUrl}</span>
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
                onClick={handlePrintCounterStandee}
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
              href={branchMenuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium py-1 transition-colors"
            >
              <span>Test Customer Flow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
