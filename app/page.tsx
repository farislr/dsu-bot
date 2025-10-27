"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPreviousWork, setFetchingPreviousWork] = useState(false);
  const [previousWork, setPreviousWork] = useState<{
    yesterday: string;
    today: string;
    timestamp: string;
  } | null>(null);
  const userInitials = user?.displayName?.charAt(0).toUpperCase() || "U"
  const userPhoto = user?.photoURL ?? "https://gravatar.com/avatar/8d965d0787ab969198b87da7d4695fc2?s=400&d=robohash&r=x";

  useEffect(() => {
    if (user?.email) {
      fetchPreviousWork();
    }
  }, [user]);

  const fetchPreviousWork = async () => {
    if (!user?.email) return;

    setFetchingPreviousWork(true);
    try {
      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();

      const response = await fetch(`/api/standup?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setPreviousWork(result.data);
          setYesterday(result.data.today);
        }
      } else if (response.status === 401) {
        console.error("Authentication failed - please sign in again");
        // Optionally trigger re-authentication
      }
    } catch (error) {
      console.error("Error fetching previous work:", error);
    } finally {
      setFetchingPreviousWork(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/standup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.displayName || "Unknown",
          email: user.email,
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
          await fetchPreviousWork();
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

  // Loading state
  if (authLoading) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Daily Standup</CardTitle>
              <CardDescription>Sign in to submit your daily standup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                  onClick={signInWithGoogle}
                  className="w-full"
                  size="lg"
                  variant="outline"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
              <p className="text-xs text-center text-gray-500">
                Your company email will be used to track your standups
              </p>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Signed in - show main form
  return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header with User Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Daily Standup</h1>
              <p className="text-sm md:text-base text-gray-600">Share your progress and plan for today</p>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{user.displayName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
              </div>
              <Avatar className="w-10 h-10 rounded-full flex-shrink-0">
                <AvatarImage src={userPhoto} alt={userInitials} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Previous Work Loading State */}
          {fetchingPreviousWork && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="animate-pulse">📋</span>
                    Loading Previous Standup...
                  </CardTitle>
                  <CardDescription>Fetching your last entry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Previous Work Card */}
          {!fetchingPreviousWork && previousWork && (
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
                    disabled={loading || fetchingPreviousWork}
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
                💡 Your email is used to track your standups and auto-fill yesterday's progress
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}