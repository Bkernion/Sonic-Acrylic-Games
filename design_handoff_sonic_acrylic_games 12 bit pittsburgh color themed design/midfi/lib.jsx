// midfi/lib.jsx — shared mid-fi primitives for Sonic Acrylic Games.
// All components assume an enclosing element with class "sag" so the CSS
// tokens in tokens.css scope cleanly.

// ── Duotone photo placeholder ────────────────────────────────
// Stand-in for real photography: a diagonal-stripe pattern colored by tone
// (ink-on-paper, rust-on-paper, taupe-on-cream) with a subtle grain overlay
// and a tiny mono label so the design reads as "real photo intended here."
function Duotone({ label = 'PHOTO', w = '100%', h = 180, tone = 'ink', radius = 0, style = {} }) {
  const tones = {
    ink:   ['#1A1A1A', '#F2EDE2'],
    rust:  ['#C26B3E', '#F2EDE2'],
    taupe: ['#5C5246', '#EAE3D2'],
    cream: ['#5C5246', '#EAE3D2'],
  };
  const [fg, bg] = tones[tone] || tones.ink;
  const stripeAngle = 32;
  return (
    <div className="grain" style={{
      width: w, height: h, borderRadius: radius,
      background: `${bg}`,
      backgroundImage:
        `repeating-linear-gradient(${stripeAngle}deg, ${fg}25 0 2px, transparent 2px 5px),
         repeating-linear-gradient(${-stripeAngle}deg, ${fg}18 0 1px, transparent 1px 7px),
         radial-gradient(120% 80% at 30% 35%, ${fg}55 0%, ${fg}22 40%, transparent 75%)`,
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        position: 'absolute', left: 10, bottom: 8,
        fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: fg, opacity: 0.7,
      }}>{label}</div>
    </div>
  );
}

// ── Streak chip ──────────────────────────────────────────────
function Streak({ n = 15, compact = false }) {
  return (
    <span className="pill" style={{ padding: compact ? '3px 8px' : '4px 10px' }}>
      <span style={{ color: 'var(--rust)' }}>◆</span>
      <span>{n}</span>
    </span>
  );
}

// ── App bar — the brand chrome that sits inside each device screen ────
function AppBar({ kicker, streak = 15, onBack = true, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 10px',
      borderBottom: '1px solid var(--hair)',
      background: 'var(--paper)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2L4 7l5 5"/></svg>
          </div>
        )}
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink)' }}>
          {kicker}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {right}
        <Streak n={streak} compact />
      </div>
    </div>
  );
}

// ── Brand mark — tiny wordmark ───────────────────────────────
function Wordmark({ size = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span className="serif" style={{ fontSize: size, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Sonic Acrylic
      </span>
      <span className="mono" style={{ fontSize: size * 0.55, color: 'var(--taupe)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Games
      </span>
    </div>
  );
}

// ── Now playing ribbon — bottom sticky on most screens ───────
function NowPlaying({ track = 'half-life refrain', artist = 'the artist', paused = false, variant = 'bar' }) {
  if (variant === 'mini') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px 4px 4px', borderRadius: 999,
        background: 'var(--paper-2)', border: '1px solid var(--hair-2)',
      }}>
        <span style={{
          width: 18, height: 18, borderRadius: '50%', background: 'var(--ink)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--paper)', fontSize: 8,
        }}>{paused ? '❚❚' : '▶'}</span>
        <Equalizer paused={paused} />
        <span className="serif italic" style={{ fontSize: 12, color: 'var(--ink)' }}>{track}</span>
      </span>
    );
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: 'var(--paper-2)',
      borderTop: '1px solid var(--hair)',
    }}>
      <button style={{
        width: 30, height: 30, borderRadius: '50%', border: 0,
        background: 'var(--ink)', color: 'var(--paper)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 11,
      }}>{paused ? '❚❚' : '▶'}</button>
      <Equalizer paused={paused} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="serif italic" style={{ fontSize: 14, lineHeight: 1.1, color: 'var(--ink)' }}>
          "{track}"
        </div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--taupe)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
          {artist} · ambient
        </div>
      </div>
      <span className="mono" style={{ fontSize: 9.5, color: 'var(--taupe)', letterSpacing: '0.18em' }}>0:48</span>
    </div>
  );
}

function Equalizer({ paused }) {
  const bars = [6, 11, 5, 9, 7];
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
      {bars.map((h, i) => (
        <span key={i} style={{
          width: 2, height: h,
          background: 'var(--rust)',
          opacity: paused ? 0.3 : 1,
          animation: paused ? 'none' : `sagEq 1.${i+2}s ease-in-out infinite`,
          transformOrigin: 'bottom',
        }} />
      ))}
      <style>{`@keyframes sagEq { 0%,100%{transform:scaleY(0.5)} 50%{transform:scaleY(1)} }`}</style>
    </span>
  );
}

// ── Frame helper — gives every screen a consistent inner container ───
// kids are stacked vertically with flex; pass scroll=true on the content
// region you want to fill.
function Screen({ children, style = {} }) {
  return (
    <div className="sag" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--paper)',
      ...style,
    }}>{children}</div>
  );
}

// ── Quick layout helpers ─────────────────────────────────────
function Row({ children, gap = 8, align = 'center', style = {} }) {
  return <div style={{ display: 'flex', gap, alignItems: align, ...style }}>{children}</div>;
}
function Col({ children, gap = 8, style = {} }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}

Object.assign(window, {
  Duotone, Streak, AppBar, Wordmark, NowPlaying, Equalizer,
  Screen, Row, Col,
});
