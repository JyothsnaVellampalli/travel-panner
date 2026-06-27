import React from "react";
import { Compass, User, LogOut, Sun, Moon, Map, ClipboardList } from "lucide-react";

interface HeaderProps {
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeSection: 'explore' | 'my-trips';
  setActiveSection: (section: 'explore' | 'my-trips') => void;
}

export default function Header({ user, onOpenAuth, onLogout, activeSection, setActiveSection }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div 
          className="flex cursor-pointer items-center space-x-2.5 transition active:scale-95"
          onClick={() => setActiveSection('explore')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-500/10">
            <Compass className="h-5.5 w-5.5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-white">
              Vagabond<span className="text-sky-400">AI</span>
            </h1>
            <p className="text-[9px] font-bold tracking-widest text-white/45 uppercase">Interactive Planner</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex space-x-1">
          <button
            onClick={() => setActiveSection('explore')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeSection === 'explore'
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Map className="h-4 w-4 text-sky-400" />
            <span>Explore & Plan</span>
          </button>
          
          <button
            onClick={() => setActiveSection('my-trips')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all relative ${
              activeSection === 'my-trips'
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ClipboardList className="h-4 w-4 text-sky-400" />
            <span>My Saved Itineraries</span>
            {user && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
              </span>
            )}
          </button>
        </nav>

        {/* User Account / Profile Actions (Top-Right) */}
        <div className="flex items-center space-x-4">
          {/* Mobile view small tabs */}
          <div className="flex md:hidden space-x-1 mr-2">
            <button
              onClick={() => setActiveSection('explore')}
              className={`rounded-lg p-2 transition ${
                activeSection === 'explore' ? "bg-white/15 text-white" : "text-white/65"
              }`}
              title="Explore"
            >
              <Map className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveSection('my-trips')}
              className={`rounded-lg p-2 transition ${
                activeSection === 'my-trips' ? "bg-white/15 text-white" : "text-white/65"
              }`}
              title="Saved Trips"
            >
              <ClipboardList className="h-5 w-5" />
            </button>
          </div>

          {user ? (
            <div className="flex items-center space-x-3.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-white">{user.name}</span>
                <span className="text-[11px] text-white/55">{user.email}</span>
              </div>
              <div className="group relative">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 font-display text-sm font-bold text-white shadow-md ring-2 ring-white/10 transition-all hover:ring-white/30">
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <div className="invisible absolute right-0 mt-2 w-48 scale-95 rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100 z-50 backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-white/5 sm:hidden">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-white/55">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-sky-400 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
