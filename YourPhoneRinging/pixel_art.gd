extends Node2D
# Procedural pixel-art background, drawn at low resolution and enlarged by the viewport.
var scene_kind = "bathroom"
var pulse = 0.0
func _process(delta: float) -> void:
	pulse += delta
	queue_redraw()
func _draw() -> void:
	var w = 960.0
	var h = 540.0
	draw_rect(Rect2(0, 0, w, h), Color("#0c1015"))
	if scene_kind == "bathroom":
		for y in range(0, 540, 54):
			for x in range(0, 960, 78):
				draw_rect(Rect2(x + (39 if int(y / 54) % 2 == 0 else 0), y, 76, 52), Color("#18242a"))
				draw_line(Vector2(x, y), Vector2(x + 78, y), Color("#344348"), 2)
		draw_rect(Rect2(345, 75, 270, 345), Color("#060a0e"))
		draw_rect(Rect2(365, 95, 230, 305), Color("#22333a"))
		draw_rect(Rect2(386, 115, 188, 245), Color("#0c191e"))
		draw_rect(Rect2(415, 145, 130, 165), Color("#18333b"))
		draw_rect(Rect2(455, 215, 50, 72), Color("#1d292d"))
		draw_rect(Rect2(320, 435, 320, 18), Color("#647373"))
	elif scene_kind == "game" or scene_kind == "items":
		draw_rect(Rect2(0, 280, 960, 260), Color("#302521"))
		for x in range(0, 960, 80):
			draw_line(Vector2(x, 280), Vector2(x - 50, 540), Color("#49322b"), 3)
		draw_rect(Rect2(180, 45, 600, 190), Color("#11191c"))
		draw_rect(Rect2(195, 60, 570, 160), Color("#223039"))
		draw_circle(Vector2(480, 140), 73, Color("#111416"))
		draw_rect(Rect2(445, 113, 70, 12), Color("#b2d1c6"))
		draw_rect(Rect2(445, 155, 70, 12), Color("#b2d1c6"))
		draw_rect(Rect2(540, 125, 12, 30), Color("#b2d1c6"))
		for i in 6:
			var xx = 260 + i * 78
			draw_rect(Rect2(xx, 330, 48, 76), Color("#0a1015"))
			draw_rect(Rect2(xx + 5, 338, 38, 58), Color("#3d5962"))
			draw_rect(Rect2(xx + 18, 399, 12, 3), Color("#c2d6d6"))
		draw_rect(Rect2(130, 448, 700, 25), Color("#604138"))
		for i in 4:
			draw_line(Vector2(85 + i * 15, 20), Vector2(100 + i * 15, 180), Color("#b24b43"), 3)
	elif scene_kind == "ending":
		draw_rect(Rect2(0, 270, 960, 270), Color("#151b25"))
		draw_rect(Rect2(110, 90, 740, 240), Color("#090d14"))
		draw_rect(Rect2(135, 110, 690, 195), Color("#26313f"))
		for i in 13:
			draw_rect(Rect2(i * 80, 190 + (i % 3) * 35, 24, 55), Color("#6d364b"))
		draw_rect(Rect2(230, 330, 500, 160), Color("#2e2630"))
		draw_rect(Rect2(380, 345, 210, 110), Color("#655446"))
	else:
		draw_rect(Rect2(150, 70, 660, 405), Color("#29251f"))
		draw_rect(Rect2(165, 80, 630, 385), Color("#d4c5a3"))
		for i in 11:
			draw_line(Vector2(215, 120 + i * 26), Vector2(740, 120 + i * 26), Color("#a79778"), 2)
