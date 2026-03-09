"use client";

import { useEffect, useRef } from "react";

type MeshMode = "ambient" | "feature";

type MeshCanvasProps = {
  className?: string;
  mode: MeshMode;
};

type Node = {
  age: number;
  bornAt: number;
  radius: number;
  ttl: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

const configurations = {
  ambient: {
    connectionDistance: 132,
    initialNodes: 18,
    lineAlpha: 0.18,
    maxNodes: 28,
    sizeMax: 2.4,
    sizeMin: 1.1,
    spawnEvery: 1800,
    speed: 0.05,
    ttlMax: 13000,
    ttlMin: 7000,
  },
  feature: {
    connectionDistance: 172,
    initialNodes: 10,
    lineAlpha: 0.34,
    maxNodes: 58,
    sizeMax: 3.2,
    sizeMin: 1.4,
    spawnEvery: 820,
    speed: 0.11,
    ttlMax: 32000,
    ttlMin: 18000,
  },
} as const;

export function MeshCanvas({ className, mode }: MeshCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const configuration = configurations[mode];
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nodes: Node[] = [];
    let animationFrame = 0;
    let reducedMotion = mediaQuery.matches;
    let width = 0;
    let height = 0;
    let lastFrame = 0;
    let lastSpawn = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const createNode = (timestamp: number): Node => {
      const centerBias = mode === "feature" && nodes.length < 6;
      const horizontalPadding = 20;
      const verticalPadding = 20;
      const x = centerBias
        ? width / 2 + (Math.random() - 0.5) * width * 0.22
        : horizontalPadding +
          Math.random() * Math.max(1, width - horizontalPadding * 2);
      const y = centerBias
        ? height / 2 + (Math.random() - 0.5) * height * 0.22
        : verticalPadding +
          Math.random() * Math.max(1, height - verticalPadding * 2);

      return {
        age: 0,
        bornAt: timestamp,
        radius:
          configuration.sizeMin +
          Math.random() * (configuration.sizeMax - configuration.sizeMin),
        ttl:
          configuration.ttlMin +
          Math.random() * (configuration.ttlMax - configuration.ttlMin),
        vx: (Math.random() - 0.5) * configuration.speed,
        vy: (Math.random() - 0.5) * configuration.speed,
        x,
        y,
      };
    };

    const seedNodes = (timestamp: number) => {
      nodes.length = 0;

      for (let index = 0; index < configuration.initialNodes; index += 1) {
        nodes.push(createNode(timestamp));
      }
    };

    const update = (delta: number, timestamp: number) => {
      for (let index = nodes.length - 1; index >= 0; index -= 1) {
        const node = nodes[index];

        node.age += delta;
        node.x += node.vx * delta;
        node.y += node.vy * delta;

        if (node.x <= 0 || node.x >= width) {
          node.vx *= -1;
        }

        if (node.y <= 0 || node.y >= height) {
          node.vy *= -1;
        }

        node.x = Math.min(Math.max(node.x, 0), width);
        node.y = Math.min(Math.max(node.y, 0), height);

        if (mode === "ambient" && node.age >= node.ttl) {
          nodes.splice(index, 1);
        }
      }

      if (timestamp - lastSpawn >= configuration.spawnEvery) {
        if (nodes.length < configuration.maxNodes) {
          nodes.push(createNode(timestamp));
        } else if (mode === "ambient") {
          nodes.shift();
          nodes.push(createNode(timestamp));
        }

        lastSpawn = timestamp;
      }
    };

    const draw = (timestamp: number) => {
      context.clearRect(0, 0, width, height);

      for (let outerIndex = 0; outerIndex < nodes.length; outerIndex += 1) {
        const source = nodes[outerIndex];

        for (
          let innerIndex = outerIndex + 1;
          innerIndex < nodes.length;
          innerIndex += 1
        ) {
          const target = nodes[innerIndex];
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > configuration.connectionDistance) {
            continue;
          }

          const intensity =
            (1 - distance / configuration.connectionDistance) *
            configuration.lineAlpha;
          const pulse =
            0.72 +
            0.28 * Math.sin((timestamp + outerIndex * 29 + innerIndex * 17) / 620);

          context.beginPath();
          context.moveTo(source.x, source.y);
          context.lineTo(target.x, target.y);
          context.strokeStyle = `rgba(120,255,227,${intensity * pulse})`;
          context.lineWidth = mode === "feature" ? 1.15 : 0.9;
          context.stroke();
        }
      }

      for (const node of nodes) {
        const fadeIn = Math.min(node.age / 1200, 1);
        const fadeOut = Math.max(
          0,
          1 - Math.max(node.age - node.ttl + 1800, 0) / 1800,
        );
        const opacity = (mode === "feature" ? 0.92 : 0.62) * fadeIn * fadeOut;
        const bornFor = timestamp - node.bornAt;

        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(120,255,227,${opacity})`;
        context.fill();

        if (bornFor < 950) {
          const ringOpacity = (1 - bornFor / 950) * (mode === "feature" ? 0.6 : 0.3);

          context.beginPath();
          context.arc(
            node.x,
            node.y,
            node.radius + 2 + bornFor * 0.012,
            0,
            Math.PI * 2,
          );
          context.strokeStyle = `rgba(149,255,106,${ringOpacity})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    };

    const render = (timestamp: number) => {
      const delta = lastFrame === 0 ? 16 : Math.min(timestamp - lastFrame, 42);

      lastFrame = timestamp;
      update(delta, timestamp);
      draw(timestamp);
      animationFrame = window.requestAnimationFrame(render);
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;

      if (reducedMotion) {
        window.cancelAnimationFrame(animationFrame);
        draw(performance.now());
        return;
      }

      lastFrame = 0;
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    seedNodes(performance.now());
    draw(performance.now());

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      mediaQuery.removeEventListener("change", handleMotionPreference);
    };
  }, [mode]);

  return <canvas aria-hidden="true" className={className} ref={canvasRef} />;
}
