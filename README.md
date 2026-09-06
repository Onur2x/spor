# FitPro ELITE v4

v4 adds the deterministic Coach Engine on top of v3.

## New
- Readiness-aware training recommendation
- Weekly volume by muscle group
- Volume trend analysis
- Average RIR analysis
- Fatigue signal
- Deload signal
- Recovery-aware next-set load adjustment
- Coach decision card on workout screen
- Weekly muscle volume card on progress screen

## Important
This is decision-support logic, not medical advice. Deload/recovery signals are heuristic and should be treated as recommendations.

## Setup
1. Run `supabase_schema.sql` in Supabase SQL Editor.
2. Open `index.html` through a local web server (recommended: VS Code Live Server).
3. Log in and complete the profile.
4. Record sets with kg, reps and RIR.
5. Check the Coach Engine card before each workout.
