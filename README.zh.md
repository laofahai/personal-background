# Personal Background（个人背景）

一个轻量级、本地优先、基于 markdown 的个人背景管理系统。帮助 AI agent 理解你是谁、如何做决策、以及受哪些约束。

[English version](README.md)

## 解决什么问题

AI agent 每次对话都从零开始。这导致重复提问、建议过于 generic、忽略你的价值观和约束。这个仓库用纯 markdown 保存你的个人上下文，让 agent 在跨项目中做出更好的决策。

## 快速开始

1. 将本仓库 clone 到你选择的位置。
2. 运行 `scripts/init.sh` 或手动复制模板到根目录文件。
3. 填写 `profile.md`、`preferences.md`、`constraints.md`。
4. 让 AI agent 在影响你的决策时读取这个仓库。

## 核心设计

- **本地优先**：纯 markdown + YAML frontmatter，不依赖数据库或向量存储。
- **隐私友好**：敏感资料放在 `raw/private/`，默认 gitignore。
- **统一核心**：`profile.md`、`preferences.md`、`constraints.md` 是稳定的事实来源；`episodes/` 和 `notes/` 记录事件和观察。
- **AI 驱动维护**：Factory Droid 技能（`personal-profile`、`reflect`、`setup-agent`）帮助更新内容。
- **跨 agent**：`AGENTS.md` 和 `CLAUDE.md` 可被 Claude、Codex 等兼容 agent 读取。

## 仓库结构

```text
personal-background/
├── AGENTS.md                 # 跨工具入口
├── CLAUDE.md                 # Claude 适配器
├── methodology.md            # 个人背景管理方法论
│
├── profile.md                # 稳定身份
├── preferences.md            # 决策偏好
├── constraints.md            # 硬性约束
│
├── episodes/                 # 时间戳经历
├── notes/                    # 自由观察
├── raw/                      # 原始资料
│   ├── public/               # 可入 git
│   └── private/              # 默认 gitignore
│
├── templates/                # 新用户模板
├── archive/                  # 归档过时条目
│
├── .factory/skills/          # Factory Droid 技能
├── scripts/                  # 辅助脚本
├── hooks/                    # 可选 Claude Code hook
└── mcp/                      # 可选 MCP server
```

## Agent 如何使用

当 agent 与你协作时，应读取：

- `profile.md` — 稳定身份
- `preferences.md` — 决策风格与价值观
- `constraints.md` — 不可妥协的边界
- `episodes/` 和 `notes/` — 近期上下文与具体事件

## 同步与备份

如需跨设备访问，使用 GitHub 私有仓库。核心文件完全离线可用，git 只是同步层。

## 语言

- 项目文件（README、methodology、skills、scripts）使用英文。
- 个人资料文件（`profile.md`、`preferences.md`、`constraints.md`、`episodes/`、`notes/`）可以使用你偏好的任何语言。
- 文件名使用 ASCII slug（`YYYY-MM-DD-short-slug.md`），正文使用你的偏好语言。

## 许可证

MIT
