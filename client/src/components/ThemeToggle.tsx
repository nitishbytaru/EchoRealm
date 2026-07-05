"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  isChecked: boolean;
  handleToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isChecked, handleToggle }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-14 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-between px-2 opacity-50">
          <Sun className="h-4 w-4 text-amber-400 z-10 pointer-events-none" />
          <Moon className="h-4 w-4 text-indigo-400 z-10 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div className="w-14 h-8 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white dark:after:bg-zinc-200 after:border-zinc-300 dark:after:border-zinc-700 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-zinc-800 peer-checked:bg-zinc-950 flex items-center justify-between px-2 shadow-inner">
          <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400/50 z-10 pointer-events-none" />
          <Moon className="h-4 w-4 text-indigo-300 dark:text-indigo-400 z-10 pointer-events-none" />
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;
