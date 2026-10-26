# 治理者之路 · 部署与自动更新

## 一、当前线上地址

```
https://rkxuii.kicp.fun
```

这是**花生壳 Drop** 部署的临时地址。特点：
- ✅ 立刻可用，手机也能打开
- ❌ 每次改代码都要重新打包、重新上传
- ❌ 网址可能变化

---

## 二、想要「改代码自动更新」→ 用 GitHub Pages

### 第一步：注册 GitHub（只需邮箱）

1. 打开 https://github.com/signup
2. 填邮箱、密码、用户名
3. 收邮件点验证链接
4. 完成

### 第二步：建立仓库

1. 打开 https://github.com/new
2. **Repository name** 填：`governance-road`
3. 选 **Public**（私有仓库的 Pages 要付费）
4. 点 **Create repository**

### 第三步：上传文件

在仓库页面：

1. 点 **Add file** → **Upload files**
2. 把这个文件夹里的所有文件拖进去：
   ```
   C:\Users\Lenovo\Documents\deepseek-harness\default-workspace\gh-pages\
   ```
   包含：
   - `index.html`（主游戏）
   - `governance-top.html`（省委书记演示版）
   - `governance-disc.html`（立案审查演示版）
   - `menu.html`（选单页）
   - `README.md`（说明）
3. 点 **Commit changes**

### 第四步：开启 Pages

1. 仓库页点 **Settings**（顶部菜单）
2. 左侧找到 **Pages**
3. **Source** 选 `Deploy from a branch`
4. **Branch** 选 `main`，目录选 `/ (root)`
5. 点 **Save**
6. 等 1~2 分钟

### 第五步：拿到网址

刷新 Pages 设置页，顶部会出现：

```
Your site is live at https://你的用户名.github.io/governance-road/
```

**这就是永久网址。**

---

## 三、以后怎么更新

### 方式 A：网页上传（简单）

1. 打开仓库
2. 点 `index.html`
3. 右上角铅笔图标 ✏️ → 编辑
4. 或者 **Add file → Upload files** 覆盖旧文件
5. **Commit changes**
6. 等 30 秒 → 网站自动更新

### 方式 B：本地推送（需装 git）

```bash
git clone https://github.com/你的用户名/governance-road.git
cd governance-road
# 把新的 index.html 复制进来
git add .
git commit -m "更新游戏"
git push
```

30 秒后网站自动更新。

### 方式 C：GitHub Desktop（图形化，推荐新手）

1. 下载 https://desktop.github.com
2. 登录 GitHub 账号
3. Clone 仓库
4. 把新文件拖进文件夹
5. 点 **Commit to main** → **Push origin**

---

## 四、本地开发与打包

### 修改代码

源码在：
```
C:\Users\Lenovo\Documents\deepseek-harness\default-workspace\fy-site\
```

主要文件：
| 文件 | 作用 |
|---|---|
| `game.html` | 页面骨架 + CSS |
| `fy-game.js` | 主逻辑（最大，100KB+） |
| `fy-people.js` | 人物关系、用人权 |
| `fy-org2.js` | 组织架构 |
| `fy-rankv.js` | 排行榜 |
| `fy-person.js` | 人物档案卡 + 履历 |
| `fy-auth.js` | 登录/注册/激活码 |
| `fy-tutor.js` | 教程页 |
| `fy-cdata.js` | 真实城市数据 |
| `data/*.js` | 中国行政区划数据 |
| `cars-min/*.jpg` | 压缩后的车图（0.41MB） |
| `art/logo.svg` | Logo |

### 重新打包

需要 Node.js 环境，运行构建脚本（在项目根目录）：

