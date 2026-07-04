# Personal Background（个人背景）

一个本地优先、基于 markdown 的个人背景套件与数据主场。它为 AI agent 提供关于你是谁、如何做决策、以及受哪些约束的持久上下文，同时不会把你的数据锁定在任何工具里。设计上通过 AI agent（技能 + MCP）使用，直接编辑文件只是可选的 fallback。

[English version](README.md)

## 快速开始

1. **先将本仓库 fork 到你自己的私有账号**（它将成为你的个人数据主场；永远不要向公共上游推送私人数据），然后再 clone 你的 fork。
2. 在 AI agent 中打开本仓库，并粘贴 [`bootstrap/PROMPT.md`](bootstrap/PROMPT.md) 的全部内容。
3. agent 会先询问你的偏好语言，然后创建数据文件、安装技能并注册 MCP server。
4. 使用 `complete-profile` 进行引导式初始化，或者直接说“记住这件事”来记录一条 episode 或 note。

## 仓库结构

```text
personal-background/
├── kit/                    # 框架：清单、模板、技能
│   ├── manifest.yml
│   ├── config/settings.example.yml
│   ├── templates/          # 数据文件模板
│   └── skills/             # 给 agent 安装的技能
├── bootstrap/              # 权威的 bootstrap 提示词
├── mcp/                    # 一等 MCP 桥（通过 bun 直接运行 TS）
│
├── methodology.md          # 背景管理方法论
├── README.md / README.zh.md
├── LICENSE
│
├── AGENTS.md               # 跨 agent 入口（由 bootstrap 从 kit/templates/AGENTS.md 生成；用户所有）
├── profile.md              # 稳定身份（用户所有）
├── preferences.md          # 决策偏好（用户所有）
├── constraints.md          # 硬性约束（用户所有）
├── episodes/               # 带时间戳的经历（用户所有）
├── notes/                  # 自由观察（用户所有）
├── raw/                    # 原始资料
│   ├── public/             # 可入 git
│   └── private/            # gitignore；MCP server 永远不会读取
├── archive/                # 过时条目
└── .pbg/                   # gitignore 运行时配置（由 bootstrap 创建）
```

## 文件所有权约定

框架所有文件（由套件读取和更新，不保存用户个人数据）：

- `kit/`、`bootstrap/`、`mcp/`
- `README.md`、`README.zh.md`、`methodology.md`、`docs/`、`LICENSE`

用户所有文件（任何工具都不会覆盖，除非你明确同意）：

- `AGENTS.md`（由 bootstrap 从 `kit/templates/AGENTS.md` 生成；可安全编辑）
- `profile.md`、`preferences.md`、`constraints.md`
- `episodes/`、`notes/`、`raw/`、`archive/`
- `.pbg/`、`index/`

`upgrade` 技能遵守这条边界，只更新框架所有文件。

## 两种访问面

1. **MCP 桥**（`mcp/`）：用于日常跨项目使用。任何支持 MCP 的项目都可以读写你的背景。server 从 `PERSONAL_BACKGROUND_DIR` 读取仓库路径，并且永远不会读取 `raw/private/`。
2. **技能**（`kit/skills/`）：用于引导式维护：`personal-profile`、`complete-profile`、`reflect`、`setup-agent`、`localize`、`import`、`upgrade`。bootstrap 提示词会把它们安装到你的 agent 中。

## 语言

- 框架文件使用英文，并作为权威源。
- 用户数据写入 `.pbg/settings.yml` 中 `preferred_language` 指定的语言。
- 使用 `localize` 技能生成框架文档的翻译副本（如 `README.zh.md`），或在得到你明确确认后把你的用户数据转换为另一种语言。
- 文件名保持 ASCII（`YYYY-MM-DD-short-slug.md`）；正文可以使用你的偏好语言。

## 同步与备份

使用私有 git 仓库或任何兼容 markdown 的同步方式。核心设计是本地优先；git 只是同步层。

## 升级

不要对你的数据执行盲目的 `git pull`。使用 `upgrade` 技能，在上游套件更新时只对框架所有文件进行带确认、带推理的合并。为了让升级顺畅，建议把原始模板仓库保留为名为 `upstream` 的 git remote（如果缺少，该技能可以帮你添加）。

## 许可证

MIT
