import { useEffect, useRef } from 'react';
import { ArrowDown, Brain, Sprout, CloudRain, TrendingUp } from 'lucide-react';

export default function HeroSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = Math.random() * 0.8 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 400 + 200;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.life * 0.02) * 0.3;
        this.life++;
        if (this.y < -10 || this.life > this.maxLife) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 222, 128, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const stats = [
    { icon: Brain, label: 'AI-Powered', value: '97%', desc: 'Model Accuracy' },
    { icon: Sprout, label: 'Crop Coverage', value: '12', desc: 'Crop Varieties' },
    { icon: CloudRain, label: 'Data Points', value: '7', desc: 'Input Features' },
    { icon: TrendingUp, label: 'Farmers', value: '500+', desc: 'Recommendations' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-agri-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#166534_0%,_#052e16_60%,_#022c22_100%)]" />
      
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-agri-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto section-padding text-center pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-agri-800/60 border border-agri-600/30 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-agri-400 rounded-full animate-pulse" />
          <span className="text-agri-200 text-sm font-medium">Machine Learning Powered</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-slide-up">
          Remove the Guesswork
          <br />
          <span className="text-agri-400">From Your Farm</span>
        </h1>

        <p className="text-lg sm:text-xl text-agri-200/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Enter your soil nutrients and weather conditions. Our AI model — trained
          on thousands of agricultural data points — recommends the most profitable
          crop with actionable farming advice.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <a href="#predict" className="btn-primary text-base inline-flex items-center justify-center gap-2 px-8">
            <Sprout className="w-5 h-5" />
            Start Prediction
          </a>
          <a href="#analytics" className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all inline-flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5" />
            View Analytics
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
            >
              <s.icon className="w-6 h-6 text-agri-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-agri-300/70 uppercase tracking-wider">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce-gentle">
          <a href="#predict" className="inline-flex flex-col items-center text-agri-400/60 hover:text-agri-300 transition-colors">
            <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
            <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
