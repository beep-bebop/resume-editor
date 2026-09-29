# 魏方圆

电话：13323755686 ｜ 微信：weify3 ｜ 邮箱：weify3@qq.com  
求职方向：大模型技术服务专家 / AI Agent 研发 / 大模型应用解决方案工程师

## 个人简介

计算机技术硕士，专注大模型应用与 AI Agent 工程化落地，具备模型训练、推理优化、RAG、表格 AI Agent、评测平台与自动优化系统经验。近期围绕 WPS 表格 AI / DataAgent，参与从 WebOffice Demo 到 AI Server 多阶段 Agent、KOS/SpreadsheetBench 评测、APO/Agent RL 自动优化闭环的建设，能够将真实业务问题拆解为可执行的 Agent 技术方案并持续迭代效果。

## 专业技能

- **Agent 架构与工程化：**Multi-Agent / Single-Agent、阶段化 Agent、Tool / Skill 编排、Prompt Manager、Intent Guard、Human Feedback、验证纠偏、上下文裁剪
- **大模型应用：**RAG、结构化输出、JSON Schema、Prompt Engineering、模型效果评估、Trace 分析、失败案例归因、Playbook / Skill 经验沉淀
- **表格 AI：**Formula / JS / Code 生成、WebOffice / WPS JS API、表格解析、AI Sample、SpreadsheetBench、KOS、自动评分与回归验证
- **训练与推理：**PyTorch、Transformers、DeepSpeed、vLLM、AWQ、BERT、多模态特征融合、预训练数据处理
- **工程栈：**Python、Go/Gin、JavaScript、Vue、LangChain、FastChat、FAISS、Eino、AI Gateway、CDP 自动化

## 工作经历

### WPS 表格 AI / DataAgent｜AI Agent 研发｜2025.10 - 至今

- **多阶段 Agent 架构：**为解决表格 Agent 在规划、执行、验证、纠偏中规则冲突和上下文膨胀的问题，参与 main agent 阶段化拆分，建设阶段 A/C/D prompt、工具屏蔽、只读模式、多轮对话、undo、clear range 等机制，推动 DataAgent 从单轮工具调用演进为可恢复的多阶段执行系统。
- **Prompt 管理平台：**为降低 prompt、agent info、tool info 分散维护成本，参与设计 prompt registry / store / render / manager / watcher，将工具描述、Agent 描述、参数 schema 和业务模式模板统一装配，支撑 AI Server 中多类 DataAgent 模式复用。
- **状态与位置约束：**针对表格操作中常见的写入错位、错误答案残留、模型擅自推断区域等问题，围绕 answer position、output area、enable new sheet、clear range、占用区域、增量表格描述建立显式传递规则，提升复杂表格任务的执行可控性。
- **效果与成本优化：**通过上下文裁剪、阶段化 prompt、模型切换和单测适配，支撑 main agent token 消耗从 30w+ 降至 10w+；周报材料显示产品 case 评测 36/36 跑通，并推进 16/27 个产品 case 修复。
- **意图分流与交互闭环：**参与 intent gate / intent guard、意图澄清 agent、human feedback tool 建设，将通用问答、表格操作和模糊意图区分，避免低复杂任务误进入完整 DataAgent 链路。
- **JSGen 生成纠错链路：**将 JS 生成从一次性提示词输出升级为“生成-检查-修正-检查-下发”的闭环；提取生成代码中的 Range 和 Formula 字面量，按位填回原始 JSON，避免模型改写 apply range 和公式。
- **评测与训练基础设施：**搭建 KOS 评测脚本与浏览器自动化执行链路，支持样本读取、文件上传、侧栏执行、KSO 评分、日志留存与报告聚合；参与 APO / meta-harness，将失败 case 转化为 playbook / skill 经验并做回归验证。
- **业务成果支撑：**材料显示相关工作支撑 WPS AI (Seed 2.0) 取得 SpreadsheetBench 全球第二；Agent RL 自动流程将分数从 90 提升到 96。

### Excel AI Demo / 人工评测平台｜前后端与 Agent 联调｜2025.10 - 2026.01

- **端到端链路打通：**从零搭建 Go/Gin + WebOffice Excel AI Demo，打通文件上传、在线打开、SSE 流式对话、Agent 消息解析、生成 JS 捕获与执行链路，使“用户提问 -> Agent 生成操作 -> 表格执行”可演示。
- **流式输出治理：**实现 SSE 增量解析和 Agent 分块状态机，对工具 JSON、BeforeTools、中间日志、report 团队输出进行过滤和归并，减少后端执行噪声，提升前端可读性。
- **公式推荐落表：**解析 `formula_gen_valid_output` 事件，依据 task shape 自动选择普通公式或数组公式，并推导写入 range，使公式生成结果可直接在新 sheet 中验证。
- **表结构可视化：**接入表结构 JSON、QingQiu 解析结果、标题 / 列标题标记、示例数据展示和当前选区 payload，为公式推荐和表格理解提供结构化上下文。
- **评测标注平台：**建设多模型结果横向评审工具，支持标准答案与多个模型结果文件夹上传、云端预览、在线结果表 schema 动态识别和标注结果回写。

