# ALT app prototype

Clickable front-end prototype of the ALT hiking club app. It runs from one file (`index.html`) with example data. There is no backend and no login yet. Open it in a browser to try it. It loads d3 from cdnjs for the maps.

Tabs:
- **Search**: the magnifier on Home opens a search across trips, hikes and places, training and skills, and people. It matches names, regions and countries, so "Malaysia" or "Japan" finds the hikes there. The Trips tab has its own search bar for trips, hikes and sessions.
- **Home**: a social feed in the style of Strava. It shows hikes, trip sign-ups and session RSVPs from people you follow, with kudos, plus "Find friends", a "Next up" card and a map widget. The bell shows notifications. Leaders also get a "Needs your attention" card.
- **Explore map** (opened from the home widget): switch between a globe and a flat map, both of which pan and zoom. Tabs show your friends' hikes, the ALT community's hikes, or only your own. Singapore practice hikes are left off. Tap a pin for a preview, then open the place page for journals, ratings and the next ALT trip or an interest check.
- **Trips** has three views.
  - **Discover**: shelves that mix trips, training and skills. "Ready for you" shows what the member can do now, "Level up" shows harder trips with what is missing plus places the community has hiked that ALT doesn't run yet (with an interest check), and "This week" and "Friends are going" keep the weekly sessions close. "See all" and the Browse tiles open a full list with search, sort (soonest, friends going, most spots left) and filters (grade, when, where, readiness, friends going, beginner friendly).
  - **Calendar**: a week planner with a week strip, filter chips and a day-by-day list, with a Month switch for the full grid.
  - **My plan**: the member's joined trips and RSVPs, plus a prep roadmap for the trip they pick. Each step shows the next date with RSVP, "more dates" for other weeks, and one tap adds all suggested dates. The same roadmap is the "Prep plan" tab on every trip page.
- **Log (+)**: add a journey with photos. It goes into your journal, onto your map and into your friends' feeds.
- **Gear** replaces the Trails tab. **Browse** lists gear members lend for free or rent per day, with the community's rating on each item and a request form. **Reviews** ranks every product by what members say, with a rating breakdown, "would recommend" percentage and what could be better. **Requests** handles approvals, a handover checklist and returns, and lists the member's own listings. Members can list their own gear from here.
- **Trail library** (grades, elevation, how each grade is scored) now lives under Trips, in Discover.
- **Profile**: profile photo, credits, bio, dream mountain, next goal, upcoming plans, the journal (with photos and "Show on map"), and missions and rewards for earning and spending credits. It also has a **Gear I use** section where members add gear, rate it out of 5, say whether they like it and what could be better. Those reviews feed the community ratings in the Gear tab.

Trip pages run the readiness check. You can join if you finish the prep sessions or have a verified climb at the same grade or harder. Everyone attends the briefing.

Use the "Viewing as" switcher (Mei = beginner, Jun = experienced, Sarah = trip leader), the demo tour, and "Simulate a friend's activity" to see a push notification. Changes and photos are saved in the browser until you press "Reset demo".

The map data comes from Natural Earth (public domain) via the `world-atlas` package and is built into the page.
