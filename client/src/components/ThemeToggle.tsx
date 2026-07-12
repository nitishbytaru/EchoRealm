"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";

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
        <div className="w-16 h-9 bg-muted rounded-full border-[3px] border-[var(--nb-border-color)] flex items-center justify-between px-2 opacity-50">
          <Sun className="h-4 w-4 text-nb-warning z-10 pointer-events-none" />
          <Moon className="h-4 w-4 text-nb-accent z-10 pointer-events-none" />
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
        <div className="w-16 h-9 bg-card rounded-full border-[3px] border-[var(--nb-border-color)] shadow-[3px_3px_0px_var(--nb-shadow-color)] peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[5px] after:start-[5px] after:bg-primary after:border-[2px] after:border-[var(--nb-border-color)] after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-muted flex items-center justify-between px-2 transition-all duration-150">
          <Sun className="h-4 w-4 text-nb-warning z-10 pointer-events-none" />
          <Moon className="h-4 w-4 text-nb-accent z-10 pointer-events-none" />
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;
