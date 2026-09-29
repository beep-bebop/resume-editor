# 魏方圆 | 大模型技术服务专家 / AI Agent 研发工程师

电话：13323755686 ｜ 微信：weify3 ｜ 邮箱：weify3@qq.com

## 职业摘要

2025 届计算机技术硕士，具备大模型训练、推理优化、RAG、AI Agent 工程化与表格 AI 产品落地经验。近期在 WPS 表格 AI / DataAgent 方向，参与从 Excel AI Demo、JS/Formula/Code 生成链路、AI Server 多阶段 Agent 架构，到 KOS / SpreadsheetBench 评测与 Agent RL 自动优化平台的建设；熟悉 Python、Go、JavaScript、PyTorch、DeepSpeed、vLLM、LangChain、Eino、AI Gateway、WebOffice/WPS JS API 等技术栈，能够面向业务场景完成 Agent 技术方案设计、工程搭建、测试评估与效果迭代。

## 核心技能

- **AI Agent 工程：**Multi-Agent / Single-Agent 架构、工具调用编排、意图分流、Human Feedback、Prompt Manager、Skill / Playbook 沉淀、Agent 评测与回归
- **大模型应用落地：**RAG、知识库问答、模型交互优化、结构化输出、JSON Schema 约束、提示词工程、错误恢复与结果校验
- **表格 AI / 数据分析：**Excel / WPS 表格操作、Formula / JS / Code 生成、表结构解析、AI Sample、SpreadsheetBench / KOS 评测
- **模型训练与推理：**PyTorch、Transformers、DeepSpeed、vLLM、AWQ、BERT、多模态特征融合、预训练 / SFT 数据处理
- **工程与工具：**Python、Go/Gin、JavaScript、Vue、FAISS、LangChain、FastChat、WebOffice SDK、CDP 自动化、KS3 / 在线文档集成

## 工作经历

### WPS 表格 AI / DataAgent 方向｜AI Agent 研发工程师｜2025.10 - 至今

- **Agent 架构升级：**参与 DataAgent 从 Demo 链路演进到 AI Server 多阶段 Agent 系统，围绕 main agent、sub agent、阶段化提示词、工具挂载、区域规划、验证纠偏、多轮对话与只读场景建立工程闭环。
- **Prompt Manager 工程化：**设计并推进 prompt registry / store / render / manager / watcher 等能力，将分散的 prompt、agent info、tool info 组织为可配置、可渲染、可校验的模板体系，支撑不同模式下 DataAgent 的统一装配。
- **执行稳定性优化：**围绕 answer position、output area、enable new sheet、clear range、undo、占用区域、增量表格描述等关键状态字段做约束化传递，减少表格操作中错位写入、错误残留和多轮污染。
- **阶段化与成本优化：**参与 main agent 阶段 A/C/D prompt 拆分、上下文裁剪、模型切换与单测适配；周报材料显示阶段化后 token 消耗从 30w+ 降到 10w+，产品 case 评测 36/36 跑通，并持续修复 16/27 个产品 case。
- **意图分流与交互：**建设 intent gate / intent guard / 意图澄清 agent / human feedback tool，将通用问答、表格操作、模糊意图前置区分，降低误触发复杂执行链路的概率。
- **JS / Formula / Code 生成链路：**参与 JSGen V2 的生成、检查、修正、后处理闭环，使用模型校验与确定性字符串修正结合，避免模型修改原始公式与 apply range，并对接公式生成的结构化子任务 JSON。
- **评测与自动优化平台：**搭建 KOS 自动评测流水线，串联数据集读取、浏览器侧栏执行、文件上传、评分 API、运行日志与报告分析；进一步参与 APO / meta-harness，把失败 case 转化为 playbook / skill 经验并做注入回归，使 Agent 优化从人工调参走向自动闭环。
- **榜单与效果支撑：**材料显示相关工作支撑 WPS AI (Seed 2.0) 在 SpreadsheetBench 榜单取得全球第二；Agent RL 自动流程将分数从 90 提升到 96。

### WPS Excel AI Demo / 人工评测平台｜前后端与 Agent 联调｜2025.10 - 2026.01

- **端到端 Demo 搭建：**基于 Go/Gin、WebOffice SDK 和前端静态资源，完成文件上传、在线打开、SSE 流式对话、Agent 消息渲染、生成 JS 捕获执行的 Excel AI 助手 Demo。
- **SSE 流式状态机：**实现前端增量解析、agent 分块展示、Markdown 渲染、工具噪声过滤、BeforeTools 隐藏和 report 合并，将多 Agent 流式输出转成用户可读的前端体验。
- **公式自动落表：**处理 `formula_gen_valid_output` 事件，自动创建结果 sheet，根据 task shape 判断普通公式或数组公式，并动态推导写入范围，使公式推荐从文本输出升级为可执行表格产物。
- **表结构与公式推荐：**加入表结构 JSON 展示、QingQiu 解析结果、标题/列标题标记、示例数据展示和当前选区公式推荐 payload，为公式伴写与表格理解提供上下文。
- **人工标注平台：**实现标准答案与多模型结果文件夹上传、云端文件预览、在线结果文档 schema 动态识别、模型列自动定位和标注结果回写，支持多模型结果横向评审。