### 阅文集团｜AIGC 攻坚项目组｜技术序列实习｜2024.06 - 2024.09

- **模型训练迭代：**基于 DeepSpeed 参与线上 72B 导语模型的数据处理和训练迭代，产出三种数据构建策略下的模型版本。
- **数据与训练效率优化：**清洗并构建预训练数据集，实现短样本 Packing 策略，限制 Attention 作用域以提升输出遵循效果与训练效率，并补充合并至 Transformers。
- **推理优化：**使用 AWQ + vLLM 对组内模型进行量化和推理评测，在满足压测要求和效果后实现 1.3-2 倍推理加速，服务成本降低约 5k / 月。
- **策略沉淀：**调研基座 / 垂类模型预训练与监督微调策略，输出文档支持组内训练实践。

### 美团｜快驴事业部｜前端开发实习｜2021.05 - 2021.07

- **后台系统开发：**参与商户管理平台动态表单和页面埋点开发，使用 Vue / Vue Router 完成业务页面与交互实现。
- **组件复用：**为公共组件库贡献多个组件，提升后台页面开发复用效率。

## 重点项目

### APO / meta-harness：失败驱动的 Agent 自动优化系统

- **优化闭环：**设计 Run Batch -> Analyze -> Observe -> Reflect -> Curate -> Inject -> Re-run 流程，将 SpreadsheetBench / KOS 失败 case 转成可验证经验。
- **经验生命周期：**引入 NEW、VERIFYING、SELF_CHECK_PASSED、USABLE、FAILED_CHECK 等状态，以及连续通过、失败预算和回归分数门控，避免错误经验污染生产 prompt。
- **Trace 证据链：**通过 trace、diff、log、公式差异、mismatch 等证据构造失败报告，并对长上下文做保留优先级和截断处理。

### JSGen / Formula-to-JS 表格执行引擎

- **双模式生成：**支持 Formula 结构化任务和自然语言表格操作两类输入，根据是否新建 sheet、是否已有 sheet、apply range 等路由到不同提示词规范。
- **混合校验：**结合 LLM 校验与确定性字符串修正，解决公式被误改、Range 不一致、JSON 引号破坏、二维数组写入错误等高频失败。
- **前端执行适配：**支持 async/await WebOffice JS API，显式注入 Application 对象，并兼容 `message_chunks` 为空但 `content` 含代码等后端协议差异。

### 智慧党建知识库问答平台｜2023.10 - 2024.01

- **RAG 问答：**基于 ChatGLM3、LangChain、FastChat 搭建本地知识库问答平台；使用 M3E 嵌入模型和 FAISS 构建检索索引。
- **推理加速：**使用 vLLM 提升本地大模型推理速度，支持面向党建文档和数据库的问答。

## 研究经历

### CDA: A Contrastive Data Augmentation Method for Alzheimer's Disease Detection｜ACL 2023

- **对比学习方法：**提出结合数据增强的对比学习方法，用谈话转录文本进行认知障碍预诊断分类。
- **模型效果：**设置 Margin Loss 学习负样本与错样本差异，通过 R-Drop 构造正样本并正则化，基于 BERT-base 达到 SOTA，超过基于 ERNIE-large 的方法。

### Pre-trained Feature Fusion and Matching for Mild Cognitive Impairment Detection｜Interspeech 2024

- **多模态融合：**提出多语言语音与文本特征融合 / 对齐方法，使用预训练模型和韵律单元编码器处理多语言轻度认知障碍检测。
- **结果表现：**结合数据增强和音频-文本匹配对齐方法，实现 77.5% 准确率。

## 教育经历

**中南大学｜硕士｜计算机技术｜2022.09 - 2025.06**  
GPA：3.68；排名：4/289；一等奖学金（2023、2024）；光云 / 华锐奖学金（2023）；校优秀学生；班长。

**中南大学｜本科｜软件工程｜2018.09 - 2022.06**  
成绩：86.15；三等奖学金（2019、2020）；文体委员。

## 竞赛与荣誉

- **“华为杯”第五届中国研究生人工智能创新大赛｜国家级二等奖：**构建对话场景阿尔茨海默症预诊断系统，采用 LayerDrop、SpecAugment 提升泛化能力，测试集准确率 89.6%。
- **第十七届全国大学生软件创新大赛华南区域赛二等奖｜队长：**负责模型训练及前后端开发，构建口语交互与多模态疾病预诊断平台。
- **开源贡献：**Transformers Contributor、DeepSpeed Contributor。
