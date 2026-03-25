"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GlobeIcon, LockIcon } from "lucide-react";

export function PublicToggle({ questionId }: { questionId: Id<"questions"> }) {
  const question = useQuery(api.questions.getById, { id: questionId });
  const setPublic = useMutation(api.questions.setPublic);

  if (!question) return null;

  const isPublic = question.is_public ?? false;

  return (
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
      {isPublic && question.slug && (
        <span className="ml-1 font-mono text-[10px] text-muted-foreground/50">
          /s/{question.slug}
        </span>
      )}
    </button>
  );
}
