# ALT app prototype

Clickable front-end prototype of the ALT hiking club app. Everything runs in one file (`index.html`) with example data, with no backend and no logins. Open it in a browser to try it.

What's in this first build:
- **Home**: your trips, upcoming sessions, Everest Ladder progress. Trip leaders also get a "Needs your attention" list.
- **Train**: weekly prep sessions (physical and skills). RSVP, then check in (simulated QR scan).
- **Trips**: the readiness check. You can join if you finish the prep sessions (path A) or have a verified climb at the same grade or harder (path B), and everyone attends the briefing. Leaders see a roster and can approve people anyway.
- **Trails**: the ALT grade scale (G1–G5), elevation profiles and a breakdown of how each grade is scored.
- **Map**: personal hiking journal and map, a community map, and "Log a climb". Self-logged climbs wait for a leader to verify them.
- **Profile**: stats, milestones and the rewards they unlock, plus leader certifications.

Use the "Viewing as" switcher (Mei = beginner, Jun = experienced, Sarah = trip leader) and the demo tour on the left. Reload to reset.

The map coastlines come from Natural Earth (public domain) via the `world-atlas` package. They are baked into the page.
