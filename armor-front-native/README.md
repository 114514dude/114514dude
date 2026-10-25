# Armor Front Native (Godot 4.5.1)
This is an independent native Android 3D engine prototype using Godot, **not** a port of War Thunder or the finished 48 vehicle roster.
- Three authentic CC0 model sources, taken from prior public prototype: T34/85 (Lotnik), Pz III (konserwa), Abrams Freeciv (Sketlux/yd). Terrain (Alexmax) CC0.
- The preview is entirely offline and contains no Android WebView or jsDelivr.
- Simple 10v10 AI, touch control, gun and HP approximation, 3 map selector choices. Real per-plate armor, X-ray crew ray traversal, turret-and-track skeleton rigs, realistic trajectory tables and 45 other models are NOT yet implemented.
- This GitHub Actions build uses official Godot Android export templates. The APK will be much larger than the previous ~600 KB WebView wrapper.
- Source script is stored as zlib base64 because the one-off build step reconstructs main.gd. See build workflow.
