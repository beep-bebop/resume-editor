### **金山办公｜Office 事业部·表格 AI 组｜算法工程师｜2025.07 - 至今**

#### *表格 AI Agent｜面向复杂表格分析与自动操作的生产级 DataAgent*

- **多阶段 Agent 执行闭环：**参与 DataAgent 从 Multi-Agent 编排向阶段化 Main Agent / Single Agent + Skills 架构演进，将复杂表格任务拆分为意图理解、任务规划、工具执行、结果验证与错误恢复等阶段；通过阶段化 Prompt、动态工具挂载与屏蔽、分层校验及上下文裁剪，使 Agent 能够根据任务状态选择 Formula、Code、JS 等执行路径，Main Agent 单任务 Token 消耗由 30w+ 降至 10w+，产品评测 Case 36/36 跑通。

- **JS 代码生成子 Agent：**参与搭建面向公式落表和自然语言表格操作的 JSGen 子 Agent，设计“生成—检查—修正—复检—下发”闭环；针对模型擅自改写公式、目标区域及 Sheet Name 等问题，提取生成代码中的 Range、Formula / FormulaArray 字面量并按位回填原始任务，结合 WPS JS API 错误案例与确定性后处理提升代码可执行性，相关评测得分由 30+ 提升至 60+。

- **Prompt Manager 工程化：**设计并落地 Prompt Registry / Store / Render / Manager / Watcher，将散落在代码中的 Agent Prompt、Tool 描述及参数 Schema 重构为分块、版本化、可校验的 YAML / Markdown 模板；支持按 Agent、Tool 和 Mode 动态装配 Prompt、校验运行时变量并复用静态前缀，为多模型适配、灰度迭代和 Prompt 缓存降本提供统一底座。

- **意图分流与多轮交互：**设计并落地前置 Intent Guard Agent，将请求划分为通用问答、可执行表格操作和模糊意图三类；结合当前工作表、用户选区、表格概览及历史会话进行判断，通过 Human Feedback Tool 发起澄清并在中断后恢复执行，避免模糊需求被模型直接猜测或简单问答误入完整 Agent 链路；构建覆盖 25 个产品 Case、共 100 题的意图回归数据集并实现全量通过。

- **执行可靠性与状态管理：**围绕 `answer_position`、`output_area`、`clear_range`、新增占用区域等关键状态建立显式传递机制，结合增量表格描述、Undo、错误区域清理和多轮上下文管理，解决写入错位、错误结果残留、重复执行及历史信息污染等问题，使表格操作从“生成并执行”升级为可验证、可纠偏、可恢复的执行闭环。

#### *Agent RL / Harness 自动优化平台｜基于评测反馈的 Prompt 与 Skill 自迭代*

- **真实环境自动评测与证据链：**从零搭建 KOS 自动评测流水线，打通数据集读取、文件准备、WPS / Kdocs 侧栏执行、结果文件上传、KSO 评分、日志留存与分析报告生成；基于 Chrome DevTools Protocol 采集 DOM / HTML 快照，并通过 DOM 摘要变化检测执行停滞，结合输出文件、Trace、Diff、公式差异和 Mismatch 构建可复现的失败证据链，支持多进程并行跑分与批量回归。

- **失败驱动的自动优化闭环：**借鉴 ACE、Trace2Skill 等经验自迭代思路，建设 `Run Batch → Analyze → Observe → Reflect → Curate → Inject → Re-run` 流程，将失败 Case 自动归因为可复用的 Playbook / Skill 条目并重新注入 Agent；设计连续通过、失败预算、经验生命周期和回归分数门控，避免单 Case 修复造成整体能力退化，推动自动优化评测分数由 90 提升至 96，并支撑 WPS AI（Seed 2.0）在 SpreadsheetBench 榜单取得全球第二。

- **多数据源与多 Agent 接入：**抽象 Dataset / Benchmark / Target Agent Adapter，在数据侧兼容内部 KOS、SpreadsheetBench 及本地数据集，在目标侧由 Single Agent 扩展至 Cowork；支持 Skill Tree 多文件训练面、运行前依赖检查、候选版本注入及异常自动恢复，使评测与优化框架能够低成本迁移到不同数据集、Agent 和执行环境。