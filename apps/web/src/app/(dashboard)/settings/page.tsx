"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@beatvision.app");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [exportQuality, setExportQuality] = useState("high");
  const [autoSave, setAutoSave] = useState(true);
  const [theme, setTheme] = useState("dark");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
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
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex justify-end">
            <Button>Save Changes</Button>
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
          />
          <div className="flex justify-end">
            <Button>Update Password</Button>
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
          {/* Default Export Quality */}
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

          {/* Auto Save */}
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

          {/* Theme */}
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
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-zinc-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
