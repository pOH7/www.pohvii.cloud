"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Github, LogOut, User } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface AuthButtonProps {
  dictionary: Dictionary;
}

export function AuthButton({ dictionary }: AuthButtonProps) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for SSR hydration safety
    setMounted(true);
  }, []);

  const handleSignIn = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: pathname, // Redirect back to current page after login
    });
  };

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  };

  // Render placeholder during SSR and initial mount
  if (!mounted || isPending) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  // Logged out state
  if (!session) {
    return (
      <Button
        onClick={handleSignIn}
        variant="default"
        size="sm"
        className="gap-2"
      >
        <Github className="h-4 w-4" />
        <span className="hidden sm:inline">{dictionary.Auth.login}</span>
      </Button>
    );
  }

  // Logged in state - show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={40}
              height={40}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name || dictionary.Auth.user}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{dictionary.Auth.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
