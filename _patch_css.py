import sys

with open('style.css','r',encoding='utf-8') as f:
    lines = f.readlines()

# Lines 1515-1662 (1-indexed) = index 1514 to 1661 (0-indexed, inclusive)
new_guide = """\
/* ═══════════════════════════════════════════════════════
   HOW-TO GUIDE — mobile-first carousel
   ═══════════════════════════════════════════════════════ */
.guide-btn {
  position: fixed;
  bottom: 1.8rem;
  left: 1.8rem;
  z-index: 1050;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1.5px solid rgba(59,158,255,0.55);
  background: rgba(7,0,30,0.88);
  color: var(--blue);
  font-family: var(--F-display);
  font-size: 1.15rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px rgba(59,158,255,0.25);
}
.guide-btn:hover {
  border-color: var(--blue);
  box-shadow: 0 0 24px rgba(59,158,255,0.55);
  transform: scale(1.1);
}
.guide-overlay {
  position: fixed;
  inset: 0;
  z-index: 1600;
  background: rgba(2,0,14,0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s;
  backdrop-filter: blur(14px);
}
.guide-overlay.guide-active { opacity: 1; pointer-events: all; }
.guide-inner {
  max-width: 520px;
  width: 100%;
  max-height: 96vh;
  overflow: hidden;
  background: rgba(10,0,28,0.98);
  border: 1px solid rgba(59,158,255,0.18);
  border-radius: 24px;
  box-shadow: 0 0 80px rgba(59,158,255,0.12), 0 0 160px rgba(124,58,237,0.1);
  display: flex;
  flex-direction: column;
}
.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.4rem 0.85rem;
  border-bottom: 1px solid rgba(59,158,255,0.1);
  flex-shrink: 0;
}
.guide-badge {
  font-family: var(--F-accent);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  color: var(--blue);
  text-transform: uppercase;
}
.guide-close-x {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.5);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  flex-shrink: 0;
  line-height: 1;
}
.guide-close-x:hover { background: rgba(255,255,255,0.16); color: #fff; transform: rotate(90deg) scale(1.1); }
.guide-progress { height: 3px; background: rgba(59,158,255,0.1); flex-shrink: 0; }
.guide-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b9eff 0%, #9b59b6 100%);
  transition: width 0.4s ease;
  border-radius: 0 3px 3px 0;
}
.guide-step-count {
  text-align: center;
  font-family: var(--F-accent);
  font-size: 0.68rem;
  color: rgba(59,158,255,0.65);
  letter-spacing: 0.18em;
  padding: 0.5rem 0 0;
  flex-shrink: 0;
}
.guide-carousel { flex: 1; overflow: hidden; min-height: 0; }
.guide-slide { display: none; padding: 1.4rem 1.8rem 0.8rem; text-align: center; animation: gsSlideIn 0.3s ease; }
.guide-slide.active { display: block; }
.guide-slide.slide-left { animation: gsSlideInLeft 0.3s ease; }
@keyframes gsSlideIn {
  from { opacity:0; transform:translateX(28px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes gsSlideInLeft {
  from { opacity:0; transform:translateX(-28px); }
  to   { opacity:1; transform:translateX(0); }
}
.gs-icon-big { font-size:3.8rem; line-height:1; margin-bottom:0.55rem; filter:drop-shadow(0 0 18px rgba(59,158,255,0.5)); }
.gs-num { font-family:var(--F-accent); font-size:0.63rem; letter-spacing:0.28em; color:rgba(59,158,255,0.6); margin-bottom:0.3rem; }
.gs-title { font-family:var(--F-display); font-size:clamp(1.4rem,4vw,1.9rem); color:#e8d5f5; letter-spacing:0.05em; margin:0 0 0.65rem; line-height:1.1; }
.gs-desc { font-family:var(--F-body); font-size:0.88rem; color:rgba(220,210,240,0.8); line-height:1.7; margin:0 0 1rem; }
.gs-desc strong { color:var(--gold); }
.gs-mobile-tip {
  background: rgba(59,158,255,0.07);
  border: 1px solid rgba(59,158,255,0.2);
  border-radius: 14px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  text-align: left;
}
.gs-tip-label { font-family:var(--F-accent); font-size:0.62rem; letter-spacing:0.2em; color:var(--blue); font-weight:700; }
.gs-mobile-tip span:last-child { font-family:var(--F-body); font-size:0.82rem; color:rgba(120,190,255,0.9); line-height:1.55; }
.gs-mobile-tip strong { color:#93c5fd; }
.guide-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.4rem;
  border-top: 1px solid rgba(59,158,255,0.08);
  flex-shrink: 0;
}
.guide-nav-btn {
  background: rgba(59,158,255,0.1);
  border: 1px solid rgba(59,158,255,0.3);
  color: var(--blue);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  flex-shrink: 0;
}
.guide-nav-btn:hover { background: rgba(59,158,255,0.22); transform: scale(1.08); }
.guide-nav-btn:disabled { opacity: 0.2; cursor: default; pointer-events: none; }
.guide-dots { display:flex; gap:0.5rem; align-items:center; }
.guide-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(59,158,255,0.22);
  transition: all 0.3s; cursor: pointer; border: none;
}
.guide-dot.active { background:var(--blue); width:24px; border-radius:4px; box-shadow:0 0 10px rgba(59,158,255,0.7); }
.guide-close-btn {
  display: block;
  margin: 0 1.4rem 1.2rem;
  width: calc(100% - 2.8rem);
  background: linear-gradient(135deg, #3b9eff 0%, #7c3aed 100%);
  color: #fff; border: none; border-radius: 14px; padding: 0.9rem;
  font-family: var(--F-display); font-size: 1.1rem; letter-spacing: 0.08em;
  cursor: pointer; transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 22px rgba(59,158,255,0.3); flex-shrink: 0;
}
.guide-close-btn:hover { opacity:0.88; transform:scale(0.99); }
@media (max-width: 520px) {
  .guide-overlay { padding: 0.5rem; align-items: flex-end; }
  .guide-inner { border-radius: 20px 20px 16px 16px; max-height: 92vh; }
  .guide-slide { padding: 1.1rem 1.1rem 0.6rem; }
  .gs-icon-big { font-size: 3rem; }
  .guide-header { padding: 0.9rem 1.1rem 0.7rem; }
  .guide-nav { padding: 0.5rem 1.1rem; }
  .guide-close-btn { margin: 0 1.1rem 1rem; width: calc(100% - 2.2rem); }
}
@media (max-width: 380px) {
  .gs-title { font-size: 1.25rem; }
  .gs-desc  { font-size: 0.8rem; }
  .gs-mobile-tip span:last-child { font-size: 0.78rem; }
}
"""

before = lines[:1514]      # lines 1..1514
after  = lines[1662:]      # lines 1663.. (after the old guide section)
result = before + [new_guide] + after

with open('style.css','w',encoding='utf-8') as f:
    f.writelines(result)
print('OK - wrote', len(result), 'lines')
