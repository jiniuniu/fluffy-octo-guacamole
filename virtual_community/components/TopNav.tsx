"use client";

import { useRouter } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";
import { MenuIcon } from "lucide-react";

interface TopNavProps {
  /** Show "← 返回广场" back button instead of right-side actions */
  back?: boolean;
  /** Mobile: callback to open sidebar drawer (only used when back=true) */
  onMenuOpen?: () => void;
}

export function TopNav({ back = false, onMenuOpen }: TopNavProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-10 bg-background backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-4 sm:px-12 h-16">
        <Logo
          variant="full"
          className="h-9 w-auto text-primary cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => router.push("/")}
        />

        {back ? (
          <div className="flex items-center gap-3">
            {onMenuOpen && (
              <button
                onClick={onMenuOpen}
                className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MenuIcon className="size-5" />
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 返回广场
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/how-it-works")}
              className="whitespace-nowrap text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              方法论
            </button>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="text-[10px] font-bold tracking-widest uppercase text-primary border border-primary/30 px-4 py-1.5 rounded hover:bg-primary/5 transition-colors">
                  登录 / 注册
                </button>
              </SignInButton>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
