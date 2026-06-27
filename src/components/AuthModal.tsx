import React, { useState } from "react";
import { X, Mail, Lock, User, Sparkles, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Mock successful authentication
    const userProfile = {
      name: isLogin ? name || email.split("@")[0] : name,
      email: email,
    };
    
    onLoginSuccess(userProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 glass-card shadow-2xl text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Decorative Header */}
        <div className="bg-sky-500/10 p-6 text-white text-center border-b border-white/10">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-white/10 backdrop-blur-md">
            <Compass className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="font-display text-xl font-bold">
            {isLogin ? "Welcome Back Traveler" : "Begin Your Adventure"}
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {isLogin ? "Log in to access your saved itineraries & maps" : "Sign up to start planning and saving trips"}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 border border-rose-500/20">
              {error}
            </div>
          )}

          {/* Name Field (Sign Up Only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80 block">Full Name</label>
              <div className="relative">
                <User className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
                <input
                  type="text"
                  placeholder="e.g. Jyotshna Vellampalli"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl glass-input py-3 pr-4 pl-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/20"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
              <input
                type="email"
                placeholder="e.g. email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl glass-input py-3 pr-4 pl-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/80 block">Password</label>
              {isLogin && (
                <button
                  type="button"
                  className="text-[10px] font-bold text-sky-300 hover:underline cursor-pointer"
                  onClick={() => alert("Password reset link sent to: " + (email || "your email"))}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-3 pr-4 pl-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/10 hover:bg-sky-400 active:scale-98 transition cursor-pointer"
          >
            {isLogin ? "Log In" : "Create Account"}
          </button>

          {/* Switch Auth Mode */}
          <div className="text-center pt-2">
            <p className="text-xs text-white/60">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="font-bold text-sky-300 hover:underline hover:text-sky-400 cursor-pointer"
              >
                {isLogin ? "Sign Up Free" : "Log In Here"}
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
