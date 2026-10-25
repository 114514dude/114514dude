# 钢铁前线 ArmorFront v0.7 – 开场修复及三地图版本

已修复导致点击“部署进入战场”无效的未定义 external 变量、手机启动页触摸滚动及车型 GLB 加载失败反馈。加入真实 GLB 加载检查。
地图一/二仍为不同随机种子的程序掩体场景。地图三为砂岩丘陵，包含来自 Alexmax 的 CC0 低多边形地形远景：https://opengameart.org/content/low-poly-terrain ，战斗区域的地面碰撞仍为简化平面。
公开版真正内置 T-34-85、Panzer III（玩法按 J1）和 Abrams (Freeciv 概念版) 三款 CC0 独立模型。其他 45 个载具暂无各自授权 GLB，仍不开放，不能称作48车完整移植。
T-34-85与Pz.III J1的引擎、推重比、最大速度（含倒车）、炮塔转速、高低机速率和俯仰限制使用《战争雷霆》公开 Wiki RB 基础数据；Freeciv Abrams 为游戏估算。固定炮位射界限制已有底层支持但未实装可选固定炮位车型。不同车辆的 GLB 模型节点未必具有可识别炮塔/履带名称，动画未完成模型级绑定验证。
独立的空间破片和超压模拟仍为近似物理，并非Gaijin私有引擎。APK仍需网络加载Three.js和部分音效，需华为手机实机验证。
公开包：https://github.com/114514dude/114514dude/raw/refs/heads/armor-front-public-demo/ArmorFront-Demo.apk
