"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [exportQuality, setExportQuality] = useState("high");
  const [autoSave, setAutoSave] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSaveMessage("Profile updated successfully!");
      } else {
        const data = await res.json();
        setSaveMessage(null);
        alert(data.error || "Failed to update profile");
      }
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMessage(null);
    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage(data.error || "Failed to update password");
      }
    } catch {
      setPasswordMessage("Failed to update password");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto flex items-center justify-center py-20">
        <svg className="w-8 h-8 text-beatvision-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            disabled
          />
          {saveMessage && (
            <p className="text-sm text-green-400">{saveMessage}</p>
          )}
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.includes("success") ? "text-green-400" : "text-red-400"}`}>
              {passwordMessage}
            </p>
          )}
          <div className="flex justify-end">
            <Button onClick={handleUpdatePassword}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your editor experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Default Export Quality
            </label>
            <select
              value={exportQuality}
              onChange={(e) => setExportQuality(e.target.value)}
              className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="low">Low (720p)</option>
              <option value="medium">Medium (1080p)</option>
              <option value="high">High (1440p)</option>
              <option value="ultra">Ultra (4K)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-zinc-300">Auto Save</p>
              <p className="text-xs text-zinc-500">Automatically save changes every 30 seconds</p>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`w-10 h-6 rounded-full transition-colors ${
                autoSave ? "bg-beatvision-600" : "bg-surface-3"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSave ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Theme</label>
            <div className="flex gap-2">
              {["dark", "light", "system"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    theme === t
                      ? "bg-beatvision-600 border-beatvision-500 text-white"
                      : "bg-surface-2 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>View and customize keyboard shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { action: "Play / Pause", shortcut: "Space" },
              { action: "Undo", shortcut: "Ctrl+Z" },
              { action: "Redo", shortcut: "Ctrl+Shift+Z" },
              { action: "Save", shortcut: "Ctrl+S" },
              { action: "Export", shortcut: "Ctrl+E" },
              { action: "Fullscreen", shortcut: "F11" },
              { action: "Delete Layer", shortcut: "Delete" },
              { action: "Duplicate Layer", shortcut: "Ctrl+D" },
            ].map((item) => (
              <div
                key={item.action}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-sm text-zinc-300">{item.action}</span>
                <kbd className="px-2 py-1 bg-surface-2 border border-white/10 rounded text-xs text-zinc-400 font-mono">
                  {item.shortcut}
                </kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 gap-3">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-zinc-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm" className="shrink-0">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
