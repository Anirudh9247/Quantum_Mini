'use client';

import React, { useEffect, useRef } from 'react';

export function InteractiveParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for interactive quantum wave distortion
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 180,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Device-aware particle count: 40 on mobile, up to 90 on desktop
    const isMobile = width < 768;
    const numParticles = isMobile ? 35 : Math.min(90, Math.floor((width * height) / 14000));

    interface QuantumParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      phase: number;
      speed: number;
      colorState: number;
    }

    const particles: QuantumParticle[] = [];

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2.2 + 1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.025,
        colorState: Math.random(),
      });
    }

    let time = 0;
    let isTabVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.012;

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle background quantum potential grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 90;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render particles & wave connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.phase += p.speed;
        p.colorState = (Math.sin(p.phase) + 1) / 2;

        p.x += p.vx + Math.sin(time + p.phase) * 0.25;
        p.y += p.vy + Math.cos(time + p.phase) * 0.25;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let activeX = p.x;
        let activeY = p.y;

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 20;
          const angle = Math.atan2(dy, dx);
          activeX -= Math.cos(angle) * force;
          activeY -= Math.sin(angle) * force;
        }

        const r = Math.round(0 * (1 - p.colorState) + 192 * p.colorState);
        const g = Math.round(240 * (1 - p.colorState) + 132 * p.colorState);
        const b = Math.round(255 * (1 - p.colorState) + 252 * p.colorState);
        const alpha = 0.35 + Math.sin(p.phase) * 0.2;

        ctx.beginPath();
        ctx.arc(activeX, activeY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Wave connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p2.x - p.x;
          const pdy = p2.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 110) {
            const lineAlpha = (1 - pdist / 110) * 0.12;
            ctx.beginPath();
            ctx.moveTo(activeX, activeY);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      style={{ opacity: 0.85 }}
    />
  );
}
