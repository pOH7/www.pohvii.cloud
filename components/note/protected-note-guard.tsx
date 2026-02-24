"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
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

  const handleSignIn = () => {
    void signIn.social({
      provider: "github",
      callbackURL: pathname, // Redirect back to this note after login
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 px-4 text-center">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-6">
            <Lock className="text-primary size-12" />
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
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {dictionary.Auth.signInWithGitHub}
          </Button>
        </div>

        {/* Info */}
        <p className="text-muted-foreground text-sm">
          {dictionary.Auth.protectedNoteInfo}
        </p>
      </div>
    </div>
  );
}
