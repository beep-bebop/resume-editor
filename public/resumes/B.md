### 金山办公｜Office 事业部·表格 AI 组｜算法工程师｜2025.07 - 至今

#### 表格 DataAgent｜面向 WPS 表格自然语言分析与自动化操作的多阶段 Agent 系统

- **JS 代码生成与确定性纠错：**参与 JSGen 子 Agent 建设，面向公式任务与自然语言表格操作设计双模式入参；构建“生成—检查—修正—复检—执行”闭环，并将生成代码中的 `Range`、`Formula` 等字面量按位回填原始任务，约束模型改写区域、公式和工作表名称导致的执行偏差，内部评测分数由 **30+ 提升至 60+**。
- **Prompt/Tool 配置化底座：**负责 Prompt Manager 设计与落地，搭建 `registry / store / render / manager / watcher` 模块，将 Prompt、Agent/Tool 描述及参数 Schema 从业务代码中解耦为支持版本、变量校验、按需拼装与热更新的模板体系，支撑多 Agent、多模式及动态工具挂载的统一配置与迭代。
- **多阶段编排与执行稳定性：**围绕表格任务“规划—执行—验证—修正”链路，参与阶段化 Main Agent 改造；通过阶段工具屏蔽、分层 Validator、上下文裁剪及模型切换，结合 `answer_position`、`output_area`、`clear_range`、占用区域和增量表格描述等状态的显式透传，解决写入错位、错误残留与跨轮上下文污染问题，Main Agent Token 消耗由 **30w+ 降至 10w+**。
- **意图分流与多轮任务恢复：**负责 Intent Guard 与意图澄清链路，将通用问答、明确表格操作和模糊诉求前置分流；对模糊请求通过 Human Feedback 获取用户确认，并设计“历史会话 + 当前澄清选项”的恢复机制，避免重复澄清与意图丢失；建设对应回归集，单 Agent 意图分流改造回归全量通过。
- **可恢复的表格 Agent 状态管理：**负责多轮对话、撤销与错误清理能力，支持保留最近关键上下文、回收上一轮错误区域、记录新增占用区域及只读模式下的工具约束，使 Agent 能基于真实执行结果继续修正，而非仅依赖模型文本判断。

#### Agent RL｜面向表格 Agent 的评测、经验沉淀与提示词自迭代平台

- **真实环境自动评测与证据链：**负责 KOS/SpreadsheetBench 自动评测流水线，串联数据集读取、浏览器侧栏执行、文件上传、KSO 评分、日志与报告分析；通过 CDP 识别 WPS/Kdocs 页面状态，沉淀 DOM/HTML 快照、输出文件、Trace、Diff 与评分明细，使失败 Case 可批量复现、定位和回归。
- **失败驱动的自动优化闭环：**参与构建 `Run Batch → Analyze → Observe → Reflect → Curate → Inject → Re-run` 流程，将评测失败转化为可审计的 Playbook/Skill 经验，并重新注入目标 Agent 验证；通过连续通过阈值、失败预算、经验生命周期与回归分数门控，避免局部修复污染全局效果。项目将目标 Agent 评测分数由 **90 提升至 96**，并支撑 **WPS AI（Seed 2.0）在 SpreadsheetBench 榜单取得全球第二**。
- **多数据源、多 Agent 可迁移适配：**负责 Adapter 抽象与扩展，将评测侧适配内部/外部表格数据集，目标侧扩展至 Cowork 等 Agent；支持对真实 Skill 目录进行快照、注入、验证与异常回滚，使评测与优化框架可迁移至不同 Agent、Benchmark 和 Skill Tree 场景。