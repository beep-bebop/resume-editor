# 魏方圆 | 大模型技术服务专家 / AI Agent 研发

电话：13323755686 ｜ 微信：weify3 ｜ 邮箱：weify3@qq.com

## 职业摘要

计算机技术硕士，具备大模型训练、推理优化、RAG 与企业级 AI Agent 落地经验。近期聚焦 WPS 表格 AI / DataAgent，从 JS/Formula/Code 生成链路、AI Server 多阶段 Agent、KOS/SpreadsheetBench 自动评测，到 APO / Agent RL 自动优化平台均有工程贡献；适配阿里云 TAM-AI 岗位所需的 Agent 技术栈设计、客户场景方案落地、模型交互优化、稳定性保障与问题诊断能力。

## 核心技能

AI Agent 架构：Multi-Agent、Single-Agent、Tool / Skill 编排、Prompt Manager、Intent Guard、Human Feedback、验证纠偏  
大模型应用：RAG、结构化输出、Prompt Engineering、模型效果评估、Trace 分析、失败案例归因、Playbook / Skill 沉淀  
表格 AI：Formula / JS / Code 生成、WebOffice / WPS JS API、表格解析、AI Sample、SpreadsheetBench、KOS 自动评测  
模型训练推理：PyTorch、Transformers、DeepSpeed、vLLM、AWQ、BERT、多模态特征融合、预训练数据处理  
工程栈：Python、Go/Gin、JavaScript、Vue、LangChain、FastChat、FAISS、Eino、AI Gateway、CDP 自动化

## 工作经历

### WPS 表格 AI / DataAgent｜AI Agent 研发｜2025.10 - 至今

- **多阶段 Agent 系统：**参与 DataAgent 在 AI Server 中的阶段化改造，建设阶段 A/C/D prompt、工具屏蔽、只读模式、多轮对话、undo、clear range、验证纠偏等机制，将表格 Agent 从单轮工具调用推进为可恢复、可校验的多阶段执行系统。
- **Prompt 工程化：**参与 prompt registry / store / render / manager / watcher 设计，将分散的 prompt、agent info、tool info 与参数 schema 统一为可配置模板体系，支撑多模式 DataAgent 复用和灰度迭代。
- **执行链路稳定性：**围绕 answer position、output area、enable new sheet、clear range、占用区域和增量表格描述做显式状态传递，减少模型自由推断导致的写入错位、错误残留和多轮污染。
- **成本与效果优化：**通过阶段化 prompt、上下文裁剪、模型切换和单测适配，支撑 main agent token 消耗从 30w+ 降至 10w+；材料显示产品 case 36/36 跑通，并持续修复 16/27 个产品 case。
- **意图分流与澄清：**参与 intent gate / intent guard、意图澄清 agent、human feedback tool 建设，将通用问答、表格操作、模糊意图前置分流，减少复杂链路误触发。
- **JSGen 生成纠错：**建设“生成-检查-修正-检查-下发”闭环，提取 JS 中 Range 与 Formula 字面量并按位回填原始 JSON，避免模型改写 apply range 和公式，提升表格 JS 生成可执行性。
- **评测与训练闭环：**搭建 KOS 自动评测流水线，并参与 APO / meta-harness，把失败 case 转成 playbook / skill 经验，通过连续通过、失败预算、回归分数门控控制经验质量。
- **业务结果支撑：**相关材料显示 WPS AI (Seed 2.0) 在 SpreadsheetBench 榜单取得全球第二；Agent RL 自动流程将分数从 90 提升到 96。

### Excel AI Demo / 评测标注平台｜前后端与 Agent 联调｜2025.10 - 2026.01

- **Excel AI Demo：**基于 Go/Gin、WebOffice SDK、SSE 和前端静态页面，打通文件上传、在线打开、流式对话、Agent 消息渲染、生成 JS 捕获执行的端到端链路。
- **流式输出治理：**实现 SSE 增量解析和 Agent 分块展示，过滤工具 JSON、BeforeTools、中间日志和重复代码，将复杂 Agent 执行轨迹转成可读前端体验。
- **公式自动落表：**解析 `formula_gen_valid_output` 事件，依据 task shape 自动选择普通公式或数组公式并推导写入范围，使公式生成结果可直接在表格中验证。
- **人工评测平台：**建设多模型结果横向评审工具，支持标准答案 / 多模型结果文件夹上传、云端预览、在线结果表动态 schema 识别和标注结果回写。

### 阅文集团｜AIGC 攻坚项目组 技术序列实习｜2024.06 - 2024.09

- **72B 模型迭代：**基于 DeepSpeed 参与线上 72B 导语模型的数据处理与训练迭代，产出三种数据构建策略下的模型版本。
- **训练效率优化：**构建预训练数据集并实现短样本 Packing，将 Attention 限制在短样本内以提升输出遵循效果和训练效率，相关能力补充合并至 Transformers。
- **推理成本优化：**使用 AWQ + vLLM 完成模型量化与推理评测，实现 1.3-2 倍推理加速，服务成本降低约 5k / 月。

## 重点项目

### APO / meta-harness 自动优化系统

- **失败驱动优化：**实现 Run Batch -> Analyze -> Observe -> Reflect -> Curate -> Inject -> Re-run，将失败 case 转为可验证、可回归的经验条目。
- **回归门控：**引入连续通过、失败预算、经验生命周期状态机和回归分数门控，避免局部修复导致全局退化。
- **Trace 证据链：**抽取 trace、diff、log、公式差异、mismatch 等证据，压缩长上下文并保留关键失败信息。

### JSGen / Formula-to-JS 表格执行引擎

- **双模式输入：**支持公式结构化任务和自然语言表格操作，按新建 / 已有 sheet、apply range 等条件路由不同生成规范。
- **混合校验：**结合 LLM 校验与确定性字符串修正，解决公式被误改、Range 不一致、JSON 引号破坏、二维数组写入错误等高频问题。

### 智慧党建知识库问答平台

- **RAG 问答：**基于 ChatGLM3、LangChain、FastChat、M3E、FAISS 构建本地知识库问答平台，并使用 vLLM 提升推理速度。

## 研究经历

- **ACL 2023｜CDA：**提出结合数据增强的对比学习方法，用谈话转录文本进行认知障碍预诊断分类；基于 BERT-base 达到 SOTA，超过 ERNIE-large 方法。
- **Interspeech 2024｜MCI Detection：**提出多语言语音 / 文本特征融合与匹配方法，实现 77.5% 准确率。

## 教育经历

**中南大学｜硕士｜计算机技术｜2022.09 - 2025.06**  
GPA 3.68，排名 4/289；一等奖学金（2023、2024）；光云 / 华锐奖学金；校优秀学生；班长。

**中南大学｜本科｜软件工程｜2018.09 - 2022.06**  
成绩 86.15；三等奖学金（2019、2020）。

## 竞赛与开源

- **中国研究生人工智能创新大赛国家级二等奖：**构建对话场景阿尔茨海默症预诊断系统，测试集准确率 89.6%。
- **全国大学生软件创新大赛华南区域赛二等奖｜队长：**负责模型训练及前后端开发，构建多模态疾病预诊断平台。
- **开源贡献：**Transformers Contributor、DeepSpeed Contributor。
