# EduMind

EduMind 是一个面向期末复习的自适应学习系统。它以课程大纲为起点，自动整理课程结构，再从课件、笔记、作业、测验、past paper 等资料中生成知识卡片、练习题、知识图谱和弱点复习建议。

项目采用前后端分离架构：

- `frontend/`: Vite + React + TypeScript 的移动端优先学习界面。
- `backend/`: Python + FastAPI 后端，负责认证、课程管理、文档解析、知识卡片生成、学习会话和数据分析。
- `docs/`: 系统设计、课程资料和后端实现说明。

## 技术栈

前端：

- React 19
- TypeScript
- Vite
- Tailwind CSS
- lucide-react
- motion

后端：

- Python 3.11+
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- PyMuPDF / python-pptx / python-docx
- DashScope OpenAI-compatible API，用于结构化课程解析和学习内容生成

## 目录结构

```text
.
├── backend/                 # FastAPI 后端服务
│   ├── app/
│   │   ├── api/routes/      # HTTP API 路由
│   │   ├── core/            # 配置
│   │   ├── db/              # SQLAlchemy 数据库模型和连接
│   │   ├── schemas/         # Pydantic 请求/响应模型
│   │   └── services/        # 业务模块
│   ├── tests/               # 后端测试
│   ├── .env.example         # 后端环境变量示例
│   └── pyproject.toml
├── frontend/                # React 前端应用
│   ├── src/
│   │   ├── components/      # UI 组件和页面
│   │   ├── services/        # API 调用封装
│   │   ├── types/           # 前端类型定义
│   │   └── App.tsx          # 应用状态和主流程
│   ├── .env.example         # 前端环境变量示例
│   └── package.json
├── docs/                    # 设计文档和示例课程资料
└── README.md
```

## 本地运行

### 1. 启动后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

后端启动后可访问：

- 健康检查：`http://localhost:8000/health`
- API 文档：`http://localhost:8000/docs`

后端默认使用 SQLite，数据库文件为 `backend/edumind.db`。首次启动时会自动建表，并创建一个演示用户：

```text
邮箱：felix@example.com
密码：password
```

### 2. 配置后端 AI 服务

后端会读取 `backend/.env`：

```env
ENVIRONMENT=local
DATABASE_URL=sqlite:///./edumind.db
CORS_ORIGINS=["http://localhost:3000"]

LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=your_key
LLM_MODEL=deepseek-v4-flash
```

说明：

- `LLM_API_KEY` 需要填写你的 DashScope API Key。
- 默认模型是 `deepseek-v4-flash`，适合高频、低延迟的结构化解析。
- 如果要处理更复杂的课程资料或推理任务，可以把 `LLM_MODEL` 改成更强的模型。

### 3. 启动前端

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

前端默认运行在：

```text
http://localhost:3000
```

`frontend/.env.local` 中需要确保 API 地址正确：

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 使用流程

1. 打开 `http://localhost:3000`。
2. 进入 Profile 页面，注册新账号或使用演示账号登录。
3. 回到首页，点击 `Create Course`，上传课程大纲或 syllabus。
4. 系统解析课程代码、课程标题、考核信息、学习目标和章节结构。
5. 在课程确认页面检查和修改解析结果，然后创建课程工作区。
6. 上传课件、笔记、作业、测验、tutorial、past paper 等学习资料。
7. 系统解析资料，生成知识卡片、概念说明和内嵌测验。
8. 进入知识图谱页面，选择本轮学习需要激活的概念。
9. 回到首页开始学习，可选择普通学习、弱点复习、单概念复习或按章节复习。
10. 学习过程中提交“已掌握”或“不确定”，系统会更新掌握度和弱点池。
11. 在 Analytics 页面查看掌握率、弱点概念、学习记录和复习建议。

支持上传的文件格式：

- `.pdf`
- `.pptx`
- `.docx`
- `.md`
- `.markdown`
- `.txt`

`.ppt` 仅作为 best-effort 支持，建议先导出为 `.pptx`。

## 前端模块和功能

### 首页 `HomeScreen`

- 展示当前课程、激活概念数量、掌握率和弱点数量。
- 上传 syllabus 创建课程。
- 上传课程材料并进入解析流程。
- 设置每日学习概念数量。
- 启动普通学习会话。

### 课程确认 `CourseReviewScreen`

- 展示从 syllabus 中提取出的课程结构。
- 支持确认或编辑课程标题、课程代码、考核方式、学习目标和章节。
- 确认后创建课程工作区。

### 解析页 `ParsingScreen`

- 展示 syllabus 或课程材料解析进度。
- 解析完成后自动进入课程确认或知识图谱页面。

### 知识图谱 `MindMapScreen`

- 按章节展示生成的概念卡片。
- 支持选择本轮要激活的概念。
- 支持按章节折叠和查看知识结构。
- 可从某个概念或章节发起针对性学习。

