import { useEffect, useState } from 'react';
import { ref, serverTimestamp, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthUser, useDbValue } from '../lib/hooks';
import { startPresence } from '../lib/presence';
import { J, R, ROLES, ROLE_ORDER, roleOf } from '../lib/roles';
import { ConnectionBadge, Splash } from '../components/Common';

const NAME_KEY = 'rj_party_name';

function loadName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}
function saveName(name) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* private mode: name just won't be remembered */
  }
}

export default function Play() {
  const { user } = useAuthUser();
  if (!user) return <Splash text="Joining the party…" />;
  return <PlayInner uid={user.uid} />;
}

function PlayInner({ uid }) {
  const [name, setName] = useState(loadName);
  const [editing, setEditing] = useState(!loadName());
  const me = useDbValue(`players/${uid}`);
  const config = useDbValue('config');

  // Register (or re-register after a host reset) whenever we have a saved name
  // but the database record is missing it.
  useEffect(() => {
    if (!name || editing || me === undefined) return;
    if (!me || me.name !== name) {
      const patch = { name };
      if (!me || !me.joinedAt) patch.joinedAt = serverTimestamp();
      update(ref(db, `players/${uid}`), patch).catch((e) => console.warn(e));
    }
  }, [name, editing, me, uid]);

  useEffect(() => (name && !editing ? startPresence(uid) : undefined), [name, editing, uid]);

  if (editing) {
    return (
      <NameEntry
        initial={name}
        onSubmit={(n) => {
          saveName(n);
          setName(n);
          setEditing(false);
        }}
      />
    );
  }

  if (me === undefined || config === undefined) return <Splash text="Joining the party…" />;

  const role = roleOf(me);
  const testMode = config?.testMode === true;

  return (
    <div className={`play play-${role}`}>
      <ConnectionBadge />
      <header className="play-top">
        <span className="play-name">{name}</span>
        <button className="link-btn" onClick={() => setEditing(true)}>
          change name
        </button>
      </header>

      <main className="play-main">
        <LobbyScreen role={role} />
      </main>

      {testMode && <RoleSwitcher uid={uid} role={role} />}
    </div>
  );
}

function NameEntry({ initial, onSubmit }) {
  const [value, setValue] = useState(initial || '');
  const clean = value.replace(/\s+/g, ' ').trim().slice(0, 20);
  return (
    <div className="play play-join">
      <ConnectionBadge />
      <form
        className="join-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean) onSubmit(clean);
        }}
      >
        <div className="join-emoji">🫓</div>
        <h1 className="join-title">
          {R} <span className="amp">&</span> {J}
        </h1>
        <p className="join-sub">Party games! What should we call you?</p>
        <input
          className="big-input"
          autoFocus
          maxLength={20}
          placeholder="Your name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          enterKeyHint="go"
        />
        <button className="big-btn coral" disabled={!clean}>
          Join the party
        </button>
      </form>
    </div>
  );
}

function LobbyScreen({ role }) {
  const r = ROLES[role];
  return (
    <div className="role-card">
      <div className="role-emoji">{r.emoji}</div>
      <div className="role-title">{r.youAre}</div>
      <div className="role-sub">{r.sub}</div>
      <div className="role-wait">Eyes on the big screen 👀</div>
    </div>
  );
}

function RoleSwitcher({ uid, role }) {
  return (
    <div className="role-switcher">
      <div className="role-switcher-label">🧪 Test mode · be:</div>
      <div className="role-switcher-btns">
        {ROLE_ORDER.map((k) => (
          <button
            key={k}
            className={k === role ? 'on' : ''}
            onClick={() => update(ref(db, `players/${uid}`), { role: k }).catch((e) => console.warn(e))}
          >
            {ROLES[k].emoji} {ROLES[k].label}
          </button>
        ))}
      </div>
    </div>
  );
}
