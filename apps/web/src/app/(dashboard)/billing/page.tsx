"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 projects",
      "720p export",
      "Watermark",
      "5 presets",
      "10 min max duration",
    ],
    current: true,
  },
  {
    id: "creator",
    name: "Creator",
    price: "$9",
    period: "/month",
    features: [
      "25 projects",
      "1080p export",
      "No watermark",
      "All presets",
      "30 min max duration",
      "5GB storage",
    ],
    current: false,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited projects",
      "4K export",
      "60 FPS",
      "Advanced layers",
      "Brand kits",
      "60 min max duration",
      "50GB storage",
      "Priority rendering",
    ],
    current: false,
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");

  const usage = {
    projects: { used: 2, limit: 3 },
    storage: { used: 1.2, limit: 5, unit: "GB" },
    exports: { used: 5, limit: 10, period: "month" },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-zinc-400 mt-1">Manage your subscription and usage</p>
      </div>

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>Your usage for this billing period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Projects</span>
                <span className="text-white">
                  {usage.projects.used} / {usage.projects.limit}
                </span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-beatvision-500 rounded-full"
                  style={{
                    width: `${(usage.projects.used / usage.projects.limit) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Storage</span>
                <span className="text-white">
                  {usage.storage.used} / {usage.storage.limit} {usage.storage.unit}
                </span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-beatvision-500 rounded-full"
                  style={{
                    width: `${(usage.storage.used / usage.storage.limit) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Exports</span>
                <span className="text-white">
                  {usage.exports.used} / {usage.exports.limit} this {usage.exports.period}
                </span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-beatvision-500 rounded-full"
                  style={{
                    width: `${(usage.exports.used / usage.exports.limit) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.current
                  ? "border-beatvision-500 bg-beatvision-500/5"
                  : plan.popular
                  ? "border-beatvision-500/50"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-beatvision-600 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-zinc-500">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-beatvision-500 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.current ? "secondary" : "primary"}
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p>No payment history</p>
            <p className="text-sm mt-1">You're on the free plan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
