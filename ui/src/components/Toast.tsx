import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="pointer-events-auto flex items-center gap-3 p-4 rounded-lg bg-card-bg border border-border-subtle shadow-xl"
          >
            {toast.type === "success" && (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            {toast.type === "info" && (
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
            
            <p className="text-sm font-medium text-on-surface flex-1">
              {toast.text}
            </p>
            
            <button
              onClick={() => onClose(toast.id)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
