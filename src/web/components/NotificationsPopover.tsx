import React, { useState, useRef, useEffect } from "react";
import { Bell, ShoppingCart, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "../../packages/ui/Badge";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "order" | "inventory" | "system";
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Order Received",
    message: "Order ORD-2026-000104 created by Acme Studio.",
    time: "10m ago",
    type: "order",
    read: false,
  },
  {
    id: "notif-2",
    title: "Low Inventory Alert",
    message: "Canon Photo Paper Premium A4 is below reorder threshold (12 left).",
    time: "45m ago",
    type: "inventory",
    read: false,
  },
  {
    id: "notif-3",
    title: "Production Completed",
    message: "Job JOB-2026-000042 advanced to Ready for Pickup.",
    time: "2h ago",
    type: "system",
    read: false,
  },
];

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    !n.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 mt-0.5">
                    {n.type === "order" && <ShoppingCart className="w-4 h-4 text-blue-500" />}
                    {n.type === "inventory" && <Package className="w-4 h-4 text-amber-500" />}
                    {n.type === "system" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 text-center border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">StudioOS Notification Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
