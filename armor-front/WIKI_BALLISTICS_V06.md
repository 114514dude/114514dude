# v0.6 ammunition and damage revision

- T-34-85: official Wiki [vehicle](https://wiki.warthunder.com/unit/ussr_t_34_85_zis_53), hull 45/45/45, turret 90/75/52 mm. BR-365K APHE, BR-365 APHEBC, BR-365P APCR and O-365K HE each have six individual penetration values from the wiki.
- Panzer III: modeled specifically as [J1](https://wiki.warthunder.com/unit/germ_pzkpfw_III_ausf_J_td), not all Pz III variants. Hull 53/30/53, turret 50/30/30 mm. PzGr 39 APC, PzGr 40 and 40/1 APCR, Sprgr 38 HE.
- Freeciv Abrams is NOT a War Thunder tank. All numerical gun and armor values are fictional placeholders and labeled so.

Mechanics: independent shell-specific interpolation, separate turret/hull plate zones, simplified plate-angle correction, ray/cone proximity tests against model-agnostic virtual modules, reduced firing effectiveness from module wounds, crew/ammunition-rack-based kills and limited HE overpressure requiring a breach and internal module hit.

**Limits:** This is NOT War Thunder's proprietary or exact engine. The Wiki lists summarized armor, not full per-triangle collision meshes. Roof armor values, geometric slope, virtual internal module coordinates, explosive burst cone/damage and fragment counts are approximations. Explosive TNT filler amounts are not yet verified: APHE never receives the >=170 g overpressure bonus unless verified values are added. GLB geometry is visual only and not yet automatically mapped to the collision volume. No claim of 1:1 physical authenticity or full 48-vehicle wiki tuning. Android device testing outstanding.

To test: `node --test tests/ballistics.test.mjs`.
