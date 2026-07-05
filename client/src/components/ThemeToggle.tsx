"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  isChecked: boolean;
  handleToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isChecked, handleToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-indigo-500 after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-slate-950 flex items-center justify-between px-2">
          <Sun className="h-4 w-4 text-amber-400 z-10 pointer-events-none" />
          <Moon className="h-4 w-4 text-indigo-400 z-10 pointer-events-none" />
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;
