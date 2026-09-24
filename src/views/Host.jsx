import { useEffect, useMemo, useState } from 'react';
import { ref, remove, set, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthUser, useDbValue } from '../lib/hooks';
import { ROLES, ROLE_ORDER, TEAMS, playerList } from '../lib/roles';
import event from '../data/event.json';
import { ConnectionBadge, Splash } from '../components/Common';

// Surface failed host writes (e.g. permission denied after the PIN changed).
function act(promise) {
  return promise.catch((e) => alert(`Could not save: ${e.message}`));
}

export default function Host() {
  const { user } = useAuthUser();
  if (!user) return <Splash text="Loading host…" />;
  return <HostGate uid={user.uid} />;
}

// The PIN is checked by the database rules: writing hosts/<uid> only succeeds if
// it equals /secret/hostPin (which no browser can read).
function HostGate({ uid }) {
  const claim = useDbValue(`hosts/${uid}`);
  const [status, setStatus] = useState('checking'); // checking | ok | need-pin

  useEffect(() => {
    if (claim === undefined) return;
    if (!claim) {
      setStatus('need-pin');
      return;
    }
    // Re-assert the stored claim: fails if the PIN was changed since.
    set(ref(db, `hosts/${uid}`), claim)
      .then(() => setStatus('ok'))
      .catch(() => {
        remove(ref(db, `hosts/${uid}`)).catch(() => {});
        setStatus('need-pin');
      });
  }, [claim, uid]);

  if (status === 'checking') return <Splash text="Loading host…" />;
  if (status === 'need-pin') return <PinForm uid={uid} />;
  return <HostDashboard uid={uid} />;
}

function PinForm({ uid }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="host host-pin">
      <ConnectionBadge />
      <form
        className="join-card"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          set(ref(db, `hosts/${uid}`), pin.trim())
            .catch(() => setError('Wrong PIN'))
            .finally(() => setBusy(false));
        }}
      >
        <div className="join-emoji">🎤</div>
        <h1 className="join-title">Host controls</h1>
        <input
          className="big-input pin-input"
          type="password"
          inputMode="numeric"
          autoFocus
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button className="big-btn sage" disabled={!pin || busy}>
          Enter
        </button>
      </form>
    </div>
  );
}

function HostDashboard({ uid }) {
  const players = useDbValue('players');
  const config = useDbValue('config');
  const game = useDbValue('game');

  if (players === undefined || config === undefined || game === undefined) return <Splash text="Loading host…" />;

  const testMode = config?.testMode === true;

  return (
    <div className="host">
      <ConnectionBadge />
      <header className="host-top">
        <div className="host-title">🎤 Host</div>
        {testMode && <span className="pill warn">TEST MODE ON</span>}
        <a className="link-btn" href="/display" target="_blank" rel="noreferrer">
          open display ↗
        </a>
      </header>

      <PlayersPanel players={players} config={config} />
      <SettingsPanel config={config} players={players} uid={uid} />
    </div>
  );
}

function teamSize(config, team) {
  return config?.teamSize?.[team] ?? event.defaultTeamSize;
}

function roleLimit(config, role) {
  if (role === 'rachel' || role === 'jordan') return 1;
  if (role === 'friendR') return teamSize(config, 'rachel');
  if (role === 'friendJ') return teamSize(config, 'jordan');
  return Infinity;
}

