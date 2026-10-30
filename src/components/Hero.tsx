import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, BookOpenCheck, Stethoscope, Sparkles } from "lucide-react";

const headline = "Hey, future doctor.";
const encouragement = "You don't have to remember everything today. Just keep showing up, one recall at a time.";

function useTypewriter(text: string, speed = 72, pause = 1250) {
  const [value, setValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && value === text) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && value.length === 0) {
      timeout = setTimeout(() => setDeleting(false), 350);
    } else {
      timeout = setTimeout(() => {
        setValue(current => deleting ? current.slice(0, -1) : text.slice(0, current.length + 1));
      }, deleting ? 38 : speed);
    }
    return () => clearTimeout(timeout);
  }, [value, deleting, text, speed, pause]);
  return value;
}

function TypewriterLine({ text, className = "" }: { text: string; className?: string }) {
  const typed = useTypewriter(text, 30, 2200);
  return <span className={`typewriter-line ${className}`} aria-label={text}>{typed}<span className="typewriter-caret" aria-hidden="true" /></span>;
}

const Hero = () => (
  <section className="hero hero-modern" id="top">
    <div className="hero-grid-glow" aria-hidden="true" />
    <div className="hero-content hero-copy">
      <span className="hero-eyebrow"><span className="eyebrow-pulse" /> YOUR DAILY DOSE OF MEDICAL RECALL</span>
      <h1><TypewriterLine text={headline} /></h1>
      <p className="hero-description hero-motivation"><TypewriterLine text={encouragement} /></p>
      <p className="hero-subtext">A calmer way to learn medicine, remember what matters, and walk into every exam with more confidence.</p>
      <div className="hero-flow" aria-label="Learning journey">
        <span><BookOpenCheck size={15} /> Learn</span><i>·</i><span><BrainCircuit size={15} /> Recall</span><i>·</i><span><Sparkles size={15} /> Master</span>
      </div>
      <div className="hero-actions">
        <a href="/register" className="primary-button">Start your journey <ArrowRight size={18} /></a>
        <p>Already have an account? <a href="/login">Log in</a></p>
      </div>
      <div className="hero-trustline"><span className="trust-dot" /> Built for curious minds in medicine</div>
    </div>

    <div className="hero-visual hero-scene" aria-label="Recalldose learning system illustration">
      <div className="scene-orbit scene-orbit-a" /><div className="scene-orbit scene-orbit-b" />
      <div className="scene-halo" />
      <div className="scene-core"><div className="scene-core-icon"><Stethoscope size={34} strokeWidth={1.5} /></div><span className="scene-core-kicker">YOUR MEMORY,</span><strong>IN TRAINING</strong><small>RECALLDOSE SYSTEM</small></div>
      <div className="scene-card scene-card-top"><span className="scene-card-icon violet"><BrainCircuit size={18} /></span><span><small>ACTIVE RECALL</small><strong>Make it stick</strong></span><span className="scene-card-spark" aria-hidden="true">✧</span></div>
      <div className="scene-card scene-card-right"><span className="scene-card-icon cyan"><BookOpenCheck size={18} /></span><span><small>DAILY PRACTICE</small><strong>One step closer</strong></span><span className="scene-status"><i /> LIVE</span></div>
      <div className="scene-card scene-card-bottom"><span className="scene-mini-bars"><i /><i /><i /><i /><i /></span><span><small>YOUR PROGRESS</small><strong>Small wins add up.</strong></span></div>
      <div className="scene-orbit-label label-left">LEARN <b>↗</b></div><div className="scene-orbit-label label-right">REMEMBER <b>✳</b></div>
    </div>
  </section>
);

export default Hero;
