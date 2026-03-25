"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";

const STATUS_LABEL: Record<string, string> = {
  pending:    "等待中",
  processing: "进行中",
  done:       "已完成",
};

const STATUS_COLOR: Record<string, string> = {
  pending:    "text-muted-foreground/50",
  processing: "text-primary animate-pulse",
  done:       "text-muted-foreground/50",
};

export function Sidebar() {
  const questions = useQuery(api.questions.list);
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string | undefined;
  const { isSignedIn, user } = useUser();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#f6f3f2] flex flex-col py-6 px-4 gap-4 overflow-y-auto no-scrollbar z-40">

      {/* Logo */}
      <div className="mb-2 px-1">
        <Logo
          variant="full"
          className="h-10 w-auto text-primary cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => router.push("/")}
        />
      </div>

      {/* New Question button — above history */}
      <button
        onClick={() => router.push("/new")}
        className="group flex w-full items-center justify-between px-1 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="font-medium">新问题</span>
        <span className="flex items-center justify-center w-5 h-5 rounded-full border border-muted-foreground/30 group-hover:border-foreground transition-all duration-200 group-hover:scale-110">
          <PlusIcon className="size-2.5" />
        </span>
      </button>

      {/* Section label */}
      <div className="px-1">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
          历史问题
        </span>
      </div>

      {/* Questions list */}
      <nav className="flex-1 flex flex-col gap-1 min-h-0 overflow-y-auto no-scrollbar">
        {questions === undefined && (
          <p className="px-2 text-xs text-muted-foreground/50">Loading...</p>
        )}
        {questions?.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground/50">
            No questions yet
          </p>
        )}
        {questions?.map((q) => (
          <button
            key={q._id}
            onClick={() => router.push(`/q/${q._id}`)}
            className={cn(
              "w-full px-3 py-2.5 text-left transition-colors rounded",
              currentId === q._id
                ? "bg-white text-primary border-l-[3px] border-primary"
                : "text-[#516170] hover:bg-white/70",
            )}
          >
            <p className={cn(
              "text-xs font-medium leading-relaxed line-clamp-2",
              currentId === q._id ? "text-foreground" : "text-[#516170]"
            )}>
              {(q as any).title ?? q.text}
            </p>
            <p className={cn("mt-0.5 text-[10px] font-semibold tracking-wider uppercase", STATUS_COLOR[q.status])}>
              {STATUS_LABEL[q.status] ?? q.status}
            </p>
          </button>
        ))}
      </nav>

      {/* Bottom: user area */}
      <div className="shrink-0 pt-4 border-t border-black/5">
        <div className="px-2">
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <UserButton />
              <div className="flex flex-col min-w-0">
                <span className="truncate text-xs text-muted-foreground">
                  {user.firstName ?? user.emailAddresses[0]?.emailAddress}
                </span>
                {user.publicMetadata?.role === "admin" && (
                  <span className="text-[9px] font-bold tracking-widest uppercase text-primary">
                    Admin
                  </span>
                )}
              </div>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full rounded px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/70 transition-colors text-left">
                登录 / 注册
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </aside>
  );
}
