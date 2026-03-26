/* eslint-disable react-hooks/purity */
"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ThumbsUpIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonaCard } from "@/components/PersonaCard";

const EMOTION_PALETTE: Record<string, { border: string; text: string; bar: string }> = {
  愤怒: { border: "border-l-[3px] border-secondary",           text: "text-secondary",       bar: "bg-secondary" },
  认同: { border: "border-l-[3px] border-primary",             text: "text-primary",         bar: "bg-primary" },
  担忧: { border: "border-l-[3px] border-amber-500",           text: "text-amber-600",       bar: "bg-amber-500" },
  讽刺: { border: "border-l-[3px] border-muted-foreground/30", text: "text-muted-foreground", bar: "bg-muted-foreground/40" },
};
const FALLBACK_PALETTE = [
  { border: "border-l-[3px] border-primary",             text: "text-primary",         bar: "bg-primary" },
  { border: "border-l-[3px] border-secondary",           text: "text-secondary",       bar: "bg-secondary" },
  { border: "border-l-[3px] border-amber-500",           text: "text-amber-600",       bar: "bg-amber-500" },
  { border: "border-l-[3px] border-muted-foreground/30", text: "text-muted-foreground", bar: "bg-muted-foreground/40" },
];
function getEmotionPalette(stance: string) {
  return EMOTION_PALETTE[stance] ?? FALLBACK_PALETTE[0];
}

export function AnswerList({
  questionId,
  readonly = false,
}: {
  questionId: Id<"questions">;
  readonly?: boolean;
}) {
  const answers = useQuery(api.answers.byQuestion, { question_id: questionId });


  // Stable explorer index — only re-roll when answer count changes
  const explorerIndexRef = useRef<number | null>(null);
  const prevAnswerLengthRef = useRef<number>(0);

  const feed = useMemo(() => {
    if (!answers || answers.length === 0) return [];

    // Re-roll explorer only when new answers arrive
    if (answers.length !== prevAnswerLengthRef.current) {
      prevAnswerLengthRef.current = answers.length;
      const rest = answers.slice(9);
      explorerIndexRef.current =
        rest.length > 0 ? Math.floor(Math.random() * rest.length) : null;
    }

    const top9 = answers.slice(0, 9);
    const rest = answers.slice(9);
    const explorer =
      explorerIndexRef.current !== null ? rest[explorerIndexRef.current] : null;
    return explorer ? [...top9, { ...explorer, _isExplorer: true }] : top9;
  }, [answers]);

  if (!answers)
    return (
      <div className="py-10">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    );
  if (answers.length === 0)
    return (
      <div className="py-10">
        <p className="text-sm text-muted-foreground">虚拟网民正在思考中...</p>
      </div>
    );

  return (
    <div className="space-y-10">
      {feed.map((answer) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const persona = (answer as any).persona;
        const palette = getEmotionPalette(answer.stance);

        return (
          <article
            key={answer._id}
            className={`relative pl-6 ${palette.border}`}
          >

            {/* Author row */}
            <div className="flex items-center gap-3 mb-2">
              {/* Avatar placeholder */}
              <div className="w-9 h-9 rounded-lg bg-[#f0eded] flex items-center justify-center shrink-0 text-muted-foreground">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                {persona ? (
                  <PersonaCard persona={persona}>
                    <span className="cursor-default text-sm font-semibold text-foreground hover:underline truncate">
                      {persona.demo.city} · {persona.demo.occupation}
                    </span>
                  </PersonaCard>
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    匿名
                  </span>
                )}
                {persona && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {persona.demo.age}岁
                  </span>
                )}
              </div>

              {/* Stance chip — left bar + label */}
              <div className="flex items-center bg-[#eae8e7] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider overflow-hidden relative shrink-0">
                <div
                  className={`absolute left-0 top-0 w-0.75 h-full ${palette.bar}`}
                />
                <span className={`ml-2 ${palette.text}`}>{answer.stance}</span>
              </div>
            </div>

            {/* Answer body */}
            <p className="text-[15px] leading-relaxed text-foreground">
              {answer.text}
            </p>

            {/* Like + reply */}
            <div className="mt-3 flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ThumbsUpIcon className="size-3" />
                {answer.like_count}
              </span>
              {!readonly && <ReplyInput answerId={answer._id} />}
            </div>

            {/* Reply tree */}
            {answer.replies.length > 0 && (
              <div className="mt-5 pl-6 border-l-2 border-[#f0eded] space-y-4">
                {answer.replies.map((reply) => {
                  const isUser = reply.author === "user";
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const rPersona = (reply as any).persona ?? null;
                  return (
                    <div key={reply._id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#f0eded] flex items-center justify-center shrink-0 text-muted-foreground">
                        {isUser ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            opacity="0.6"
                          >
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isUser ? (
                            <span className="text-xs font-semibold text-primary">
                              你
                            </span>
                          ) : rPersona ? (
                            <PersonaCard persona={rPersona}>
                              <span className="cursor-default text-xs font-semibold text-foreground hover:underline">
                                {rPersona.demo.city} ·{" "}
                                {rPersona.demo.occupation}
                              </span>
                            </PersonaCard>
                          ) : (
                            <span className="text-xs font-semibold text-foreground">
                              匿名
                            </span>
                          )}
                          {!isUser && rPersona && (
                            <span className="text-[10px] text-muted-foreground">
                              {rPersona.demo.age}岁
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ReplyInput({ answerId }: { answerId: Id<"answers"> }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const createUserReply = useMutation(api.replies.createUserReply);
  const replyToUser = useAction(api.simulation.replyToUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const submitted = text.trim();
    try {
      await createUserReply({ answer_id: answerId, text: submitted });
      setText("");
      setOpen(false);
      replyToUser({ answer_id: answerId, user_reply_text: submitted }).catch(
        console.error,
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        + 回复
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5 flex-1">
      <input
        autoFocus
        className="flex-1 rounded bg-[#f6f3f2] border border-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        placeholder="说点什么..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <Button size="icon-xs" type="submit" disabled={loading || !text.trim()}>
        <SendIcon />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        type="button"
        onClick={() => setOpen(false)}
      >
        ✕
      </Button>
    </form>
  );
}
