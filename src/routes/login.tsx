import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — JD Careers" },
      { name: "description", content: "Sign in to save jobs, set up alerts, and manage your profile on JD Careers." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to access your saved jobs and alerts" : "Join JD Careers to save jobs and get weekly alerts"}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" placeholder="Jane Doe" className="pl-10" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">Sign in</button></>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
