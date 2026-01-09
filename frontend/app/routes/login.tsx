import type { Route } from "./+types/home";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { LogIn, User, Lock, AlertCircle } from "lucide-react";
import Layout from "~/components/Layout";
import Button from "~/components/Button";
import Card from "~/components/Card";
import { loginUser } from "~/services/account";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In - Thoughtful" },
    { name: "description", content: "Sign in to your Thoughtful account" },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    // API Request
    const response = await loginUser(username, password);

    if (response.success) {
      // Redirect to notebook after successful login
      navigate("/notebook");
    } else if (response.error) {
      setIsLoading(false);
      setError(response.error);
    } else {
      setIsLoading(false);
      setError("An unexpected error occurred");
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Sign in to continue to your notebook
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    placeholder="Enter your username"
                    required
                    minLength={3}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg">
                  <p className="text-sm text-[var(--color-error)] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[var(--color-accent)] hover:text-[var(--color-accent-light)] font-medium transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
