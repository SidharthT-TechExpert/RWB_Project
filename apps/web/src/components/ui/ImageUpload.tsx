'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/upload';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  required?: boolean;
  folder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Food Item Image',
  required = true,
  folder = 'quickbite/food',
  error,
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const err = 'Please select a valid image file (JPG, PNG, WEBP).';
      setUploadError(err);
      toast.error(err);
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      const err = 'Image size must be less than 8MB.';
      setUploadError(err);
      toast.error(err);
      return;
    }

    setUploadError(null);

    // Create immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsUploading(true);

    try {
      toast.loading('Uploading food image to Cloudinary…', { id: 'cloudinary-upload' });
      const result = await uploadImageToCloudinary(file, folder);
      onChange(result.url);
      setLocalPreview(null);
      toast.success('Food image uploaded to Cloudinary! ☁️✨', { id: 'cloudinary-upload' });
    } catch (err: any) {
      console.error('Upload failed:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload image to Cloudinary';
      setUploadError(msg);
      toast.error(msg, { id: 'cloudinary-upload' });
      // Keep local preview if available so user sees what failed
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setLocalPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) onRemove();
  };

  const displayImage = value || localPreview;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Required Badge */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>{label}</span>
          {required && (
            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded ml-1">
              * REQUIRED
            </span>
          )}
        </label>
        <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400/80">
          <Cloud className="w-3 h-3" />
          <span>Cloudinary CDN</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Upload / Preview Card */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
          displayImage
            ? 'border-purple-500/40 bg-[#080E1E]'
            : dragActive
            ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
            : error || uploadError
            ? 'border-rose-500/60 bg-rose-500/5'
            : 'border-dashed border-slate-700/80 hover:border-purple-500/60 bg-[#040918] hover:bg-[#071126]'
        }`}
      >
        {displayImage ? (
          /* Preview Mode */
          <div className="relative group p-3">
            <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-black/40 border border-white/10">
              <Image
                src={displayImage}
                alt="Food Preview"
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Status Badge in Top-Left */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-lg text-white text-[11px] font-bold">
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                    <span>Uploading to Cloudinary…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Uploaded to Cloudinary</span>
                  </>
                )}
              </div>

              {/* Action Buttons Top-Right */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading || disabled}
                  className="w-8 h-8 rounded-lg bg-black/70 hover:bg-rose-600/90 text-white/80 hover:text-white flex items-center justify-center border border-white/15 backdrop-blur-md transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                <span className="text-white/80 font-medium truncate flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Click anywhere to replace image
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-500/30">
                  Ready
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Dropzone */
          <div className="py-7 px-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-lg shadow-purple-500/10">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
              ) : (
                <UploadCloud className="w-6 h-6 text-purple-400" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-white">
                {isUploading ? 'Uploading to Cloudinary…' : 'Click to upload food photo or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400">
                High-quality food photos increase orders by 40%
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
              <span>PNG, JPG, WEBP</span>
              <span>&bull;</span>
              <span>Max 8MB</span>
              <span>&bull;</span>
              <span className="text-purple-400 font-bold">Cloudinary Auto-Optimize</span>
            </div>
          </div>
        )}

        {/* Uploading Progress Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#030816]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 z-10"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-pulse">
                <Cloud className="w-5 h-5 text-purple-400 animate-bounce" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-black text-white">Uploading to Cloudinary CDN</p>
                <p className="text-[10px] text-purple-300 font-mono">Optimizing resolution &amp; compression…</p>
              </div>
              <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-indeterminate" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {(error || uploadError) && (
        <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || uploadError}</span>
        </p>
      )}
    </div>
  );
}

export default ImageUpload;
