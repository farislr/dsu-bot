"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousWork, setPreviousWork] = useState<{
    yesterday: string;
    today: string;
    timestamp: string;
  } | null>(null);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Don't fetch if email is empty or invalid
    if (!email || !email.includes('@')) {
      return;
    }

    // Set new timer - fetch after 300ms of no typing
    debounceTimer.current = setTimeout(() => {
      fetchPreviousWork();
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [email]);

  const fetchPreviousWork = async () => {
    if (!email) return;

    try {
      const response = await fetch(`/api/standup?email=${encodeURIComponent(email)}`);

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setPreviousWork(result.data);
          setYesterday(result.data.today);
        }
      }
    } catch (error) {
      console.error("Error fetching previous work:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/standup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          yesterday,
          today,
          blockers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send standup update.");
      }

      if (result.chat?.success && result.sheet?.success) {
        setMessage("success");
      } else if (result.chat?.success) {
        setMessage("partial-chat");
      } else if (result.sheet?.success) {
        setMessage("partial-sheet");
      } else {
        setMessage("error");
      }

      if (result.chat?.success || result.sheet?.success) {
        setToday("");
        setBlockers("");

        setTimeout(async () => {
          const refreshResponse = await fetch(`/api/standup?email=${encodeURIComponent(email)}`);
          if (refreshResponse.ok) {
            const refreshResult = await refreshResponse.json();
            if (refreshResult.data) {
              setPreviousWork(refreshResult.data);
              setYesterday(refreshResult.data.today);
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending standup update:", error);
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Daily Standup</h1>
            <p className="text-gray-600">Share your progress and plan for today</p>
          </div>

          {/* Previous Work Card */}
          {previousWork && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📋</span>
                    Previous Standup
                  </CardTitle>
                  <CardDescription>{formatDate(previousWork.timestamp)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">What you planned:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{previousWork.today}</p>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Main Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Standup</CardTitle>
              <CardDescription>Fill in your progress and plans for today</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    👤 Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@company.com"
                          required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t"></div>

                {/* Yesterday */}
                <div className="space-y-2">
                  <Label htmlFor="yesterday" className="text-base font-semibold flex items-center gap-2">
                    <span>✅</span>
                    What did you accomplish yesterday? *
                  </Label>
                  <Textarea
                      id="yesterday"
                      value={yesterday}
                      onChange={(e) => setYesterday(e.target.value)}
                      placeholder="• Completed the user authentication module&#10;• Fixed 3 critical bugs&#10;• Reviewed pull requests"
                      required
                      rows={5}
                      className="resize-none"
                  />
                  {previousWork && (
                      <p className="text-xs text-gray-500">💡 Auto-filled from your previous plan</p>
                  )}
                </div>

                {/* Today */}
                <div className="space-y-2">
                  <Label htmlFor="today" className="text-base font-semibold flex items-center gap-2">
                    <span>🎯</span>
                    What will you work on today? *
                  </Label>
                  <Textarea
                      id="today"
                      value={today}
                      onChange={(e) => setToday(e.target.value)}
                      placeholder="• Implement the dashboard UI&#10;• Write unit tests for new features&#10;• Attend sprint planning meeting"
                      required
                      rows={5}
                      className="resize-none"
                  />
                </div>

                {/* Blockers */}
                <div className="space-y-2">
                  <Label htmlFor="blockers" className="text-base font-semibold flex items-center gap-2">
                    <span>🚧</span>
                    Any blockers or challenges? (Optional)
                  </Label>
                  <Textarea
                      id="blockers"
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      placeholder="None, or describe any challenges..."
                      rows={3}
                      className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                >
                  {loading ? (
                      <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                  ) : (
                      "Submit Standup"
                  )}
                </Button>

                {/* Status Messages */}
                {message === "success" && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        ✅ Standup submitted successfully to Chat and Sheet!
                      </AlertDescription>
                    </Alert>
                )}

                {message === "partial-chat" && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-yellow-800">
                        ⚠️ Sent to Chat, but failed to save to Sheet.
                      </AlertDescription>
                    </Alert>
                )}

                {message === "partial-sheet" && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-yellow-800">
                        ⚠️ Saved to Sheet, but failed to send to Chat.
                      </AlertDescription>
                    </Alert>
                )}

                {message === "error" && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        ❌ Failed to submit standup. Please try again.
                      </AlertDescription>
                    </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Info Footer */}
          <Card className="bg-slate-50">
            <CardContent className="py-4">
              <p className="text-sm text-gray-600 text-center">
                💡 Your email is used to track your standups and auto-fill yesterday progress
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}