### 阅文集团｜AIGC 攻坚项目组 技术序列实习｜2024.06 - 2024.09

- **72B 模型训练迭代：**基于 DeepSpeed 参与线上 72B 导语模型的数据处理和训练迭代，产出三种数据构建策略下的模型版本。
- **预训练数据优化：**清洗并构建通用模型预训练数据集，实现短样本 Packing 策略，将 Attention 限制在短样本内而非整条数据内，提升输出遵循效果与训练效率，并补充合并至 Transformers。
- **推理压测与成本优化：**使用 AWQ + vLLM 完成组内模型量化与推理评测，在满足压测要求和效果后实现 1.3-2 倍推理加速，服务成本降低约 5k / 月。
- **技术调研沉淀：**调研基座 / 垂类模型预训练与监督微调阶段训练策略，输出多份文档供组内实践参考。

### 美团｜快驴事业部 前端开发实习｜2021.05 - 2021.07

- **业务平台开发：**参与商户管理平台动态表单、页面埋点等功能开发，使用 Vue、Vue Router 等技术栈完成页面与交互实现。
- **组件沉淀：**为公共组件库贡献若干业务组件，提高类似后台页面的复用效率。

## 项目经历

### KOS / SpreadsheetBench 自动评测与 APO 自动提示词优化

- **评测流水线：**搭建 EvaluationPipeline，将样本迭代、文件准备、AI Agent 推理、产物上传、评分、日志记录和报告分析串成端到端流程。
- **浏览器自动化：**通过 Chrome DevTools Protocol 定位 WPS / Kdocs 页面与侧栏扩展，完成页面导航、输入发送、DOM 快照采集、HTML 留痕和执行状态检测。
- **失败驱动优化：**实现 Run Batch -> Analyze -> Observe -> Reflect -> Curate -> Inject -> Re-run 闭环，把失败 case 转化为可验证、可回归的 playbook 经验条目。
- **回归门控：**引入连续通过、失败预算、回归分数门控、经验生命周期状态机，避免局部经验污染生产 prompt 或导致整体退化。

### DataAgent JSGen / Formula-to-JS 表格执行引擎

- **生成闭环：**将 JS 生成从单次 LLM 输出升级为 Generate -> Validate -> Correct -> PostMerge 的 GenAgent 化流程，支持公式任务和自然语言表格操作两类输入。
- **确定性校验：**通过解析 JS 代码中的 Range 与 Formula / FormulaArray 字面量，按任务顺序对齐原始公式和应用区域，减少模型擅自改写关键参数导致的执行失败。
- **表格操作规范：**补充新建 sheet、已有 sheet、公式写入、二维数组写入、删除 / 插入行、异步 WPS JS API 等提示词与例子，提升真实表格环境下的可执行性。

### 智慧党建｜国网长沙供电公司经济技术研究所合作项目｜2023.10 - 2024.01

- **知识库问答：**基于 ChatGLM3、LangChain、FastChat 搭建本地党建问答平台，支持面向本地知识库与数据库的问答。
- **RAG 检索：**使用微调后的 M3E 嵌入模型向量化党建文档，以 FAISS 构建索引，通过相似度召回文本块并构建 prompt 指导大模型回答。
- **推理加速：**使用 vLLM 提升本地大模型推理速度，改善知识库问答响应体验。

## 研究经历

- **CDA: A Contrastive Data Augmentation Method for Alzheimer's Disease Detection｜ACL 2023（CCF-A）：**提出结合数据增强的对比学习方法，使用谈话转录文本进行认知障碍预诊断分类；通过 Margin Loss、R-Drop 等策略增强模型区分能力，基于 BERT-base 达到 SOTA，并超过基于 ERNIE-large 的方法。
- **Pre-trained Feature Fusion and Matching for Mild Cognitive Impairment Detection｜Interspeech 2024：**提出多模态特征融合与对齐方法，使用多语言预训练模型和韵律单元编码器处理多语言轻度认知障碍检测，实现 77.5% 准确率。

## 教育经历

**中南大学｜硕士｜计算机技术｜2022.09 - 2025.06**

- GPA：3.68；排名：4/289；一等奖学金（2023、2024）；光云 / 华锐奖学金（2023）；校优秀学生；班长。

**中南大学｜本科｜软件工程｜2018.09 - 2022.06**

- 成绩：86.15；三等奖学金（2019、2020）；文体委员。

## 竞赛与荣誉

- **“华为杯”第五届中国研究生人工智能创新大赛｜国家级二等奖｜2023：**构建基于对话场景的阿尔茨海默症预诊断系统，采用 LayerDrop、SpecAugment 等方法增强泛化能力，测试集准确率 89.6%。
- **第十七届全国大学生软件创新大赛华南区域赛二等奖｜队长｜2023-2024：**负责模型训练及前后端开发，构建基于口语交互和多模态模型的疾病预诊断平台。
- **开源 / 论文：**ACL 2023、Interspeech 2024；Transformers Contributor、DeepSpeed Contributor。
