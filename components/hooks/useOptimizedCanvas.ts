import { useEffect, useRef, useCallback } from 'react';

interface Dot {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
}

interface CanvasOptions {
  dotDensity?: number;
  maxDots?: number;
  interactionRadius?: number;
  colors?: string[];
  enableInteraction?: boolean;
  enableBoundaries?: boolean;
  speed?: number;
}

export const useOptimizedCanvas = (options: CanvasOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePositionRef = useRef<{x: number | null, y: number | null}>({ x: null, y: null });
  const lastRenderTime = useRef<number>(0);
  const isVisible = useRef<boolean>(true);
  
  const {
    dotDensity = 15000,
    maxDots = 200,
    interactionRadius = 100,
    colors = ['rgba(12, 242, 160, 0.3)'],
    enableInteraction = true,
    enableBoundaries = true,
    speed = 0.3
  } = options;

  const initializeDots = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dots: Dot[] = [];
    const numDots = Math.min(
      Math.floor((canvas.width * canvas.height) / dotDensity),
      maxDots
    );
    
    for (let i = 0; i < numDots; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed
      });
    }
    
    dotsRef.current = dots;
  }, [dotDensity, maxDots, colors, speed]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Set actual canvas size (accounting for device pixel ratio)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    initializeDots();
  }, [initializeDots]);

  const render = useCallback((currentTime: number) => {
    if (!isVisible.current) {
      animationFrameId.current = requestAnimationFrame(render);
      return;
    }
    
    // Throttle to 60fps max
    if (currentTime - lastRenderTime.current < 16.67) {
      animationFrameId.current = requestAnimationFrame(render);
      return;
    }
    lastRenderTime.current = currentTime;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Update and draw dots
    dotsRef.current.forEach(dot => {
      // Update position
      dot.x += dot.vx;
      dot.y += dot.vy;
      
      // Boundary checking
      if (enableBoundaries) {
        if (dot.x < 0 || dot.x > rect.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > rect.height) dot.vy *= -1;
      }
      
      // Mouse interaction
      if (enableInteraction) {
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;
        
        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - dot.x;
          const dy = mouseY - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < interactionRadius) {
            const angle = Math.atan2(dy, dx);
            const repelForce = (interactionRadius - distance) / 1000;
            dot.vx -= Math.cos(angle) * repelForce;
            dot.vy -= Math.sin(angle) * repelForce;
          }
        }
      }
      
      // Draw dot
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.fill();
    });
    
    animationFrameId.current = requestAnimationFrame(render);
  }, [enableBoundaries, enableInteraction, interactionRadius]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mousePositionRef.current = { x: null, y: null };
  }, []);

  const handleVisibilityChange = useCallback(() => {
    isVisible.current = !document.hidden;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    resizeCanvas();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    
    // Start animation
    animationFrameId.current = requestAnimationFrame(render);
    
    return () => {
      // Cleanup
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      observer.disconnect();
    };
  }, [resizeCanvas, handleMouseMove, handleMouseLeave, handleVisibilityChange, render]);

  return canvasRef;
}; 