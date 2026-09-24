import { useConnected } from '../lib/hooks';

export function ConnectionBadge() {
  const connected = useConnected();
  if (connected) return null;
  return (
    <div className="conn-badge" role="status">
      <span className="conn-dot" /> reconnecting…
    </div>
  );
}

export function Splash({ text = 'Loading…' }) {
  return (
    <div className="splash">
      <div className="splash-emoji">🫓</div>
      <div className="splash-text">{text}</div>
    </div>
  );
}

export function ConfigMissing() {
  return (
    <div className="splash">
      <div className="splash-emoji">🛠️</div>
      <div className="splash-text">Firebase config missing — paste it into src/firebaseConfig.js</div>
    </div>
  );
}

export function TestModeBadge({ on }) {
  if (!on) return null;
  return <div className="test-badge">TEST MODE</div>;
}
