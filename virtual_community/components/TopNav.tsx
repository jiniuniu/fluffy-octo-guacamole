"use client";

import { useRouter } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";

interface TopNavProps {
  /** Show "← 返回广场" back button instead of right-side actions */
  back?: boolean;
}

export function TopNav({ back = false }: TopNavProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-12 h-16">
        <Logo
          variant="full"
          className="h-9 w-auto text-primary cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => router.push("/")}
        />

        {back ? (
          <button
            onClick={() => router.push("/")}
            className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 返回广场
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/how-it-works")}
              className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
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
