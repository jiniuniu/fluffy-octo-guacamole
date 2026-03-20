"use client";

import { useState, useRef } from "react";

type Persona = {
  cluster_label: string;
  demo: {
    age: number;
    gender: string;
    city: string;
    education: string;
    occupation: string;
  };
  bio: string;
};

export function PersonaCard({
  persona,
  children,
}: {
  persona: Persona;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    timerRef.current = setTimeout(() => setVisible(true), 300);
  }

  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-lg border border-border bg-background p-3 shadow-lg">
          {/* header */}
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
              {persona.cluster_label}
            </span>
            <span className="text-xs text-muted-foreground">
              {persona.demo.age}岁 ·{" "}
              {persona.demo.gender === "male" ? "男" : "女"} ·{" "}
              {persona.demo.city}
            </span>
          </div>
          <div className="mb-2 text-xs text-muted-foreground">
            {persona.demo.occupation} · {persona.demo.education}
          </div>
          {/* bio */}
          <p className="text-xs leading-relaxed text-foreground">
            {persona.bio}
          </p>
        </div>
      )}
    </span>
  );
}
