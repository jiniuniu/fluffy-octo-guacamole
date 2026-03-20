"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const NODE_COUNT = 60;
const MAX_DIST = 130;
const SPEED = 0.4;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // avatar radius
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
  ctx.fillStyle = "rgba(210,170,80,1)";
  ctx.lineWidth = 1.2;

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
        r: 6 + Math.random() * 4,
      }));
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      // update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      // draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.25;
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(210,170,80,${alpha * 2})`;
            ctx!.lineWidth = 0.8;
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // draw nodes
      for (const n of nodes) {
        const alpha = 0.55 + Math.random() * 0.1; // subtle flicker
        ctx!.strokeStyle = `rgba(210,170,80,1)`;
        drawPerson(ctx!, n.x, n.y, n.r, alpha);
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();

    const ro = new ResizeObserver(() => {
      init();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden border-b border-border bg-background"
      style={{ height: 360 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* gradient fade edges */}
      <div className="absolute inset-0 bg-linear-to-b from-background/30 via-transparent to-background/50 pointer-events-none" />

      {/* content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground drop-shadow-sm">
          虚拟网民的社区
        </h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          基于真实价值观数据构建的虚拟人格，不止一种声音
        </p>
        {!isSignedIn && (
          <div className="mt-6 flex gap-3">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="transition-all duration-300 hover:shadow-[0_0_20px_4px_rgba(210,170,80,0.5)] hover:brightness-110"
              >
                立即加入
              </Button>
            </SignInButton>
            <Button
              size="lg"
              variant="outline"
              className="transition-all duration-300 hover:shadow-[0_0_20px_4px_rgba(210,170,80,0.3)] hover:border-[rgba(210,170,80,0.6)] hover:brightness-110"
              onClick={() => {}}
            >
              了解更多
            </Button>
          </div>
        )}
        {isSignedIn && (
          <Button
            size="lg"
            className="mt-6 transition-all duration-300 hover:shadow-[0_0_20px_4px_rgba(210,170,80,0.5)] hover:brightness-110"
            onClick={() => router.push("/new")}
          >
            发起一个问题
          </Button>
        )}
      </div>
    </section>
  );
}
