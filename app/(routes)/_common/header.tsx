"use client";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, getUser } = useKindeBrowserClient();

  const alsoUser = getUser();
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
            {/* <Button
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
            </Button> */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src={user?.picture || ""} />
                    <AvatarFallback>
                      {user?.given_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutLink>Sign out</LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="rounded-lg" asChild>
                <LoginLink>Sign in</LoginLink>
              </Button>
            )}
            {/* {!isAuthenticated ? (
              <Button className="rounded-lg" asChild>
                <LoginLink>Sign in</LoginLink>
              </Button>
            ) : (
              <Button className="rounded-lg" asChild>
                <LogoutLink>Sign out</LogoutLink>
              </Button>
            )} */}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