```javascript
// build.cjs —— 把所有 JS/CSS/图片内联成一个 HTML
const fs = require("fs");
const path = require("path");
const ROOT = "fy-site";
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");

// 车图 base64
const carData = {};
for (const f of fs.readdirSync(path.join(ROOT, "cars-min")).filter(x => x.endsWith(".jpg"))) {
  carData[f.replace(/\.jpg$/, "")] = "data:image/jpeg;base64," +
    fs.readFileSync(path.join(ROOT, "cars-min", f)).toString("base64");
}

const bgB64 = fs.readFileSync(path.join(ROOT, "art/bg-open.jpg")).toString("base64");

function build(outFile, headExtra) {
  let html = read("game.html");
  html = html.replace(/url\("art\/bg-open\.jpg"\)/g,
    () => 'url("data:image/jpeg;base64,' + bgB64 + '")');

  const parts = [];
  if (headExtra) parts.push(headExtra);
  parts.push('<script>window.__CAR_IMG = ' + JSON.stringify(carData) + ';</script>');

  // 基础模块（顺序不能变）
  for (const f of ["fy-adm.js","fy-avatar.js","data/china.js","data/areas.js",
                   "data/orgs.js","data/china-map.js","fy-data.js","fy-jobpool2.js",
                   "fy-cdata.js","fy-countydata.js","fy-person.js","fy-perm.js",
                   "fy-discipline-page.js","fy-appoint.js","fy-tutor.js","fy-auth.js"]) {
    parts.push("<script>" + read(f) + "</script>");
  }

  parts.push("<script>" + read("fy-cars.js") + "</script>");

  // 游戏模块
  for (const f of ["fy-extra.js","fy-jobs.js","fy-jobpool.js","fy-panels.js",
                   "fy-life.js","fy-lifecards.js","fy-task.js","fy-taskcards.js",
                   "fy-map.js","fy-city.js","fy-social.js","fy-people.js",
                   "fy-org.js","fy-org2.js","fy-govweb.js","fy-rankv.js",
                   "fy-discipline.js","fy-rank.js","fy-game.js"]) {
    parts.push("<script>" + read(f) + "</script>");
  }

  html = html.replace(/<script src="[^"]+"><\/script>\s*/g, "");
  html = html.replace("</body>", () => "\n" + parts.join("\n") + "\n</body>");
  fs.writeFileSync(outFile, html, "utf8");
  console.log(path.basename(outFile) + " → " + (fs.statSync(outFile).size/1024/1024).toFixed(2) + " MB");
}

build("gh-pages/index.html", "");
build("gh-pages/governance-top.html",
  '<script>window.__TOPMODE = true; try{ localStorage.removeItem("fy_v2_save"); }catch(e){}</script>');
build("gh-pages/governance-disc.html",
  '<script>window.__DISCMODE = true; try{ localStorage.removeItem("fy_v2_save"); }catch(e){}</script>');
```

### 压缩车图（可选）

如果新增车图，用浏览器 canvas 压缩：

```javascript
// 打开 Edge，F12 控制台粘贴：
async function shrink(src, maxW = 480, q = 0.72) {
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = src; });
  const s = Math.min(1, maxW / img.width);
  const cv = document.createElement("canvas");
  cv.width = img.width * s;
  cv.height = img.height * s;
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL("image/jpeg", q);
}
```

---

## 五、激活码管理

### 当前激活码（写在前端 `fy-auth.js` 里）

```javascript
const CODES = [
  'FY-2026-ZHIL-0001', 'FY-2026-ZHIL-0002', ...
];
```

**⚠️ 安全问题**：任何人都能看到源码里的激活码。

### 追加新激活码

编辑 `fy-auth.js` 第 12~18 行，在 `CODES` 数组里加新码，然后重新打包。

### 想真正防破解

需要后端服务（Supabase / 自建 Node 服务器）。前端方案只能防君子。

---

## 六、数据存储说明

| 用途 | 位置 |
|---|---|
| 账号列表 | `localStorage.fy_users_v1` |
| 登录状态 | `localStorage.fy_session_v1` |
| 已用激活码 | `localStorage.fy_used_codes_v1` |
| 游戏存档 | `localStorage.fy_v2_save_<账号名>` |

**换设备 / 清浏览器缓存 = 数据丢失**。

备份方法：游戏顶栏点「备份」，导出 JSON 文件。

---

## 七、常见问题

**Q: 网站打不开？**
A: GitHub Pages 首次部署要等 1~2 分钟。检查仓库 Settings → Pages 是否显示 "Your site is live at..."。

**Q: 上传后还是旧的？**
A: 浏览器缓存。Ctrl+F5 强制刷新。

**Q: 激活码被用完了？**
A: 编辑 `fy-auth.js` 加新码，重新上传。

**Q: 想要账号数据共享（换设备也能登）？**
A: 需要后端。当前是纯前端方案，数据在本地。

---

## 八、文件清单

```
gh-pages/
├── index.html              主游戏（1.64 MB，含登录页）
├── governance-top.html     省委书记演示版
├── governance-disc.html    立案审查演示版
├── menu.html               选单页（三个入口）
└── README.md               本文件
```

**总大小约 6 MB**，远低于 GitHub 的限制。
