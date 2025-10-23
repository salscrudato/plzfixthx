import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);
    
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);
  
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500"
  }[toast.type];
  
  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠"
  }[toast.type];
  
  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in`}>
      <span className="text-xl font-bold">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button 
        onClick={() => onClose(toast.id)}
        className="text-white/80 hover:text-white text-xl leading-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const showToast = (type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message, duration }]);
  };
  
  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  return {
    toasts,
    showToast,
    closeToast,
    success: (message: string, duration?: number) => showToast("success", message, duration),
    error: (message: string, duration?: number) => showToast("error", message, duration),
    info: (message: string, duration?: number) => showToast("info", message, duration),
    warning: (message: string, duration?: number) => showToast("warning", message, duration),
  };
}

