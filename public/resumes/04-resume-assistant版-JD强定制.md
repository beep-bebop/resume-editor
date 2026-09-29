# 魏方圆 | 阿里云智能 TAM-AI 原生业务定制版

电话：13323755686 ｜ 微信：weify3 ｜ 邮箱：weify3@qq.com

## 求职定位

目标岗位：大模型技术服务专家 TAM-AI 原生业务  
匹配关键词：AI Agent 技术栈设计、大模型应用落地、低代码 Agent 平台、知识向量库、模型交互优化、应用指令工程、代码生成、稳定性保障、企业级 AI 产品交付

## 职业摘要

计算机技术硕士，具备从模型训练、推理优化到 AI Agent 产品化落地的完整实践。近期在 WPS 表格 AI / DataAgent 场景中，参与 Agent 技术方案设计、AI Server 工程化迁移、工具链搭建、KOS / SpreadsheetBench 评测、失败 case 归因与 Agent RL 自动优化；过往在阅文 AIGC 攻坚项目中参与 72B 模型训练迭代、量化与推理压测。适合面向客户场景提供大模型应用方案、Agent 工程实施、模型交互优化与稳定性支持。

## JD 匹配亮点

- **AI Agent 技术栈设计：**参与 DataAgent 从 Demo 到 AI Server 多阶段 Agent 的架构演进，覆盖 main agent、sub agent、工具挂载、阶段化 prompt、验证纠偏、多轮对话、只读模式和意图澄清。
- **企业级 AI 应用落地：**在 WPS 表格 AI 场景中打通文件上传、WebOffice 执行、JS / Formula / Code 生成、KOS 评分、线上文档标注和回归验证等完整链路。
- **模型交互与指令优化：**建设 Prompt Manager、intent guard、APO / playbook 自动优化流程，将失败 case 转化为可验证经验，减少单纯人工调 prompt 的不可控性。
- **稳定性与服务保障：**围绕 clear range、undo、执行区域、错误残留、工具屏蔽、trace 证据链、评分报告等机制提升 Agent 可观测性与故障定位效率。
- **模型训练和推理优化：**在阅文参与 72B 模型训练数据构建、DeepSpeed 训练迭代、AWQ + vLLM 推理评测，实现 1.3-2 倍推理加速与约 5k / 月成本下降。

## 专业技能

- **大模型与 Agent：**LLM 接入、Multi-Agent、Single-Agent、Tool Calling、Skill / Playbook、Prompt Manager、Intent Guard、Human Feedback、JSON Schema
- **应用开发与交付：**Python、Go/Gin、JavaScript、Vue、WebOffice SDK、CDP 自动化、AI Gateway、KS3 / 在线文档集成
- **AI / 数据能力：**RAG、FAISS、LangChain、FastChat、表格解析、AI Sample、Formula / JS / Code 生成、Trace 分析
- **训练与推理：**PyTorch、Transformers、DeepSpeed、vLLM、AWQ、BERT、多模态特征融合
- **评测与质量：**KOS、SpreadsheetBench、自动评分、回归验证、失败 case 归因、经验生命周期管理

## 工作经历

### WPS 表格 AI / DataAgent｜AI Agent 研发｜2025.10 - 至今

- **Agent 方案设计与迁移：**参与 DataAgent in AI Server 架构迁移，围绕 Service-Agent-Tool 思路建设 main agent、sub agent、工具描述、参数 schema、prompt 模板与执行状态传递，使表格 AI 能在 AI Server 中以更标准的 Agent 工作流运行。
- **多阶段执行闭环：**将 main agent 拆分为任务规划、任务执行、验证纠偏等阶段，建设阶段 A/C/D prompt、工具屏蔽中间件、只读场景、多轮对话、undo、clear range 和结果验证机制，解决复杂表格任务中“做了什么、写到哪里、错了如何清理”的问题。
- **客户场景式问题处理：**围绕表格操作、数据分析、公式生成、代码生成等真实办公场景，持续从 bad case 中定位问题来源，包括表格结构理解不足、公式范围错误、JS API 误用、输出区域污染、通用问答误触发等，并通过 prompt、工具参数、校验链路和前端上下文共同修复。
- **Prompt Manager 与指令工程：**参与 prompt registry / store / render / manager / watcher 建设，将 prompt、agent info、tool info、工具参数 schema 统一管理，支持按业务模式和 agent 类型动态装配，降低多模型、多工具场景下的维护成本。
- **意图识别与澄清：**参与 intent gate / intent guard、意图澄清 agent、human feedback tool 建设，将通用问答、表格操作、模糊意图前置分流，并通过前端澄清卡片降低模型硬猜需求的风险。
- **JS / Formula / Code 生成优化：**建设 JSGen V2 的生成、检查、修正和后处理流程，针对模型容易改写公式、apply range、sheet name、二维数组写入、异步 JS API 等问题设计提示词与确定性修正策略。
- **评测平台与服务保障：**搭建 KOS 自动评测流水线，支持浏览器侧栏执行、DOM / HTML 留痕、文件上传、KSO 评分、日志记录和高频失败规则聚合；为 Agent 问题定位提供可追溯证据。
- **自动优化与 Agent RL：**参与 APO / meta-harness，将失败 case 通过 Reflect / Curate 生成 playbook 或 skill 经验，再通过连续通过、失败预算和回归分数门控验证效果；材料显示 Agent RL 自动流程将分数从 90 提升到 96。
- **业务影响：**相关材料显示 WPS AI (Seed 2.0) 在 SpreadsheetBench 榜单取得全球第二；团队目标包括复杂数分准确率 >90%、用户采纳率 80% 等方向，个人工作覆盖其中的 Agent 效果与评测优化链路。

### Excel AI Demo / 公式推荐 / 人工标注平台｜前后端与 Agent 联调｜2025.10 - 2026.01

