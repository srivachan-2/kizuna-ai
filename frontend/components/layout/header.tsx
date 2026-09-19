"use client";

import React from "react";
import { Globe } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-[#0b0f17]/90 backdrop-blur-sm sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span className="text-muted">Corridor:</span>
          <span className="px-2.5 py-1 rounded-md bg-surface-50 border border-border text-slate-200 font-medium flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Japan → India Market Intelligence</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User / Enterprise Tenant profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-surface-50 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
            JP
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200 leading-tight">Enterprise Client</span>
            <span className="text-[10px] text-muted leading-tight">Tokyo Global Strategy</span>
          </div>
        </div>
      </div>
    </header>
  );
}
