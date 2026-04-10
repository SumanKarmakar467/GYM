import { createContext, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const ToastContext = createContext(null);

const toastTypes = {
  success: "border-emerald-500/60 bg-emerald-500/15 text-emerald-100",
  error: "border-rose-500/60 bg-rose-500/15 text-rose-100",
  info: "border-orange-400/60 bg-orange-500/15 text-orange-100"
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] w-[min(92vw,360px)] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm ${toastTypes[toast.type] || toastTypes.info}`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};