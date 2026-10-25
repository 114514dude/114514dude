# 钢铁前线 3D · 公开试玩（三款独立车型 GLB）

**本版只开放三款真实车型模型，不使用通用坦克模型冒充其余车型。** 数据和物理为简化原型，10v10 AI 单机遭遇战。

车型模型经原创作者标注 CC0：
- T-34/85：Lotnik，https://opengameart.org/content/t-3485
- Panzer III：konserwa，https://opengameart.org/content/panzerkampfwagen-iii
- Abrams (Freeciv)：Sketlux / yd，https://opengameart.org/content/abrams-tank

第三款是 Abrams 的 Freeciv 改型，**不是现代 M1A2**。所以不能用它代替甲类房 M1A2。

GitHub Actions 直接下载这三份源作者的 Blender 模型、转成 GLB、进行 GLB 网格检查，打包到 APK 并自动发布至此分支根目录的 `ArmorFront-Demo.apk`。此版本不包含战雷或装甲纷争提取资产。模型许可为 CC0-1.0。

安卓端使用 Android WebView；华为 nova 12 / HarmonyOS 4.2 可尝试安装但尚未实机验证。此版是 **Debug 测试包**，不是正式发行签名包；Three.js 模块仍依赖 CDN，进入游戏需要网络连接。

**下载：** [ArmorFront-Demo.apk](../ArmorFront-Demo.apk)，或从该分支的 GitHub Actions 构建页面取得 Artifact。公开分支不修改该仓库 main 分支。