function PlayersPanel({ players, config }) {
  const list = useMemo(() => playerList(players), [players]);
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('');

  const counts = {};
  ROLE_ORDER.forEach((k) => (counts[k] = 0));
  list.forEach((p) => counts[p.role]++);
  const online = list.filter((p) => p.online).length;

  const assign = (p, role) => {
    const updates = { [`players/${p.uid}/role`]: role };
    // Rachel and Jordan are single-device roles: bump whoever had it back to audience.
    if (role === 'rachel' || role === 'jordan') {
      list.filter((o) => o.role === role && o.uid !== p.uid).forEach((o) => (updates[`players/${o.uid}/role`] = 'audience'));
    }
    act(update(ref(db), updates));
    setOpen(null);
  };

  const shown = filter ? list.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())) : list;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Players</h2>
        <span className="muted">
          {online} online · {list.length} joined
        </span>
      </div>

      <div className="role-counts">
        {ROLE_ORDER.map((k) => {
          const lim = roleLimit(config, k);
          const n = counts[k];
          const bad = lim !== Infinity && n > lim;
          const missing = (k === 'rachel' || k === 'jordan') && n === 0;
          return (
            <span key={k} className={`pill ${bad ? 'warn' : ''} ${missing ? 'dim' : ''}`}>
              {ROLES[k].emoji} {ROLES[k].label} {n}
              {lim !== Infinity ? `/${lim}` : ''}
            </span>
          );
        })}
      </div>

      {list.length > 8 && (
        <input className="small-input" placeholder="Search names…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      )}

      {list.length === 0 && <p className="muted">No one has joined yet. Open /play on a phone.</p>}

      <ul className="player-list">
        {shown.map((p) => (
          <li key={p.uid} className={`player-row ${p.online ? '' : 'offline'}`}>
            <button className="player-main" onClick={() => setOpen(open === p.uid ? null : p.uid)}>
              <span className={`dot ${p.online ? 'on' : ''}`} />
              <span className="player-name">{p.name}</span>
              <span className={`role-tag r-${p.role}`}>
                {ROLES[p.role].emoji} {ROLES[p.role].label}
              </span>
            </button>
            {open === p.uid && (
              <div className="role-picker">
                {ROLE_ORDER.map((k) => {
                  const full = k !== p.role && k.startsWith('friend') && counts[k] >= roleLimit(config, k);
                  return (
                    <button key={k} className={k === p.role ? 'on' : ''} disabled={full} onClick={() => assign(p, k)}>
                      {ROLES[k].emoji} {ROLES[k].label}
                      {full ? ' (full)' : ''}
                    </button>
                  );
                })}
                <button
                  className="danger-outline"
                  onClick={() => {
                    if (confirm(`Remove ${p.name}? (If their phone is still open they will rejoin as audience.)`)) {
                      act(remove(ref(db, `players/${p.uid}`)));
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stepper({ label, value, min = 1, max = 20, onChange }) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="stepper-val">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

function SettingsPanel({ config, players, uid }) {
  const testMode = config?.testMode === true;
  const list = playerList(players);
  const orphanOrOffline = Object.entries(players || {}).filter(([, p]) => !p?.name || !p.online);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Settings</h2>
      </div>

      <label className={`toggle-row ${testMode ? 'is-on' : ''}`}>
        <span>
          <strong>Test mode</strong>
          <br />
          <span className="muted">Shows a role switcher on every phone. Turn OFF before the event.</span>
        </span>
        <input type="checkbox" checked={testMode} onChange={(e) => act(set(ref(db, 'config/testMode'), e.target.checked))} />
      </label>

      <div className="stepper-row">
        {Object.entries(TEAMS).map(([team, t]) => (
          <Stepper
            key={team}
            label={`${t.label} friends`}
            value={teamSize(config, team)}
            onChange={(v) => act(set(ref(db, `config/teamSize/${team}`), v))}
          />
        ))}
      </div>

      <div className="btn-row">
        <button
          className="btn"
          disabled={orphanOrOffline.length === 0}
          onClick={() => {
            const updates = {};
            orphanOrOffline.forEach(([id]) => (updates[`players/${id}`] = null));
            act(update(ref(db), updates));
          }}
        >
          Remove offline players ({orphanOrOffline.length})
        </button>
        <button
          className="btn"
          disabled={list.every((p) => p.role === 'audience')}
          onClick={() => {
            if (!confirm('Set everyone back to Audience?')) return;
            const updates = {};
            list.forEach((p) => (updates[`players/${p.uid}/role`] = 'audience'));
            act(update(ref(db), updates));
          }}
        >
          Everyone → Audience
        </button>
        <button
          className="btn danger"
          onClick={() => {
            if (!confirm('Reset ALL data? Clears players, scores and game progress. Phones that are open will rejoin as Audience.')) return;
            act(update(ref(db), { players: null, game: { mode: 'lobby' }, scores: null }));
          }}
        >
          Reset all data
        </button>
        <button className="btn" onClick={() => remove(ref(db, `hosts/${uid}`))}>
          Log out host
        </button>
      </div>
    </section>
  );
}
