"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GlobeIcon, LockIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

export function PublicToggle({ questionId }: { questionId: Id<"questions"> }) {
  const question = useQuery(api.questions.getById, { id: questionId });
  const setPublic = useMutation(api.questions.setPublic);
  const [copied, setCopied] = useState(false);

  if (!question) return null;

  const isPublic = question.is_public ?? false;
  const shareUrl = question.slug
    ? `https://peoplesquare.customertalk.cn/s/${question.slug}`
    : null;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setPublic({ id: questionId, is_public: !isPublic })}
        className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors hover:bg-muted"
      >
        {isPublic ? (
          <GlobeIcon className="size-3.5 text-primary" />
        ) : (
          <LockIcon className="size-3.5 text-muted-foreground" />
        )}
        <span className={isPublic ? "text-primary font-medium" : "text-muted-foreground"}>
          {isPublic ? "已公开" : "私密"}
        </span>
      </button>
      {isPublic && shareUrl && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-mono text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors"
          title={shareUrl}
        >
          {copied ? (
            <CheckIcon className="size-3 text-primary" />
          ) : (
            <CopyIcon className="size-3" />
          )}
          {copied ? "已复制" : `/s/${question.slug}`}
        </button>
      )}
    </div>
  );
}
