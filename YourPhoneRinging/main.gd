extends Control

const BG = Color("#0b0e10")
const FG = Color("#d4d6c7")
const RED = Color("#dc6e6e")
const GREEN = Color("#a7c99b")
var rng = RandomNumberGenerator.new()
var root: VBoxContainer
var scene_image: TextureRect
var scene_tint: ColorRect
var hero_image: TextureRect
var enemy_hurt = false
var note: Label
var life: Label
var buttons: HFlowContainer
var name_edit: LineEdit
var player_name = "PLAYER"
var mode_endless = false
var stage = "bathroom"
var hp = [4, 4]
var ammo: Array[int] = []
var live_count = 0
var blank_count = 0
var player_score = 0
var enemy_score = 0
var match_round = 1
var double_damage = false
var enemy_skip = false
var peeked = -1
var item_stock = [1, 1, 1, 1, 1, 1]
var used_items = 0
var thrown = 0
var streak = 0
var is_busy = false

func _ready() -> void:
	rng.randomize()
	var backdrop = ColorRect.new()
	backdrop.color = BG
	backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(backdrop)
	scene_image = TextureRect.new()
	scene_image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scene_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	scene_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	scene_image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(scene_image)
	scene_tint = ColorRect.new()
	scene_tint.color = Color(0.025, 0.035, 0.045, 0.38)
	scene_tint.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scene_tint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(scene_tint)
	root = VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.offset_left = 22
	root.offset_right = -22
	root.offset_top = 12
	root.offset_bottom = -12
	root.add_theme_constant_override("separation", 6)
	add_child(root)
	show_bathroom()

func show_art(which: String) -> void:
	var path = "res://art/" + which + ".svg"
	if ResourceLoader.exists(path):
		scene_image.texture = load(path)


func reset_view(title: String) -> void:
	for child in root.get_children():
		root.remove_child(child)
		child.queue_free()
	show_art("bathroom" if stage == "bathroom" else ("paper" if stage == "contract" or stage == "interlude" else ("car" if stage == "ending" else "table")))
	var heading = Label.new()
	heading.text = title
	heading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	heading.add_theme_font_size_override("font_size", 31)
	heading.add_theme_color_override("font_color", GREEN)
	heading.add_theme_color_override("font_shadow_color", Color.BLACK)
	heading.add_theme_constant_override("shadow_offset_x", 2)
	heading.add_theme_constant_override("shadow_offset_y", 3)
	root.add_child(heading)
	if stage == "game":
		var portrait_box = CenterContainer.new()
		portrait_box.custom_minimum_size = Vector2(0, 140)
		root.add_child(portrait_box)
		hero_image = TextureRect.new()
		hero_image.custom_minimum_size = Vector2(174, 139)
		hero_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		hero_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		hero_image.texture = load("res://art/face_hurt.svg" if enemy_hurt else "res://art/face.svg")
		portrait_box.add_child(hero_image)

	note = Label.new()
	note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	note.add_theme_font_size_override("font_size", 19)
	note.add_theme_color_override("font_color", FG)
	note.add_theme_color_override("font_shadow_color", Color.BLACK)
	note.add_theme_constant_override("shadow_offset_x", 2)
	root.add_child(note)
	life = Label.new()
	life.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	life.add_theme_font_size_override("font_size", 22)
	life.add_theme_color_override("font_color", RED)
	life.add_theme_color_override("font_shadow_color", Color.BLACK)
	root.add_child(life)
	buttons = HFlowContainer.new()
	buttons.alignment = FlowContainer.ALIGNMENT_CENTER
	root.add_child(buttons)

func add_button(title: String, callback: Callable) -> void:
	var b = Button.new()
	b.text = title
	b.custom_minimum_size = Vector2(165, 50)
	b.add_theme_font_size_override("font_size", 17)
	b.add_theme_color_override("font_color", Color("#e7d8c1"))
	b.add_theme_color_override("font_hover_color", Color("#f5efb0"))
	b.pressed.connect(callback)
	buttons.add_child(b)

func show_bathroom() -> void:
	stage = "bathroom"
	reset_view("YOUR PHONE RINGING")
	note.text = "污浊的洗手间。门外传来金属敲击声。\n镜子里只剩下你和一只不断震动的手机。"
	add_button("踢开门 · 标准模式", func(): mode_endless = false; show_contract())
	add_button("吞下神秘药片 · 无尽模式", func(): mode_endless = true; show_contract())

func show_contract() -> void:
	stage = "contract"
	reset_view("生 死 状")
	note.text = "在纸上写下你的名字。签署后，无法撤回。"
	name_edit = LineEdit.new()
	name_edit.placeholder_text = "YOUR NAME"
	name_edit.max_length = 18
	name_edit.custom_minimum_size = Vector2(250, 45)
	root.add_child(name_edit)
	add_button("签署 / 撕毁纸张", func(): sign_contract())

func sign_contract() -> void:
	if is_instance_valid(name_edit):
		player_name = name_edit.text.strip_edges()
	if player_name.is_empty():
		player_name = "UNKNOWN"
	player_score = 0
	enemy_score = 0
	match_round = 1
	streak = 0
	start_round()

func start_round() -> void:
	stage = "game"
	hp = [3 + match_round, 3 + match_round]
	double_damage = false
	enemy_skip = false
	peeked = -1
	item_stock = [1, 1, 1, 1, 1, 1]
	enemy_hurt = false
	refill_box("你听见盒盖被缓缓推开。")

