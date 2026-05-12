// midfi/screens.jsx — All 8 mid-fi screens for Sonic Acrylic Games.
// Each component renders the *inside* of a phone (status bar + nav handled
// by the device frame). Uses primitives from midfi/lib.jsx.

// Shared scrollable body shell
const Body = ({ children, pad = 16, gap = 12, style = {} }) => (
  <div style={{
    flex: 1, overflow: 'auto', padding: pad,
    display: 'flex', flexDirection: 'column', gap,
    ...style,
  }}>{children}</div>
);

// ═══════════════════════════════════════════════════════════════
// 1. HOME — Newsfeed
// ═══════════════════════════════════════════════════════════════
function HomeNewsfeed() {
  // The day's pool — five artists chosen from the curated list of ~150.
  // The game-maker agents find the connections between them.
  const lineup = ['Radiohead', 'Joni Mitchell', 'Phoebe Bridgers', 'Big Thief', 'Elliott Smith'];
  const games = [
    ['CONNECT', 'Sixteen songs from tonight\'s five', 'Sort them into four hidden groups.'],
    ['SPELL', 'A word the lineup keeps reaching for', 'Six guesses. Memory only.'],
    ['LYRIC', 'One missing word, one chance', 'From a chorus you almost remember.'],
    ['ATTRIBUTE', 'Who said it?', 'Match the quote to one of tonight\'s voices.'],
    ['CHRONOLOGY', 'Five records, in order', 'Drawn across the lineup.'],
    ['INFLUENCE', 'Teacher → pupil', 'Trace the line between two columns of five.'],
  ];
  return (
    <Screen>
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--hair)' }}>
        <Wordmark size={15} />
        <Streak n={15} compact />
      </div>
      <Body pad={0} gap={0}>
        <div style={{ padding: '18px 18px 16px', background: 'var(--paper-2)' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--taupe)' }}>TUE · NOV 11 · ED.412</div>
          <div className="serif" style={{ fontSize: 28, lineHeight: 1.02, marginTop: 8, fontWeight: 600 }}>
            Tonight's<br/>table of five.
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lineup.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--rust)', letterSpacing: '0.18em', width: 18 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="serif" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{n}</span>
              </div>
            ))}
          </div>
          <div className="serif italic" style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--taupe)', marginTop: 12, borderTop: '1px solid var(--hair-2)', paddingTop: 10 }}>
            Five voices that all sang into the same cold room — but each found a different way out. Six games to map the overlap.
          </div>
        </div>
        <div className="rule one" style={{ padding: '14px 18px 6px' }}>Today's six</div>
        <div>
          {games.map(([k, title, sub], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 18px',
              borderBottom: i < games.length - 1 ? '1px solid var(--hair)' : '0',
            }}>
              <div style={{ width: 22, color: 'var(--taupe)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, marginTop: 4 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--rust)' }}>{k}</div>
                <div className="serif" style={{ fontSize: 17, lineHeight: 1.15, marginTop: 2, fontWeight: 500 }}>{title}</div>
                <div className="serif italic" style={{ fontSize: 12.5, lineHeight: 1.35, color: 'var(--taupe)', marginTop: 3 }}>{sub}</div>
              </div>
              <div style={{ color: 'var(--ink)', fontSize: 14, marginTop: 6 }}>→</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 18px 8px' }}>
          <div className="rule one" style={{ color: 'var(--taupe)' }}>Side B</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            <div style={{ padding: 10, background: 'var(--paper-2)', borderRadius: 6 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--taupe)' }}>LEADERBOARD</div>
              <div className="serif" style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>#412 / 8.2k</div>
            </div>
            <div style={{ padding: 10, background: 'var(--paper-2)', borderRadius: 6 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--taupe)' }}>TIP JAR</div>
              <div className="serif italic" style={{ fontSize: 13, marginTop: 2, color: 'var(--ink)' }}>buy the curator a coffee</div>
            </div>
          </div>
        </div>
      </Body>
      <NowPlaying />
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. CONNECTIONS — Marginalia
// ═══════════════════════════════════════════════════════════════
function ConnectionsScreen() {
  const tiles = [
    'NO SURPRISES', 'STREET SPIRIT', 'PARANOID ANDROID', 'EXIT MUSIC',
    'LET DOWN', 'KARMA POLICE', 'FAKE PLASTIC', 'CREEP',
    'NUDE', 'WEIRD FISHES', 'IDIOTEQUE', 'HOW TO DISAPPEAR',
    'PYRAMID SONG', 'DAYDREAMING', 'TRUE LOVE WAITS', 'LOTUS FLOWER',
  ];
  const selected = new Set([0, 5, 7, 11]);
  return (
    <Screen>
      <AppBar kicker="CONNECTIONS · 1 OF 6" streak={15} />
      <Body pad={14} gap={10}>
        <div>
          <div className="serif" style={{ fontSize: 19, lineHeight: 1.15, fontWeight: 500 }}>
            Sixteen songs.<br/>Four hidden categories.
          </div>
          <div className="serif italic" style={{ fontSize: 12.5, color: 'var(--taupe)', marginTop: 4 }}>
            One group is about waiting. The rest, you'll have to feel out.
          </div>
        </div>
        <Row style={{ justifyContent: 'space-between' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--taupe)', letterSpacing: '0.18em' }}>MISTAKES LEFT</span>
          <Row gap={4}>
            {[0,1,2,3].map(i => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i < 3 ? 'var(--ink)' : 'var(--hair)' }} />
            ))}
          </Row>
        </Row>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {tiles.map((t, i) => {
            const isSel = selected.has(i);
            return (
              <div key={i} className="tile" style={{
                aspectRatio: '1', fontSize: 10, lineHeight: 1.05, padding: 4, textAlign: 'center',
                background: isSel ? 'var(--ink)' : 'var(--paper-2)',
                color: isSel ? 'var(--paper)' : 'var(--ink)',
                borderColor: isSel ? 'var(--ink)' : 'var(--hair-2)',
                borderRadius: 3,
              }}>{t}</div>
            );
          })}
        </div>
        {/* Marginalia note */}
        <div style={{
          marginTop: 4, padding: '10px 12px',
          borderLeft: '2px solid var(--rust)',
          background: 'var(--paper-2)',
        }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--rust)', letterSpacing: '0.2em' }}>MARGINALIA · 14</div>
          <div className="serif italic" style={{ fontSize: 12.5, lineHeight: 1.35, color: 'var(--ink)', marginTop: 3 }}>
            "Yorke once said his band makes pop music — for people who hate pop music. Sort accordingly."
          </div>
        </div>
        <Row gap={8} style={{ marginTop: 4 }}>
          <button className="btn ghost sm" style={{ flex: 1 }}>SHUFFLE</button>
          <button className="btn ghost sm" style={{ flex: 1 }}>CLEAR</button>
          <button className="btn rust sm" style={{ flex: 1.4 }}>SUBMIT</button>
        </Row>
      </Body>
      <NowPlaying variant="mini" />
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. FIVE LETTERS — Wordle
// ═══════════════════════════════════════════════════════════════
function SpellScreen() {
  // states: hit (right pos), near (in word), miss, empty
  const rows = [
    [['K','miss'],['A','miss'],['R','near'],['M','miss'],['A','miss']],
    [['T','miss'],['R','near'],['A','miss'],['I','near'],['L','miss']],
    [['G','miss'],['H','miss'],['O','hit'],['S','miss'],['T','miss']],
    [['','empty'],['','empty'],['','empty'],['','empty'],['','empty']],
    [['','empty'],['','empty'],['','empty'],['','empty'],['','empty']],
    [['','empty'],['','empty'],['','empty'],['','empty'],['','empty']],
  ];
  const stateBg = { hit: 'var(--rust)', near: 'var(--taupe-2)', miss: 'var(--hair)', empty: 'var(--paper)' };
  const stateFg = { hit: 'var(--paper)', near: 'var(--paper)', miss: 'var(--taupe)', empty: 'var(--ink)' };
  const stateBd = { hit: 'var(--rust)', near: 'var(--taupe-2)', miss: 'var(--hair)', empty: 'var(--hair-2)' };
  const keyRows = ['QWERTYUIOP', 'ASDFGHJKL', '↵ZXCVBNM⌫'];
  const keyState = { K: 'miss', A: 'miss', R: 'near', M: 'miss', T: 'miss', I: 'near', L: 'miss', G: 'miss', H: 'miss', O: 'hit', S: 'miss' };
  return (
    <Screen>
      <AppBar kicker="SPELL · 3/6" streak={15} />
      <Body pad={16} gap={12}>
        <div className="serif italic" style={{ fontSize: 13, color: 'var(--taupe)', lineHeight: 1.35 }}>
          A word that buries itself in an OK Computer chorus. Five letters. The rest is memory.
        </div>
        <div style={{ display: 'grid', gap: 5, justifyContent: 'center' }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 46px)', gap: 5 }}>
              {row.map(([ch, st], j) => (
                <div key={j} className="tile" style={{
                  width: 46, height: 46, fontSize: 22, fontWeight: 600,
                  background: stateBg[st], color: stateFg[st], borderColor: stateBd[st], borderRadius: 2,
                }}>{ch}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
          {keyRows.map((kr, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {[...kr].map(k => {
                const st = keyState[k];
                return (
                  <div key={k} className="mono" style={{
                    minWidth: k === '↵' || k === '⌫' ? 36 : 26, height: 38,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 500, borderRadius: 4,
                    background: st ? stateBg[st] : 'var(--paper-2)',
                    color: st ? stateFg[st] : 'var(--ink)',
                    border: `1px solid ${st ? stateBd[st] : 'var(--hair-2)'}`,
                  }}>{k}</div>
                );
              })}
            </div>
          ))}
        </div>
      </Body>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. LYRIC — Fill the Gap
// ═══════════════════════════════════════════════════════════════
function LyricScreen() {
  const choices = ['MATHS', 'CODE', 'TONGUES', 'MAXIMS'];
  return (
    <Screen>
      <AppBar kicker="LYRIC · ONE TRY" streak={15} />
      <Body pad={18} gap={16}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--taupe)' }}>
          THE SOURCE · KARMA POLICE · 1997
        </div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.25, color: 'var(--ink)', fontWeight: 500 }}>
          Karma police,<br/>
          arrest this man,<br/>
          he talks in <span style={{
            borderBottom: '2px solid var(--rust)', padding: '0 14px',
            color: 'var(--rust)', fontStyle: 'italic', fontWeight: 600,
          }}>____</span>
        </div>
        <div className="serif italic" style={{ fontSize: 13, color: 'var(--taupe)', lineHeight: 1.4, borderLeft: '2px solid var(--hair-2)', paddingLeft: 10 }}>
          One word. Three decoys, written by a machine that doesn't know what it's like to be paranoid at three in the morning.
        </div>
        <Col gap={8}>
          {choices.map((c, i) => (
            <div key={i} style={{
              padding: '14px 16px', border: '1.5px solid var(--ink)',
              borderRadius: 6, background: i === 0 ? 'var(--paper-2)' : 'var(--paper)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span className="serif" style={{ fontSize: 17, fontWeight: 500 }}>{c}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--taupe)', letterSpacing: '0.18em' }}>
                {['A','B','C','D'][i]}
              </span>
            </div>
          ))}
        </Col>
        <button className="btn rust" style={{ width: '100%' }}>COMMIT</button>
      </Body>
      <NowPlaying variant="mini" />
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. ORDER — Chronology timeline
// ═══════════════════════════════════════════════════════════════
function OrderScreen() {
  const items = [
    { year: 1995, title: 'The Bends', placed: true },
    { year: 1997, title: 'OK Computer', placed: true },
    { year: 2000, title: 'Kid A', placed: null, dragging: true },
    { year: 2003, title: 'Hail to the Thief', placed: null },
    { year: 2007, title: 'In Rainbows', placed: true },
    { year: 2011, title: 'King of Limbs', placed: null },
    { year: 2016, title: 'A Moon Shaped Pool', placed: true },
  ];
  return (
    <Screen>
      <AppBar kicker="CHRONOLOGY · 5 RECORDS" streak={15} />
      <Body pad={16} gap={12}>
        <div className="serif italic" style={{ fontSize: 13, color: 'var(--taupe)', lineHeight: 1.4 }}>
          Five records, in the order they bent the room. Drag.
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          {/* Year rail */}
          <div style={{ position: 'relative', width: 54, paddingTop: 4 }}>
            <div style={{ position: 'absolute', top: 4, bottom: 4, left: 26, width: 1, background: 'var(--ink)' }} />
            {items.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', height: 56, position: 'relative' }}>
                <div className="mono" style={{ width: 30, fontSize: 11, color: 'var(--taupe)', letterSpacing: '0.1em' }}>{it.year}</div>
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: it.placed ? 'var(--rust)' : 'var(--paper)',
                  border: '1.5px solid var(--ink)',
                }} />
              </div>
            ))}
          </div>
          {/* Cards */}
          <div style={{ flex: 1, paddingTop: 4 }}>
            {items.map((it, i) => (
              <div key={i} style={{
                height: 56, marginBottom: 0, display: 'flex', alignItems: 'center',
              }}>
                <div style={{
                  flex: 1, padding: '8px 12px',
                  border: it.placed ? '1px solid var(--hair-2)' : '1.5px dashed var(--rust)',
                  background: it.dragging ? 'var(--ink)' : (it.placed ? 'var(--paper-2)' : 'transparent'),
                  color: it.dragging ? 'var(--paper)' : 'var(--ink)',
                  borderRadius: 4,
                  transform: it.dragging ? 'translateX(-6px) rotate(-1deg)' : 'none',
                  boxShadow: it.dragging ? '0 8px 24px rgba(0,0,0,0.18)' : 'none',
                  opacity: !it.placed && !it.dragging ? 0.6 : 1,
                }}>
                  <div className="serif" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.1 }}>
                    {it.placed || it.dragging ? it.title : '— drag here —'}
                  </div>
                  {(it.placed || it.dragging) && (
                    <div className="mono" style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.18em', marginTop: 2 }}>
                      LP · {it.year}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="serif italic" style={{ fontSize: 12, color: 'var(--rust)', textAlign: 'center', marginTop: 4 }}>
          ↓ two left in the tray ↓
        </div>
      </Body>
      <NowPlaying variant="mini" />
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. ATTRIBUTE — Match quote to artist
// ═══════════════════════════════════════════════════════════════
function AttrScreen() {
  const artists = [
    { name: 'Søren Kierkegaard', sub: 'philosopher', tone: 'ink' },
    { name: 'Thom Yorke', sub: 'Radiohead', tone: 'rust', picked: true },
    { name: 'Father John Misty', sub: 'auteur', tone: 'taupe' },
    { name: 'David Foster Wallace', sub: 'novelist', tone: 'ink' },
  ];
  return (
    <Screen>
      <AppBar kicker="ATTRIBUTION" streak={15} />
      <Body pad={18} gap={14}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--taupe)' }}>
          WHO SAID IT?
        </div>
        <div style={{ borderLeft: '3px solid var(--rust)', paddingLeft: 14 }}>
          <div className="serif" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 500 }}>
            "Anxiety is the dizziness of freedom — the moment you realize no one is coming to choose for you."
          </div>
          <div className="mono italic" style={{ fontSize: 10, color: 'var(--taupe)', letterSpacing: '0.16em', marginTop: 8 }}>
            — translated from a notebook
          </div>
        </div>
        <div className="serif italic" style={{ fontSize: 12.5, color: 'var(--taupe)', lineHeight: 1.4 }}>
          Four voices. One of them said this — or could have. Tap who.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {artists.map((a, i) => (
            <div key={i} style={{
              padding: 10, borderRadius: 6,
              border: a.picked ? '1.5px solid var(--rust)' : '1px solid var(--hair-2)',
              background: a.picked ? 'var(--paper-2)' : 'var(--paper)',
            }}>
              <Duotone label="" h={80} tone={a.tone} radius={3} />
              <div className="serif" style={{ fontSize: 13.5, fontWeight: 500, marginTop: 6, lineHeight: 1.1 }}>{a.name}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--taupe)', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 2 }}>{a.sub}</div>
            </div>
          ))}
        </div>
        <button className="btn primary" style={{ width: '100%' }}>SUBMIT GUESS</button>
      </Body>
      <NowPlaying variant="mini" />
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. INFLUENCE — Web of teacher → pupil
// ═══════════════════════════════════════════════════════════════
function InfluenceScreen() {
  const left = ['Pink Floyd', 'Talking Heads', 'Joy Division', 'Miles Davis', 'The Smiths'];
  const right = ['Radiohead', 'LCD Soundsystem', 'Interpol', 'The Mars Volta', 'Belle & Sebastian'];
  // pre-drawn matches (indices into left → right)
  const drawn = [[0, 0, 'solid'], [1, 1, 'solid'], [2, 2, 'hover']];

  // Layout constants — using % for the dot columns so SVG paths and HTML
  // dots use the SAME coordinate space (viewBox 100 wide, preserveAspectRatio
  // none stretches to fill).
  const H = 360;
  const HEADER_H = 28;
  const BODY_H = H - HEADER_H;
  const ROW_H = BODY_H / 5;
  const LX = 32;  // teacher column center, %
  const RX = 68;  // pupil column center, %
  const rowY = i => HEADER_H + ROW_H / 2 + i * ROW_H;

  return (
    <Screen>
      <AppBar kicker="INFLUENCE · 3/5 DRAWN" streak={15} />
      <Body pad={14} gap={12}>
        <div className="serif italic" style={{ fontSize: 13, color: 'var(--taupe)', lineHeight: 1.4 }}>
          Trace the line. Who taught whom?
        </div>
        <div style={{ position: 'relative', height: H, width: '100%' }}>
          {/* SVG threads — viewBox-percent coords, stretches to fill */}
          <svg
            viewBox={`0 0 100 ${H}`}
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {drawn.map(([l, r, st], i) => {
              const y1 = rowY(l), y2 = rowY(r);
              const mid = (LX + RX) / 2;
              return (
                <path key={i}
                  d={`M ${LX} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${RX} ${y2}`}
                  stroke={st === 'solid' ? 'var(--rust)' : 'var(--taupe)'}
                  strokeWidth={st === 'solid' ? 2 : 1.5}
                  strokeDasharray={st === 'hover' ? '4 4' : '0'}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          {/* Column headers — centered ABOVE each dot column */}
          <div style={{
            position: 'absolute', top: 4, left: `${LX}%`, transform: 'translateX(-50%)',
          }}>
            <span className="mono" style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--taupe)' }}>TEACHER</span>
          </div>
          <div style={{
            position: 'absolute', top: 4, left: `${RX}%`, transform: 'translateX(-50%)',
          }}>
            <span className="mono" style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--taupe)' }}>PUPIL</span>
          </div>
          {/* Rows */}
          {left.map((name, i) => (
            <React.Fragment key={i}>
              {/* Left name */}
              <div style={{
                position: 'absolute', top: rowY(i), left: `calc(${LX}% - 12px)`,
                transform: 'translate(-100%, -50%)', whiteSpace: 'nowrap',
              }}>
                <span className="serif" style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</span>
              </div>
              {/* Left dot */}
              <div style={{
                position: 'absolute', top: rowY(i), left: `${LX}%`,
                transform: 'translate(-50%, -50%)',
                width: 11, height: 11, borderRadius: '50%',
                background: 'var(--ink)', border: '2px solid var(--paper)',
                boxShadow: '0 0 0 1px var(--ink)',
              }} />
              {/* Right dot */}
              <div style={{
                position: 'absolute', top: rowY(i), left: `${RX}%`,
                transform: 'translate(-50%, -50%)',
                width: 11, height: 11, borderRadius: '50%',
                background: i < 3 ? 'var(--rust)' : 'var(--paper)',
                border: '2px solid var(--paper)',
                boxShadow: '0 0 0 1px var(--ink)',
              }} />
              {/* Right name */}
              <div style={{
                position: 'absolute', top: rowY(i), left: `calc(${RX}% + 12px)`,
                transform: 'translateY(-50%)', whiteSpace: 'nowrap',
              }}>
                <span className="serif" style={{ fontSize: 12.5, fontWeight: 500 }}>{right[i]}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ padding: '8px 10px', background: 'var(--paper-2)', borderRadius: 4 }}>
          <div className="serif italic" style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.35 }}>
            "Two more lines to draw. One of them is harder than it looks."
          </div>
        </div>
      </Body>
      <NowPlaying variant="mini" />
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. WIN — Solved + share
// ═══════════════════════════════════════════════════════════════
function WinScreen() {
  const stats = [['STREAK', '15 days'], ['RANK', '#412 / 8.2k'], ['TIME', '02:51'], ['MISTAKES', 'two']];
  const streakDays = 15;
  return (
    <Screen>
      <AppBar kicker="SOLVED · 02:51" streak={15} />
      <Body pad={18} gap={14}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--rust)' }}>
          CONNECTIONS · TUE
        </div>
        <div className="serif" style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 600 }}>
          Four groups solved,<br/>no missteps.
        </div>
        <div className="serif italic" style={{ fontSize: 13, color: 'var(--taupe)', lineHeight: 1.4 }}>
          The record kept playing the whole time. It still is.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {stats.map(([k, v], i) => (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--paper-2)', borderRadius: 4 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--taupe)' }}>{k}</div>
              <div className="serif" style={{ fontSize: 17, fontWeight: 500, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
        {/* Streak row — one square per day unbroken */}
        <div style={{ padding: '14px 14px 16px', background: 'var(--ink)', color: 'var(--paper)', borderRadius: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--rust-3)' }}>STREAK</span>
            <span className="serif" style={{ fontSize: 14, fontWeight: 500 }}>{streakDays} days, unbroken</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${streakDays}, 1fr)`,
            gap: 4, marginTop: 10,
          }}>
            {Array.from({ length: streakDays }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: '1',
                background: 'var(--rust)',
                opacity: i === streakDays - 1 ? 1 : 0.55 + (i / streakDays) * 0.4,
                borderRadius: 2,
                boxShadow: i === streakDays - 1 ? '0 0 0 1.5px var(--paper)' : 'none',
              }} />
            ))}
          </div>
        </div>
        <Row gap={6}>
          <button className="btn ghost sm" style={{ flex: 1 }}>SHARE</button>
          <button className="btn ghost sm" style={{ flex: 1 }}>TIP JAR</button>
          <button className="btn rust sm" style={{ flex: 1.3 }}>NEXT GAME</button>
        </Row>
      </Body>
      <NowPlaying track="half-life refrain" />
    </Screen>
  );
}

Object.assign(window, {
  HomeNewsfeed, ConnectionsScreen, SpellScreen, LyricScreen,
  OrderScreen, AttrScreen, InfluenceScreen, WinScreen,
});
