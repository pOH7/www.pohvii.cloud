"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Lock, Github } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface ProtectedNoteGuardProps {
  noteTitle: string;
  dictionary: Dictionary;
}

/**
 * Component shown when a user tries to access a protected note without authentication
 */
export function ProtectedNoteGuard({
  noteTitle,
  dictionary,
}: ProtectedNoteGuardProps) {
  const pathname = usePathname();

  const handleSignIn = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: pathname, // Redirect back to this note after login
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center space-y-6 px-4">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Lock className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {dictionary.Auth.protectedNote}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.Auth.loginRequired.replace("{noteTitle}", noteTitle)}
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-4">
          <Button onClick={handleSignIn} size="lg" className="gap-2">
            <Github className="h-5 w-5" />
            {dictionary.Auth.signInWithGitHub}
          </Button>
        </div>

        {/* Info */}
        <p className="text-sm text-muted-foreground">
          {dictionary.Auth.protectedNoteInfo}
        </p>
      </div>
    </div>
  );
}
