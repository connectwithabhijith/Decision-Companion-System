import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
      }

      update() {
        // Subtle drift towards mouse
        const dx = mouse.current.x - this.x;
        const dy = mouse.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          this.vx += dx * 0.0001;
          this.vy += dy * 0.0001;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.8)'; // Brighter teal
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const particleCount = Math.min(Math.floor(window.innerWidth / 15), 100);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.update();
        p.draw();

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(45, 212, 191, ${0.25 * (1 - dist / 100)})`; // Brighter lines
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      // Mouse connections
      particles.forEach(p => {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(129, 140, 248, ${0.4 * (1 - dist / 150)})`; // Brighter mouse connections
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.current.x, mouse.current.y);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (bgRef.current) {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        bgRef.current.style.setProperty('--mouse-x', `${x}%`);
        bgRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={bgRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]"
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      }}
    >
      {/* Background Mesh Gradients */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/10 rounded-full mix-blend-screen filter blur-[120px] animate-float transition-transform duration-1000 ease-out"
        style={{ transform: `translate(calc(var(--mouse-x) * -0.02), calc(var(--mouse-y) * -0.02))` }}
      />
      <div 
        className="absolute top-[10%] right-[-10%] w-[60%] h-[80%] bg-teal-900/10 rounded-full mix-blend-screen filter blur-[150px] animate-float-delayed transition-transform duration-1000 ease-out"
        style={{ transform: `translate(calc(var(--mouse-x) * 0.01), calc(var(--mouse-y) * 0.01))` }}
      />
      
      {/* Interactive Spotlight Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.1) 0%, transparent 40%)`
        }}
      />

      {/* Main Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-1"
      />

      {/* Glassmorphism Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.05] contrast-150 brightness-150 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {/* SVG Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzOGMzLjMxNCAwIDYgMi42ODYgNiA2czIuNjg2IDYgNiA2IDYtMi42ODYgNi02LTIuNjg2LTYtNi02LTYgMi42ODYtNiA2eiIgZmlsbD0iIzY0NzQ4YiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
    </div>
  );
};

export default AnimatedBackground;

