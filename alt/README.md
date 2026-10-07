# ALT app prototype

Clickable front-end prototype of the ALT hiking club app. It runs from one file (`index.html`) with example data. There is no backend and no login yet. Open it in a browser to try it. It loads d3 from cdnjs for the maps.

Tabs:
- **Home**: a social feed in the style of Strava. It shows hikes, trip sign-ups and session RSVPs from people you follow, with kudos, plus "Find friends", a "Next up" card and a map widget. The bell shows notifications. Leaders also get a "Needs your attention" card.
- **Explore map** (opened from the home widget): switch between a globe and a flat map, both of which pan and zoom. You can show everyone's recent hikes or only your own. Tap a pin to see who hiked there.
- **Trips**: a month calendar of trips and weekly training and skills sessions. You can filter it, RSVP to sessions, and check in (simulated).
- **Log (+)**: add a journey with photos. It goes into your journal, onto your map and into your friends' feeds.
- **Trails**: the ALT grade scale (G1–G5), elevation profiles and a breakdown of how each grade is scored.
- **Profile**: profile photo, credits, bio, dream mountain, next goal, upcoming plans, the journal (with photos and "Show on map"), and missions and rewards for earning and spending credits.

Trip pages run the readiness check. You can join if you finish the prep sessions or have a verified climb at the same grade or harder. Everyone attends the briefing.

Use the "Viewing as" switcher (Mei = beginner, Jun = experienced, Sarah = trip leader), the demo tour, and "Simulate a friend's activity" to see a push notification. Changes and photos are saved in the browser until you press "Reset demo".

The map data comes from Natural Earth (public domain) via the `world-atlas` package and is built into the page.
