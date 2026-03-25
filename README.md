# RuoYi-Angular（若依 Angular 前端）

基于 **Angular 21**、**NG-ALAIN 21**、**ng-zorro-antd** 的若依管理系统前端，与 **RuoYi-Vue / 若依 Spring Boot** 后端通过 REST API 对接。

---

## 目录

- [环境要求](#环境要求)
- [安装依赖](#安装依赖)
- [本地启动（开发）](#本地启动开发)
- [构建打包](#构建打包)
- [部署上线](#部署上线)
- [环境与接口说明](#环境与接口说明)
- [常用脚本](#常用脚本)
- [常见问题](#常见问题)
- [参考链接](#参考链接)

---

## 环境要求

| 软件 | 说明 |
|------|------|
| **Node.js** | 建议 **20.x LTS** 或与当前 Angular 21 兼容的版本（≥ 18） |
| **npm** | 随 Node 安装即可（项目声明 `packageManager: npm@10.x`） |
| **RuoYi 后端** | 本地开发时需可访问，默认 `http://localhost:8080`（见 `proxy.conf.js`） |

验证版本：

```bash
node -v
npm -v
```

---

## 安装依赖

在项目根目录（本仓库 `RuoYi-Angular`）执行：

```bash
npm install
```

若国内镜像出现 **403** 等问题，可编辑项目根目录 `.npmrc`，临时改用官方源或可信镜像后再执行 `npm install`。

---

## 本地启动（开发）

1. **启动若依后端**（默认端口 `8080`，与 `proxy.conf.js` 中一致）。
2. 执行：

```bash
npm start
```

等价于 `ng s -o`：启动开发服务器、打开浏览器。

- 前端开发地址一般为：`http://localhost:4200`
- 接口前缀：`/dev-api`，由 `proxy.conf.js` 转发到 `http://localhost:8080`，并去掉路径前缀 `dev-api`（与若依后端上下文一致）

**默认登录账号（以你方后端配置为准）**：常见为 `admin` / `admin123`。

### 热更新 / 指定端口

```bash
# 热模块替换（HMR）
npm run hmr

# 指定端口示例（不修改 package.json 时可直接调用 CLI）
npx ng serve --port 4300 -o
```

---

## 构建打包

### 生产构建（默认）

`angular.json` 中 `build` 的 **defaultConfiguration** 为 `production`，因此直接执行：

```bash
npm run build
```

等价于带生产优化、替换 `environment.prod.ts` 的构建。

### 指定配置

```bash
# 显式生产构建
npx ng build --configuration production

# 开发配置（较少用于上线，体积大、含 sourceMap）
npx ng build --configuration development
```

### 产物目录

使用 `@angular/build:application` 时，构建结果默认在：

```text
dist/RuoYi-Angular/browser/
```

其中包含 `index.html`、带 hash 的 JS/CSS 等静态文件。部署时将该目录（或其内容）作为 **网站根目录** 或由 Nginx **`root`** 指向即可。

### 构建体积与 budgets

项目在 `angular.json` 中为 **initial** 包设置了预算（当前 **4MB 警告 / 5MB 错误**）。若仍超出，可在同一路径下调高 `maximumWarning` / `maximumError`。

---

### 体积优化（已实现与可用工具）

工程内已做这些拆分，减小 **首包（initial）**：

| 措施 | 说明 |
|------|------|
| **路由懒加载** | 业务页、`DashboardShell`、子仪表盘页均使用 `loadComponent` / `loadChildren`，不在 `main` 里直接 `import` 页面组件。 |
| **ECharts 移出全局** | `provideEchartsCore` 仅挂在 **`DashboardShellComponent`**，进入仪表盘才加载 ECharts 运行时。 |
| **地图按需** | `MapChart`、`Geo`、`VisualMap` 放在 `src/app/core/echarts-maps.ts`，仅在 **默认页** `await import(...)` 后再 `registerMap`，分析页/监控页不包含地图模块。 |
| **基础 ECharts** | `src/app/core/echarts.ts` 仅注册柱状/折线/饼/散点/仪表盘等常用能力。 |

**分析首包与异步块：**

```bash
# 生产构建并生成 stats.json（路径：dist/RuoYi-Angular/stats.json）
npm run build:stats

# 用 esbuild-visualizer 打开依赖占比（生成 stats-report.html 并尝试打开浏览器）
npm run analyze:stats
```

**结合 source-map 粗查 JS 体积：**

```bash
npm run analyze
npm run analyze:view
```

后续仍可：减少 `ICONS_AUTO` 图标、`@delon/chart` 仅在使用页懒加载、`moment` 换 `date-fns` 等继续做细化。

---

## 部署上线

以下为典型 **前后端分离** 部署思路：静态资源 + 独立 API 服务。

### 1. 前端静态资源

将 **`dist/RuoYi-Angular/browser`** 目录上传到服务器，由 **Nginx**、**Apache**、对象存储 + CDN、或任意静态站点托管。

生产环境 `src/environments/environment.prod.ts` 中示例配置：

- `api.baseUrl: './'`：相对当前站点，适合与页面同域或由网关统一转发。
- `useHash: true`：使用 **Hash 路由**（`/#/path`），部署到任意子路径时不易出现刷新 404，仍建议 Nginx 兜底到 `index.html`（见下）。

### 2. Nginx 示例（SPA + 反向代理 API）

假设前端文件在 `/var/www/ruoyi-angular/browser`，后端在 `http://127.0.0.1:8080`：

```nginx
server {
  listen 80;
  server_name your.domain.com;
  root /var/www/ruoyi-angular/browser;
  index index.html;

  # 单页应用：无物理文件时回退到 index.html（History 模式必需；Hash 模式可作补充）
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 将 /prod-api 转发到若依后端（路径名需与前端 environment 中 baseUrl 一致）
  location /prod-api/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  gzip on;
  gzip_types text/plain text/css application/javascript application/json;
}
```

**注意**：

- 若生产 `environment.prod.ts` 里 `api.baseUrl` 为 `./`，需保证请求路径与 Nginx `location`、后端 **context-path** 一致；常见做法改为 **`/prod-api`**（或若依文档推荐前缀），并同步修改 `environment.prod.ts` 后重新 `npm run build`。
- 若依后端需配置 **跨域（CORS）** 或与 Nginx **同域代理**，避免浏览器拦截。

### 3. 子路径部署

若站点挂在 `https://example.com/app/`：

- 构建时需配置 `base href`，例如：

  ```bash
  npx ng build --base-href /app/
  ```

- 同时检查 `environment.prod.ts` 中 `baseUrl`、资源路径是否与网关一致。

### 4. Docker（简要）

可将 **`browser` 目录** 复制到镜像，使用官方 `nginx:alpine` 挂载上述 Nginx 配置即可；后端单独用若依官方镜像或 Jar 部署。

---

## 环境与接口说明

| 文件 | 用途 |
|------|------|
| `src/environments/environment.ts` | **开发**：`baseUrl` 多为 `/dev-api`，配合 `proxy.conf.js` |
| `src/environments/environment.prod.ts` | **生产**：构建时替换；请按实际网关 / 域名修改 `api.baseUrl`、`useHash` 等 |
| `proxy.conf.js` | 仅 **`ng serve`** 生效；**生产构建不包含代理**，由 Nginx 等同理 |

---

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm start` | 开发服务器并打开浏览器 |
| `npm run build` | 生产构建（默认 configuration） |
| `npm run build:stats` | 生产构建并生成 `dist/RuoYi-Angular/stats.json` |
| `npm run analyze:stats` | 根据 `stats.json` 生成可视化报告并打开浏览器 |
| `npm run watch` | development 配置监视构建 |
| `npm run lint` | ESLint + Stylelint（Less） |
| `npm test` | 单元测试 |
| `npm run analyze` | 带 source-map 构建，便于分析体积 |
| `npm run analyze:view` | 配合上一命令，用 source-map-explorer 分析 `browser` 目录 JS |

---

## 常见问题

1. **开发时接口 502 / ECONNREFUSED**  
   后端未启动或端口不是 `8080`，请核对 `proxy.conf.js` 中 `target`。

2. **生产环境登录后接口 404**  
   检查 `environment.prod.ts` 的 `baseUrl` 与 Nginx 反向代理路径、若依 `context-path` 是否一致。

3. **刷新页面 404**  
   Hash 模式（`useHash: true`）通常可缓解；若使用 Path 模式，必须为 SPA 配置 `try_files` 回退 `index.html`。

4. **`npm run build` 报 bundle budget**  
   见上文 [构建体积与 budgets](#构建体积与 budgets)。

---

## 参考链接

- [NG-ALAIN 文档](https://ng-alain.com/)
- [ng-zorro-antd](https://ng.ant.design/)
- [Angular CLI 部署](https://angular.dev/tools/cli/deployment)

---

## License

以项目仓库内许可文件为准；NG-ALAIN 相关组件遵循其开源协议。
