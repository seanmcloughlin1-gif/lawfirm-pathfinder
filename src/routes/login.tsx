import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

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
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate({ to: "/dashboard" });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "forgot") {
      const result = await resetPassword(email);
      setLoading(false);
      if (result.error) setError(result.error);
      else setMessage("Check your email for a password reset link.");
      return;
    }

    const result = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
      setMessage("Check your email to confirm your account.");
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold">
              {mode === "signin" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to access your saved jobs and alerts"
                : mode === "signup"
                  ? "Join JD Careers to save jobs and get weekly alerts"
                  : "Enter your email to receive a reset link"}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
            {mode === "signin" && (
              <>
                <p>
                  Don't have an account?{" "}
                  <button onClick={() => { setMode("signup"); setError(null); setMessage(null); }} className="text-primary hover:underline font-medium">Sign up</button>
                </p>
                <p>
                  <button onClick={() => { setMode("forgot"); setError(null); setMessage(null); }} className="text-primary hover:underline font-medium">Forgot password?</button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(null); setMessage(null); }} className="text-primary hover:underline font-medium">Sign in</button>
              </p>
            )}
            {mode === "forgot" && (
              <p>
                <button onClick={() => { setMode("signin"); setError(null); setMessage(null); }} className="text-primary hover:underline font-medium">Back to sign in</button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
