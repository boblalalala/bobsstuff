import event from '../data/event.json';

export const R = event.rachel;
export const J = event.jordan;

export const ROLE_ORDER = ['rachel', 'jordan', 'friendR', 'friendJ', 'audience'];

export const ROLES = {
  rachel: { label: R, team: 'rachel', emoji: '👰', youAre: `You're ${R}! 💍`, sub: `Get ready to slap (or be slapped) 🫓` },
  jordan: { label: J, team: 'jordan', emoji: '🤵', youAre: `You're ${J}! 💍`, sub: `Get ready to slap (or be slapped) 🫓` },
  friendR: { label: `${R}'s Friend`, team: 'rachel', emoji: '🌸', youAre: `You're on Team ${R}!`, sub: `You'll be on the buzzer` },
  friendJ: { label: `${J}'s Friend`, team: 'jordan', emoji: '🌿', youAre: `You're on Team ${J}!`, sub: `You'll be on the buzzer` },
  audience: { label: 'Audience', team: null, emoji: '🎉', youAre: `You're in the Audience!`, sub: `You'll vote on predictions` },
};

export const TEAMS = {
  rachel: { label: `Team ${R}`, couple: 'rachel', friend: 'friendR' },
  jordan: { label: `Team ${J}`, couple: 'jordan', friend: 'friendJ' },
};

export function roleOf(player) {
  return (player && ROLES[player.role] && player.role) || 'audience';
}

// Players with a name, sorted by join time, as [{uid, ...}].
export function playerList(players) {
  return Object.entries(players || {})
    .filter(([, p]) => p && p.name)
    .map(([uid, p]) => ({ uid, ...p, role: roleOf(p) }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
}
