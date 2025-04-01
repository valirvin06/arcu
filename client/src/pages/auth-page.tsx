import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading, loginMutation } = useAuth();
  
  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Redirect to home if the user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild className="flex items-center gap-1">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Live Scores
              </Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Enter your admin credentials to access the scoring system.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading || loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 text-white bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            2025 USTP Claveria ArCu Days Live Scores
          </h1>
          <p className="text-lg mb-8">
            Welcome to the official live scoring system for the 2025 USTP Claveria ArCu Days competition. This platform provides real-time updates for all events and team performances.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xl mr-4">1</div>
              <p className="text-white">Track scores in real-time across all events</p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xl mr-4">2</div>
              <p className="text-white">View team standings and medal counts</p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xl mr-4">3</div>
              <p className="text-white">Access detailed event categories and results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}