### 学习页 `StudyScreen`

- 以卡片形式学习概念。
- 支持翻面查看解释。
- 记录“已掌握”和“不确定”反馈。
- 普通学习中会穿插测验。

### 测验页 `QuizScreen`

- 展示概念对应的选择题。
- 提交答案后，后端记录正确性、置信度和答题时间。
- 错题会进入弱点池。

### 数据分析 `AnalyticsScreen`

- 展示课程掌握率、学习会话记录、弱点数量和行为建议。
- 支持从弱点池直接进入复习。

### 弱点报告 `WeaknessReportScreen`

- 汇总弱点复习结果。
- 展示本轮复习中已解决和仍需复习的概念。

### 个人页 `ProfileScreen`

- 注册、登录、登出。
- 查看用户基础信息和学习统计。
- 登录 token 存储在浏览器 localStorage 中。

## 后端模块和功能

### `auth`

- 用户注册、登录、获取当前用户。
- 使用简单 token 认证。
- 主要接口：
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `GET /api/v1/users/me/profile`

### `courses`

- 创建课程、列出课程、读取课程详情、更新课程结构。
- 从 syllabus 解析课程草稿。
- 上传课程资料并生成学习卡片。
- 主要接口：
  - `POST /api/v1/courses/from-syllabus`
  - `POST /api/v1/courses`
  - `GET /api/v1/courses`
  - `GET /api/v1/courses/{course_id}`
  - `PATCH /api/v1/courses/{course_id}/structure`
  - `GET /api/v1/courses/{course_id}/chapters`
  - `POST /api/v1/courses/{course_id}/documents/files`
  - `GET /api/v1/courses/{course_id}/documents`

### `course_parsing`

- 提取 PDF、PPTX、DOCX、Markdown、TXT 中的文本。
- 判断文档类型，例如 syllabus、slides、notes、past paper、homework、quiz。
- 将课程资料转换为概念卡片和选择题。
- 根据章节关键词自动判断资料覆盖范围。

### `concepts`

- 管理课程概念和前端展示用卡片。
- 保存用户在知识图谱中选择的激活概念。
- 主要接口：
  - `GET /api/v1/courses/{course_id}/concepts`
  - `GET /api/v1/courses/{course_id}/card-views`
  - `PATCH /api/v1/courses/{course_id}/active-concepts`
  - `GET /api/v1/concepts/{concept_id}`

### `sessions`

- 创建学习会话。
- 根据学习模式选择卡片：普通学习、弱点复习、单概念复习、章节复习。
- 记录学习反馈并完成会话。
- 主要接口：
  - `POST /api/v1/courses/{course_id}/sessions`
  - `GET /api/v1/sessions/{session_id}`
  - `POST /api/v1/sessions/{session_id}/feedback`
  - `POST /api/v1/sessions/{session_id}/complete`

### `knowledge_state`

- 根据答题结果、掌握反馈、置信度和响应时间更新概念掌握度。
- 维护弱点池、错误次数、下次复习时间等状态。

### `analytics`

- 汇总课程掌握率、弱点概念、学习会话、待复习内容和行为建议。
- 主要接口：
  - `GET /api/v1/courses/{course_id}/analytics`
  - `GET /api/v1/users/me/progress`

### `planning`

- 基于剩余天数、每日学习时间、弱点优先级和掌握度生成学习计划。
- 主要接口：
  - `POST /api/v1/courses/{course_id}/plans`
  - `GET /api/v1/courses/{course_id}/plans/current`

### `behavior_activation`

- 分析学习会话记录。
- 生成建议学习时长、最佳学习时间和行为提醒。

### `evidence`

- 维护知识卡片和原始资料之间的来源追踪。
- 用于判断内容证据强度和可追溯性。

### `ai_gateway`

- 封装 OpenAI-compatible LLM 调用。
- 将模型服务和业务逻辑隔离，方便替换模型或供应商。

## 常用开发命令

前端：

```bash
cd frontend
npm run dev       # 本地开发
npm run build     # 生产构建
npm run preview   # 预览构建结果
npm run lint      # TypeScript 类型检查
```

后端：

```bash
cd backend
uvicorn app.main:app --reload --port 8000
pytest
ruff check .
mypy app
```

## 数据和状态说明

- 用户、课程、章节、文档、卡片、概念状态和学习会话会保存到 SQLite。
- 默认数据库地址由 `DATABASE_URL` 控制。
- 前端登录 token 保存在浏览器 localStorage，key 为 `edumind_auth_token`。
- 后端会在启动时创建演示用户，但不会自动创建课程；课程需要通过 syllabus 流程创建。

## 相关文档

- [后端设计说明](docs/backend-guidance.md)
- [AI 课程大纲示例](docs/artificial-intelligence-syllabus.md)
- [系统设计 PDF](docs/edumind%20system%20design.pdf)
