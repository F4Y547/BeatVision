"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";

export type NotificationType = "upload" | "analysis" | "export" | "system" | "error";
export type NotificationStatus = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  notifyUpload: (title: string, message: string, metadata?: Record<string, any>) => void;
  notifyAnalysis: (title: string, message: string, metadata?: Record<string, any>) => void;
  notifyExport: (title: string, message: string, status: NotificationStatus, metadata?: Record<string, any>) => void;
  notifyError: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("beatvision-notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      } catch (e) {
        console.error("Failed to parse notifications:", e);
      }
    }
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    localStorage.setItem("beatvision-notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Show browser notification if permitted
    if (Notification.permission === "granted") {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/icons/icon-192x192.png",
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const notifyUpload = useCallback(
    (title: string, message: string, metadata?: Record<string, any>) => {
      addNotification({ type: "upload", status: "success", title, message, metadata });
    },
    [addNotification]
  );

  const notifyAnalysis = useCallback(
    (title: string, message: string, metadata?: Record<string, any>) => {
      addNotification({ type: "analysis", status: "success", title, message, metadata });
    },
    [addNotification]
  );

  const notifyExport = useCallback(
    (title: string, message: string, status: NotificationStatus, metadata?: Record<string, any>) => {
      addNotification({ type: "export", status, title, message, metadata });
    },
    [addNotification]
  );

  const notifyError = useCallback(
    (title: string, message: string) => {
      addNotification({ type: "error", status: "error", title, message });
    },
    [addNotification]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        notifyUpload,
        notifyAnalysis,
        notifyExport,
        notifyError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