func refill_box(message: String) -> void:
	ammo.clear()
	var count = mini(4 + match_round, 8)
	live_count = rng.randi_range(1, count - 1)
	blank_count = count - live_count
	for i in count:
		ammo.append(1 if i < live_count else 0)
	ammo.shuffle()
	render_game(message)

func render_game(message: String) -> void:
	if stage != "game":
		return
	reset_view("YOUR PHONE RINGING  ·  ROUND " + str(match_round))
	var symbol = "＝）" if hp[1] > 1 else "＝（"
	note.text = "冯萍  " + symbol + "\n" + message + "\n盒中剩余：" + str(ammo.size()) + "部手机  |  初始真机：" + str(live_count) + "  假机：" + str(blank_count)
	life.text = player_name + "  [" + bars(hp[0]) + "]  VS  冯萍 [" + bars(hp[1]) + "]\n比分 " + str(player_score) + " : " + str(enemy_score)
	if ammo.is_empty():
		add_button("打开下一盒", func(): refill_box("新的手机已经放入盒中。"))
		return
	add_button("向冯萍投掷", func(): player_throw(false))
	add_button("桌面刀测", func(): player_throw(true))
	add_button("使用道具", func(): show_items())
	add_button("查看规则", func(): render_game("真机造成伤害；假机无伤害。桌面刀测不会伤害对手。"))

func bars(amount: int) -> String:
	var s = ""
	for i in maxi(amount, 0):
		s += "▮"
	return s if not s.is_empty() else "断线"

func player_throw(test_only: bool) -> void:
	if stage != "game" or ammo.is_empty() or is_busy:
		return
	var real = ammo.pop_front()
	thrown += 1
	if test_only:
		render_game("你在桌面刺穿手机：" + ("轰！真机爆出电火花。" if real == 1 else "只有空壳。"))
		enemy_turn()
		return
	var damage = 2 if double_damage else 1
	double_damage = false
	enemy_hurt = real == 1
	if real == 1:
		hp[1] -= damage
	if check_end():
		return
	render_game("你扔出一部手机。" + ("冯萍受击！" if real == 1 else "是假机。冯萍没有受伤。"))
	enemy_turn()

func enemy_turn() -> void:
	if stage != "game":
		return
	if enemy_skip:
		enemy_skip = false
		render_game("胶带封住了冯萍的手，她跳过本回合。")
		return
	if ammo.is_empty():
		render_game("盒子已经空了。")
		return
	var real = ammo.pop_front()
	if real == 1:
		hp[0] -= 1
	if check_end():
		return
	render_game("冯萍将手机砸向你。" + ("电光炸开！生命线被剪断。" if real == 1 else "虚惊一场。"))

func check_end() -> bool:
	if hp[0] > 0 and hp[1] > 0:
		return false
	if hp[1] <= 0:
		player_score += 1
		streak += 1
	else:
		enemy_score += 1
		streak = 0
	if mode_endless:
		match_round += 1
		start_round()
		return true
	if player_score >= 2 or enemy_score >= 2:
		show_ending(player_score >= 2)
		return true
	match_round += 1
	show_interlude()
	return true

func show_interlude() -> void:
	stage = "interlude"
	reset_view("第 " + str(match_round) + " 局")
	note.text = "处分通告：有人擅自修改高塔内的朗读装置。\n这只是游戏世界中的虚构档案。"
	life.text = "比分 " + str(player_score) + " : " + str(enemy_score)
	add_button("继续游戏", func(): start_round())

func show_items() -> void:
	reset_view("道 具 箱")
	show_art("items")
	note.text = "每种道具每局一次。"
	life.text = "当前生命：" + str(hp[0]) + "  对手生命：" + str(hp[1])
	var labels = ["绿茶：恢复1生命", "白手套：查看真伪", "充电宝：下次双倍伤害", "胶带：对手跳过回合", "盒饭：随机生命变化", "第三只手：丢弃当前手机"]
	for i in labels.size():
		var index = i
		if item_stock[i] > 0:
			add_button(labels[i], func(): use_item(index))
	add_button("返回桌面", func(): render_game("你合上了道具箱。"))

func use_item(index: int) -> void:
	if stage != "game" or item_stock[index] <= 0:
		return
	item_stock[index] = 0
	used_items += 1
	var message = ""
	match index:
		0:
			hp[0] += 1
			message = "绿茶使生命维持装置重新亮起一格。"
		1:
			if not ammo.is_empty():
				peeked = ammo[0]
			message = "白手套检查手机：" + ("66:6 PM · 真机" if peeked == 1 else "黑屏 · 假机")
		2:
			double_damage = true
			message = "充电宝接通：下次真机造成双倍伤害。"
		3:
			enemy_skip = true
			message = "胶带封住了对手的手腕。"
		4:
			var change = 1 if rng.randf() > 0.5 else -1
			hp[0] += change
			message = "盒饭：" + ("恢复一格生命。" if change > 0 else "损失一格生命。")
		5:
			if not ammo.is_empty():
				ammo.pop_front()
			message = "第三只手将一部手机扔进垃圾桶。"
	if check_end():
		return
	render_game(message)

func show_ending(victory: bool) -> void:
	stage = "ending"
	reset_view("VICTORY" if victory else "GAME OVER")
	note.text = "汽车后座上放着剩余的手机箱与入鞘的刀。\n车窗外，城市的霓虹正在远去。" if victory else "最后一根生命线断开，房间陷入黑暗。"
	life.text = "最终比分 " + str(player_score) + " : " + str(enemy_score) + "  |  投掷 " + str(thrown) + "  |  道具 " + str(used_items)
	add_button("重新开始", func(): show_bathroom())
