import { useEffect, useMemo, useState } from 'react';
import { useAuthUser, useDbValue } from '../lib/hooks';
import { J, R, TEAMS, playerList } from '../lib/roles';
import event from '../data/event.json';
import { ConnectionBadge, Splash, TestModeBadge } from '../components/Common';
import QRCode from '../components/QRCode';

export default function Display() {
  const { user } = useAuthUser();
  useWakeLock();
  if (!user) return <Splash text="Loading…" />;
  return <DisplayInner />;
}

// Keep the TV/projector awake. Re-requested whenever the tab becomes visible again.
function useWakeLock() {
  useEffect(() => {
    let lock = null;
    const request = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          lock = await navigator.wakeLock.request('screen');
        }
      } catch {
        /* not supported or denied; nothing else to do */
      }
    };
    request();
    const onVis = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVis);
    // Some browsers only grant it after a user gesture.
    document.addEventListener('click', request);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('click', request);
      lock?.release().catch(() => {});
    };
  }, []);
}

function FullscreenButton() {
  const [isFs, setIsFs] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  if (isFs || !document.documentElement.requestFullscreen) return null;
  return (
    <button className="fs-btn" onClick={() => document.documentElement.requestFullscreen().catch(() => {})}>
      ⛶ Full screen
    </button>
  );
}

function DisplayInner() {
  const players = useDbValue('players');
  const config = useDbValue('config');
  const game = useDbValue('game');

  if (players === undefined || config === undefined || game === undefined) return <Splash text="Loading…" />;

  return (
    <div className="display">
      <ConnectionBadge />
      <TestModeBadge on={config?.testMode === true} />
      <FullscreenButton />
      <Leaves />
      <Lobby players={players} config={config} />
    </div>
  );
}

function Leaves() {
  return (
    <div className="leaves" aria-hidden>
      <span className="leaf l1">🌿</span>
      <span className="leaf l2">🍃</span>
      <span className="leaf l3">🌿</span>
      <span className="leaf l4">🍃</span>
    </div>
  );
}

function Lobby({ players, config }) {
  const list = useMemo(() => playerList(players), [players]);
  const playUrl = `${window.location.origin}/play`;
  const shortUrl = playUrl.replace(/^https?:\/\//, '');
  const online = list.filter((p) => p.online);

  return (
    <div className="lobby">
      <header className="d-header">
        <div className="d-kicker">The afterparty games</div>
        <h1 className="d-title">
          {R} <span className="tortilla">🫓</span> {J}
        </h1>
      </header>

      <div className="lobby-grid">
        <div className="qr-card">
          <QRCode className="qr-img" value={playUrl} />
          <div className="qr-cta">Scan to play!</div>
          <div className="qr-url">{shortUrl}</div>
          <div className="qr-count">
            <strong>{online.length}</strong> {online.length === 1 ? 'player' : 'players'} here
          </div>
        </div>

        <div className="lobby-teams">
          <div className="team-row">
            {Object.entries(TEAMS).map(([team, t]) => (
              <TeamCard key={team} team={team} t={t} list={list} size={config?.teamSize?.[team] ?? event.defaultTeamSize} />
            ))}
          </div>
          <AudienceCloud list={list.filter((p) => p.role === 'audience')} />
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, t, list, size }) {
  const couple = list.find((p) => p.role === t.couple);
  const friends = list.filter((p) => p.role === t.friend);
  const slots = Math.max(size, friends.length);
  return (
    <div className={`team-card team-${team}`}>
      <div className="team-name">{t.label}</div>
      <div className={`couple-slot ${couple ? 'filled' : ''} ${couple && !couple.online ? 'offline' : ''}`}>
        {team === 'rachel' ? '👰' : '🤵'} {couple ? couple.name : `${team === 'rachel' ? R : J}?`}
      </div>
      <div className="friend-slots">
        {Array.from({ length: slots }).map((_, i) => {
          const f = friends[i];
          return (
            <div key={f ? f.uid : `empty-${i}`} className={`friend-slot ${f ? 'filled' : ''} ${f && !f.online ? 'offline' : ''}`}>
              {f ? f.name : '·'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AudienceCloud({ list }) {
  return (
    <div className="audience-card">
      <div className="audience-head">🎉 Audience · {list.length}</div>
      <div className="audience-chips">
        {list.length === 0 && <span className="muted">Scan the code to join!</span>}
        {list.map((p) => (
          <span key={p.uid} className={`chip ${p.online ? '' : 'offline'}`}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}
