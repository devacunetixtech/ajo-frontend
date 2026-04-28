import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

const ICONS = {
  success: "check_circle",
  error:   "error",
  info:    "info",
  warning: "warning",
};

const COLORS = {
  success: "border-l-primary bg-surface-container-lowest",
  error:   "border-l-error bg-surface-container-lowest",
  info:    "border-l-secondary bg-surface-container-lowest",
  warning: "border-l-[#ba7517] bg-surface-container-lowest",
};

const ICON_COLORS = {
  success: "text-primary",
  error:   "text-error",
  info:    "text-secondary",
  warning: "text-[#ba7517]",
};

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((msg, d) => toast(msg, "success", d), [toast]);
  const error   = useCallback((msg, d) => toast(msg, "error",   d), [toast]);
  const info    = useCallback((msg, d) => toast(msg, "info",    d), [toast]);
  const warning = useCallback((msg, d) => toast(msg, "warning", d), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}

      {/* Toast container — bottom-right, editorial minimal */}
      <div className="fixed bottom-0 md:bottom-8 right-0 md:right-8 w-full md:w-auto p-4 md:p-0 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto
              flex items-start gap-3
              w-full min-w-0 md:min-w-[300px] max-w-none md:max-w-[400px]
              border border-outline-variant/10 border-l-4
              px-5 py-4 shadow-editorial
              ${COLORS[t.type]}
              animate-[slideIn_0.2s_ease-out]
            `}
            style={{ borderRadius: "0.125rem" }}
          >
            <span className={`material-symbols-outlined text-xl flex-shrink-0 mt-0.5 ${ICON_COLORS[t.type]}`}>
              {ICONS[t.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body text-on-surface leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors flex-shrink-0 ml-2"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
