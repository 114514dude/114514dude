# Your Phone Ringing — Lite

A standalone, illustrated Android game intended to fit below **3,000,000 bytes**.

This is a **lightweight native WebView port**, not a recompressed Godot APK. It retains the original game concept and original eight SVG illustrations copied from `../YourPhoneRinging/art/` during GitHub Actions. The Java shell has no external app libraries; the HTML game is offline and does not request Internet permission.

Build: GitHub Actions → **Build Your Phone Ringing Lite APK** → Artifacts. The workflow fails automatically if the APK exceeds 3,000,000 bytes.

Caveat: this is an independently implemented lite adaptation; it does not reproduce all Godot transitions and effects, and still requires real-device testing.
