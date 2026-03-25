"use client";

import { useEffect, useRef } from "react";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const NODE_COUNT = 50;
const MAX_DIST = 130;
const SPEED = 0.35;

// Design system primary: #066b53
const PRIMARY_R = 6, PRIMARY_G = 107, PRIMARY_B = 83;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgb(${PRIMARY_R},${PRIMARY_G},${PRIMARY_B})`;

  // head
  ctx.beginPath();
  ctx.arc(x, y - r * 0.55, r * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // body arc
  ctx.beginPath();
  ctx.arc(x, y + r * 0.55, r * 0.6, Math.PI, 0);
  ctx.fill();

  ctx.restore();
}

export function NetworkHero({ isSignedIn }: { isSignedIn: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let nodes: Node[] = [];

    function init() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      canvas!.width = w;
      canvas!.height = h;

      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: 5 + Math.random() * 4,
      }));
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(${PRIMARY_R},${PRIMARY_G},${PRIMARY_B},${alpha})`;
            ctx!.lineWidth = 0.8;
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const alpha = 0.18 + Math.random() * 0.06;
        drawPerson(ctx!, n.x, n.y, n.r, alpha);
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();

    const ro = new ResizeObserver(() => { init(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden border-b border-border/30 bg-background"
      style={{ height: 340 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* subtle gradient fade */}
      <div className="absolute inset-0 bg-linear-to-b from-background/20 via-transparent to-background/60 pointer-events-none" />

      {/* content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <p className="text-[10px] font-bold tracking-widest uppercase text-primary/60 mb-3">
          Virtual Community
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
          不止一种声音
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
          基于真实价值观数据构建的虚拟人格，模拟真实社会的多元回应
        </p>
        {!isSignedIn ? (
          <div className="mt-7 flex gap-3">
            <SignInButton mode="modal">
              <button className="bg-primary text-white text-xs font-bold tracking-widest uppercase px-6 py-2.5 rounded hover:bg-primary/90 transition-all active:scale-95">
                立即加入
              </button>
            </SignInButton>
            <button
              onClick={() => router.push("/how-it-works")}
              className="text-xs font-bold tracking-widest uppercase px-6 py-2.5 rounded border border-primary/30 text-primary hover:bg-primary/5 transition-all"
            >
              了解更多
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/new")}
            className="mt-7 bg-primary text-white text-xs font-bold tracking-widest uppercase px-6 py-2.5 rounded hover:bg-primary/90 transition-all active:scale-95"
          >
            发起一个问题
          </button>
        )}
      </div>
    </section>
  );
}