- **Demo 到可交付链路：**基于 Go/Gin、WebOffice SDK 和前端页面，完成 Excel 文件上传、在线打开、SSE 流式对话、Agent 消息分块、生成 JS 捕获执行，让大模型输出能直接作用于表格。
- **生成代码执行：**适配 `js_gen_convert_output`、`formula_gen_valid_output` 等后端事件，支持 async/await WebOffice API、Application 显式注入、公式 / 数组公式写入和新 sheet 自动创建。
- **表格结构理解：**展示表结构 JSON、QingQiu 解析结果、标题 / 列标题区域、示例数据和当前选区 payload，为公式推荐与数据分析类 Agent 提供上下文。
- **人工评测平台：**建设多模型结果评审工具，支持标准答案与多个模型结果文件夹上传、云端文件预览、在线结果文档动态 schema 识别和标注结果回写，支撑模型效果对比与人工标注闭环。

### 阅文集团｜AIGC 攻坚项目组 技术序列实习｜2024.06 - 2024.09

- **大模型训练：**基于 DeepSpeed 参与线上 72B 导语模型的数据处理与训练迭代，产出三种数据构建策略下的模型版本。
- **预训练数据与效率：**清洗并构建通用模型预训练数据集，实现短样本 Packing 策略，提升输出遵循效果和训练效率，相关能力补充合并至 Transformers。
- **推理优化与压测：**使用 AWQ + vLLM 完成模型量化与推理评测，在满足压测要求和推理效果后实现 1.3-2 倍加速，服务成本降低约 5k / 月。
- **方案沉淀：**调研基座 / 垂类模型预训练与监督微调策略，输出文档支持组内实践。

### 美团｜快驴事业部 前端开发实习｜2021.05 - 2021.07

- **业务开发：**参与商户管理平台动态表单与页面埋点开发，使用 Vue / Vue Router 完成后台页面与交互功能。
- **组件沉淀：**为公共组件库贡献多个业务组件，提升团队复用效率。

## 代表项目

### 1. DataAgent in AI Server

项目定位：面向 WPS 表格复杂数据分析与自动化操作的 AI Agent 系统，将用户自然语言需求转化为表格公式、代码或 JS 操作。  
核心贡献：

- **架构迁移：**参与从多 Agent / 工具链路向 AI Server 阶段化 Agent 工作流迁移，统一 prompt、工具描述、参数 schema 和执行状态。
- **验证纠偏：**建设 clear range、undo、占用区域、增量数据、上一轮表格描述等机制，支持错误区域清理与多轮修正。
- **效果优化：**材料显示阶段化后 token 消耗从 30w+ 降至 10w+，产品 case 36/36 跑通，并推进 16/27 个产品 case 修复。

### 2. KOS / SpreadsheetBench 评测与 APO 自动优化

项目定位：为表格 Agent 提供可重复运行的评测、失败归因、经验注入与回归验证平台。  
核心贡献：

- **自动评测：**搭建从数据集读取、浏览器执行、文件上传、评分 API 到报告聚合的端到端评测管线。
- **失败归因：**提取 trace、diff、log、公式差异、mismatch 等证据，构造失败报告并压缩长上下文。
- **自动优化：**通过 Reflect / Curate 生成经验条目，使用连续通过和回归门控筛选可用经验，支撑 Agent RL 自动流程提分。

### 3. JSGen / Formula-to-JS 执行引擎

项目定位：将公式生成结果或自然语言表格操作转化为可在 WebOffice / WPS 表格中执行的 JS 代码。  
核心贡献：

- **双模式生成：**支持结构化 Formula 任务和通用操作描述，按新建 sheet、已有 sheet、apply range 等条件选择不同提示词。
- **校验修正：**结合模型校验与确定性字面量替换，减少公式、范围和 sheet 名被模型误改。
- **前端执行：**适配异步 WebOffice JS API，兼容后端流式事件差异，提升生成代码落地稳定性。

## 研究与论文

- **ACL 2023｜CDA：**提出结合数据增强的对比学习方法，用谈话转录文本进行阿尔茨海默症预诊断分类；基于 BERT-base 达到 SOTA，超过 ERNIE-large 方法。
- **Interspeech 2024｜MCI Detection：**提出多语言语音与文本特征融合 / 对齐方法，用于轻度认知障碍检测，实现 77.5% 准确率。

## 教育经历

**中南大学｜硕士｜计算机技术｜2022.09 - 2025.06**  
GPA：3.68；排名：4/289；一等奖学金（2023、2024）；光云 / 华锐奖学金；校优秀学生；班长。

**中南大学｜本科｜软件工程｜2018.09 - 2022.06**  
成绩：86.15；三等奖学金（2019、2020）；文体委员。

## 竞赛与荣誉

- **“华为杯”第五届中国研究生人工智能创新大赛｜国家级二等奖：**构建基于对话场景的阿尔茨海默症预诊断系统，测试集准确率 89.6%。
- **第十七届全国大学生软件创新大赛华南区域赛二等奖｜队长：**负责模型训练及前后端开发，构建口语交互与多模态疾病预诊断平台。
- **开源贡献：**Transformers Contributor、DeepSpeed Contributor。

## 面向 TAM-AI 岗位的补充说明

- **可对外沟通的技术故事：**“从表格 AI bad case 到 Agent 自动优化”的链路完整，适合向客户解释方案评估、部署实施、测试迭代和稳定性保障。
- **可展示的工程资产：**KOS 评测、APO、Prompt Manager、JSGen、intent guard、trace 证据链均可转化为客户方案中的工程模块。
- **建议补充信息：**若后续投递云原生 / K8S 强相关客户岗位，建议补充具体部署、监控、告警、SLO 或私有化交付细节。
