"use client";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React from "react";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="sticky top-0 left-0 right-0 z-30">
      <header className="h-16 border-b bg-background py-4">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex-1 hidden items-center md:flex justify-center">
            <Link className="text-foreground-muted text-sm" href="/">
              Home
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <MoonIcon
                  className={cn(
                    "absolute size-5 transition ",
                    isDark ? "scale-100" : "scale-0"
                  )}
                />
              ) : (
                <SunIcon
                  className={cn(
                    "absolute size-5 transition ",
                    isDark ? "scale-0" : "scale-100"
                  )}
                />
              )}
            </Button>
            <Button className="rounded-lg">Sign in</Button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
