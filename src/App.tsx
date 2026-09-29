import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import PdfPreview from "./PdfPreview";
import { chartMarkdown, editableBlocks, replaceEditableBlock, tableMarkdown } from "./blocks";
import { deleteResume, listResumes, repositoryUrl, saveResume } from "./github";
import {
  DEFAULT_SETTINGS, displayName, fileStem, joinRawSections, parseStoredMarkdown,
  safeFileName, serializeResume, splitRawSections, type RawSection, type Resume, type Settings,
} from "./model";
import { generatePdf, inspectPdf } from "./pdf";

const STORAGE_KEY = "resume-studio-library-v2";
const ACTIVE_KEY = "resume-studio-active-v2";
const defaultMarkdown = "# 你的姓名\n\n## 个人基本信息\n电话： ｜ 邮箱：\n求职方向：\n\n## 工作经历\n\n### 公司｜岗位｜起止时间\n- **成果：**用数字说明你完成的工作。\n\n## 教育背景\n\n### 学校｜专业｜学历\n";

function readDrafts(): Resume[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Resume[];
    return Array.isArray(value)
      ? value.filter((resume) => resume && typeof resume.fileName === "string" && typeof resume.markdown === "string")
        .map((resume) => ({ ...resume, settings: { ...DEFAULT_SETTINGS, ...resume.settings } }))
      : [];
  } catch { return []; }
}

function isDirty(resume: Resume): boolean {
  return !resume.committedBody || serializeResume(resume) !== resume.committedBody;
}

function mergeRemote(local: Resume[], remote: Resume[]): { resumes: Resume[]; conflicts: number } {
  const byName = new Map(remote.map((resume) => [resume.fileName, resume]));
  let conflicts = 0;
  const merged = local.map((draft) => {
    const incoming = byName.get(draft.fileName);
    if (!incoming) return draft;
    byName.delete(draft.fileName);
    if (incoming.sha === draft.sha) return draft;
    if (!isDirty(draft)) return incoming;
    conflicts++;
    return draft;
  });
  return { resumes: [...merged, ...byName.values()].sort((a, b) => a.fileName.localeCompare(b.fileName, "zh-CN")), conflicts };
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function NumberControl({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="number-control">
      <span>{label}<small>{unit}</small></span>
      <input type="number" value={value} min={min} max={max} step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next)));
        }} />
    </label>
  );
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-control"><span>{label}</span><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><code>{value}</code></label>;
}

function BlockEditor({ body, onChange }: { body: string; onChange: (next: string) => void }) {
  const blocks = editableBlocks(body);
  const replace = (block: (typeof blocks)[number], markdown: string) =>
    onChange(replaceEditableBlock(body, block, markdown));
  if (!blocks.length) return null;
  return <details className="block-editor">
    <summary>直观编辑要点、表格和图表 <span>{blocks.length} 项</span></summary>
    <div className="block-editor-content">
    {blocks.map((block, blockIndex) => {
      if (block.kind === "bullet") return <label className="bullet-editor" key={blockIndex}>
        <span>要点 {blockIndex + 1}</span>
        <input value={block.text || ""} onChange={(event) => replace(block, "- " + event.target.value)} />
        <button aria-label="删除要点" onClick={() => replace(block, "")}>×</button>
      </label>;
      const rows = block.rows || [];
      const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
        const next = rows.map((row) => [...row]);
        next[rowIndex][cellIndex] = value;
        replace(block, block.kind === "table" ? tableMarkdown(next) : chartMarkdown(next));
      };
      const addRow = () => {
        const columns = block.kind === "table" ? Math.max(1, rows[0]?.length || 2) : 2;
        const next = [...rows, Array(columns).fill("")];
        replace(block, block.kind === "table" ? tableMarkdown(next) : chartMarkdown(next));
      };
      return <div className="data-editor" key={blockIndex}>
        <div className="data-editor-heading"><b>{block.kind === "table" ? "表格" : "图表"}</b><button onClick={() => replace(block, "")}>删除</button></div>
        {rows.map((row, rowIndex) => <div className="data-row" key={rowIndex}>
          {row.map((cell, cellIndex) => <input key={cellIndex} aria-label={(block.kind === "table" ? "表格" : "图表") + "第 " + (rowIndex + 1) + " 行第 " + (cellIndex + 1) + " 列"}
            type={block.kind === "chart" && cellIndex === 1 ? "number" : "text"} value={cell}
            onChange={(event) => updateCell(rowIndex, cellIndex, event.target.value)} />)}
          {rowIndex > 0 && <button aria-label="删除行" onClick={() => {
            const next = rows.filter((_, index) => index !== rowIndex);
            replace(block, block.kind === "table" ? tableMarkdown(next) : chartMarkdown(next));
          }}>×</button>}
        </div>)}
        <div className="data-editor-actions">
          <button onClick={addRow}>＋ 添加行</button>
          {block.kind === "table" && <button onClick={() => replace(block, tableMarkdown(rows.map((row) => [...row, ""]))) }>＋ 添加列</button>}
        </div>
      </div>;
    })}
    </div>
  </details>;
}

export default function App() {
  const [resumes, setResumes] = useState<Resume[]>(readDrafts);
  const [activeName, setActiveName] = useState(() => localStorage.getItem(ACTIVE_KEY) || "");
  const [token, setToken] = useState("");
  const [screen, setScreen] = useState<"library" | "editor" | "settings">("library");
  const [autoSaveMinutes, setAutoSaveMinutes] = useState(() => Number(localStorage.getItem("resume-studio-auto-save") || "0"));
  const [status, setStatus] = useState("正在载入简历库…");
  const [busy, setBusy] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pages: number; widthMm: number; heightMm: number } | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [rendering, setRendering] = useState(false);
  const [zoom, setZoom] = useState(0.75);
  const [guideOpen, setGuideOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"sections" | "markdown">("sections");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const fileInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const editorInput = useRef<HTMLTextAreaElement>(null);
  const initialLoad = useRef(false);
  const resumesRef = useRef(resumes);
  const busyRef = useRef(busy);

  const active = resumes.find((resume) => resume.fileName === activeName) || resumes[0] || null;
  const activeFileName = active?.fileName || "";
  const activeDirty = active ? isDirty(active) : false;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    resumesRef.current = resumes;
  }, [resumes]);
  useEffect(() => { busyRef.current = busy; }, [busy]);
  useEffect(() => { localStorage.setItem("resume-studio-auto-save", String(autoSaveMinutes)); }, [autoSaveMinutes]);
  useEffect(() => {
    if (activeFileName) localStorage.setItem(ACTIVE_KEY, activeFileName);
  }, [activeFileName]);

  useEffect(() => {
    if (initialLoad.current) return;
    initialLoad.current = true;
    void (async () => {
      try {
        const remote = await listResumes();
        setResumes((current) => mergeRemote(current, remote).resumes);
        setStatus("已载入简历库。修改会先保存在此浏览器，点击“保存”同步到云端。");
      } catch {
        try {
          const manifest = await fetch(import.meta.env.BASE_URL + "resumes/index.json").then((response) => response.json()) as string[];
          const bundled = await Promise.all(manifest.map(async (fileName) => {
            const body = await fetch(import.meta.env.BASE_URL + "resumes/" + encodeURIComponent(fileName)).then((response) => response.text());
            const parsed = parseStoredMarkdown(body);
            const resume: Resume = { fileName, ...parsed, updatedAt: Date.now() };
            resume.committedBody = serializeResume(resume);
            return resume;
          }));
          setResumes((current) => mergeRemote(current, bundled).resumes);
          setStatus("已载入站点内的简历。GitHub 暂时不可用；本机草稿仍可编辑。");
        } catch {
          setStatus("暂时无法读取仓库。可新建简历或导入 MD。");
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!active || screen === "library") { setPdfBlob(null); setPdfInfo(null); setRendering(false); return; }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setRendering(true);
      setPdfError("");
      void generatePdf(active)
        .then(async (blob) => {
          const info = await inspectPdf(blob);
          if (!cancelled) { setPdfBlob(blob); setPdfInfo(info); }
        })
        .catch((error: Error) => {
          if (!cancelled) setPdfError("PDF 生成失败：" + error.message);
        })
        .finally(() => { if (!cancelled) setRendering(false); });
    }, 450);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [active, screen]);

  const ordered = useMemo(() => [...resumes].sort((a, b) => a.fileName.localeCompare(b.fileName, "zh-CN")), [resumes]);
  const rawDocument = useMemo(() => splitRawSections(active?.markdown || ""), [active?.markdown]);
  const updateActive = (changes: Partial<Resume>) => {
    if (!active) return;
    setResumes((current) => current.map((resume) =>
      resume.fileName === active.fileName ? { ...resume, ...changes, updatedAt: Date.now() } : resume,
    ));
  };
  const updateSettings = (changes: Partial<Settings>) => {
    if (!active) return;
    updateActive({ settings: { ...active.settings, ...changes } });
  };
  const insertMarkdown = (snippet: string) => {
    if (!active) return;
    const field = editorInput.current;
    const start = field?.selectionStart ?? active.markdown.length;
    const end = field?.selectionEnd ?? start;
    const next = active.markdown.slice(0, start) + snippet + active.markdown.slice(end);
    updateActive({ markdown: next });
    window.requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  };
  const setSections = (sections: RawSection[], preamble = rawDocument.preamble) => {
    updateActive({ markdown: joinRawSections(preamble, sections) });
  };
  const changeName = (name: string) => {
    const preamble = rawDocument.preamble.match(/^#[ \t]+.*$/m)
      ? rawDocument.preamble.replace(/^#[ \t]+.*$/m, "# " + name)
      : "# " + name + "\n\n" + rawDocument.preamble;
    setSections(rawDocument.sections, preamble);
  };
  const editSection = (index: number, changes: Partial<RawSection>) => {
    const next = rawDocument.sections.map((section, position) =>
      position === index ? { ...section, ...changes } : section,
    );
    setSections(next);
  };
  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rawDocument.sections.length ||
      rawDocument.sections[index].info || rawDocument.sections[target].info) return;
    const next = [...rawDocument.sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };
  const addSection = () => {
    if (!active) return;
    updateActive({ markdown: active.markdown.trimEnd() + "\n\n## 新模块\n\n### 经历标题\n- **成果：**描述结果\n" });
  };
  const removeSection = (index: number) => {
    const section = rawDocument.sections[index];
    if (!section || !window.confirm("删除模块“" + section.title + "”？")) return;
    setSections(rawDocument.sections.filter((_, position) => position !== index));
  };
  const applyPreset = (preset: "minimal" | "classic" | "modern") => {
    if (!active) return;
    const options: Record<typeof preset, Partial<Settings>> = {
      minimal: {
        headingFontFamily: "sans", fontFamily: "sans",
        accentColor: "#252a30", dividerColor: "#cfd2d4",
        dividerWidth: .75, sectionGap: 12, bulletStyle: "dash",
      },
      classic: {
        headingFontFamily: "serif", fontFamily: "serif",
        accentColor: "#314b5a", dividerColor: "#93a7af",
        dividerWidth: 1.25, sectionGap: 16, bulletStyle: "dot",
      },
      modern: {
        headingFontFamily: "sans", fontFamily: "sans",
        accentColor: "#d75b18", dividerColor: "#d7d4ce",
        dividerWidth: 1.5, sectionGap: 13, bulletStyle: "diamond",
      },
    };
    updateSettings(options[preset]);
  };

  const refresh = async () => {
    setBusy(true);
    try {
      const remote = await listResumes(token);
      const merged = mergeRemote(resumes, remote);
      setResumes(merged.resumes);
      setStatus(merged.conflicts
        ? "检测到 " + merged.conflicts + " 个版本冲突。本机草稿已保留，请下载 MD 备份后处理。"
        : "已从 GitHub 刷新简历库。");
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  };

  const commit = async () => {
    if (!active) return;
    if (!token.trim()) {
      setScreen("settings");
      setStatus("请在设置中填写 GitHub 令牌，然后保存。");
      return;
    }
    setBusy(true);
    try {
      const saved = await saveResume(active, token.trim());
      setResumes((current) => current.map((resume) => resume.fileName === saved.fileName ? saved : resume));
      setStatus("已保存 " + active.fileName + "。其他设备刷新简历库即可读取。");
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (!autoSaveMinutes || !token.trim()) return;
    const timer = window.setInterval(() => {
      if (busyRef.current) return;
      const pending = resumesRef.current.filter(isDirty);
      if (!pending.length) return;
      busyRef.current = true;
      void (async () => {
        try {
          for (const draft of pending) {
            const saved = await saveResume(draft, token.trim());
            setResumes((current) => current.map((item) => {
              if (item.fileName !== saved.fileName) return item;
              return serializeResume(item) === serializeResume(draft)
                ? saved : { ...item, sha: saved.sha, committedBody: saved.committedBody };
            }));
          }
          setStatus("自动保存完成：" + pending.length + " 份简历已同步。");
        } catch (error) { setStatus("自动保存失败：" + (error as Error).message); }
        finally { busyRef.current = false; }
      })();
    }, autoSaveMinutes * 60_000);
    return () => window.clearInterval(timer);
  }, [autoSaveMinutes, token]);

  const create = () => {
    const title = window.prompt("新简历名称", "新简历");
    if (title === null) return;
    let fileName = safeFileName(title);
    let suffix = 2;
    while (resumes.some((resume) => resume.fileName === fileName)) {
      fileName = safeFileName(title + "-" + suffix++);
    }
    const resume: Resume = {
      fileName, markdown: defaultMarkdown.replace("你的姓名", title.trim() || "你的姓名"),
      settings: { ...DEFAULT_SETTINGS }, updatedAt: Date.now(),
    };
    setResumes((current) => [...current, resume]);
    setActiveName(fileName);
    setScreen("editor");
    setStatus("已新建本机草稿。填写后点击“保存”即可跨设备访问。");
  };

  const duplicate = () => {
    if (!active) return;
    let fileName = safeFileName(fileStem(active.fileName) + "-副本");
    let suffix = 2;
    while (resumes.some((resume) => resume.fileName === fileName)) {
      fileName = safeFileName(fileStem(active.fileName) + "-副本-" + suffix++);
    }
    setResumes((current) => [...current, {
      ...active, fileName, sha: undefined, committedBody: undefined, updatedAt: Date.now(),
    }]);
    setActiveName(fileName);
    setScreen("editor");
    setStatus("已复制为新草稿。");
  };

  const rename = () => {
    if (!active) return;
    const title = window.prompt("修改简历标题（文件名保持不变）", displayName(active));
    if (!title?.trim()) return;
    const markdown = active.markdown.match(/^#\s+.+$/m)
      ? active.markdown.replace(/^#\s+.+$/m, "# " + title.trim())
      : "# " + title.trim() + "\n\n" + active.markdown;
    updateActive({ markdown });
  };

  const remove = async () => {
    if (!active) return;
    if (active.sha && !token.trim()) {
      setScreen("settings");
      setStatus("删除云端简历前，请先在设置中填写 GitHub 令牌。");
      return;
    }
    if (!window.confirm("删除“" + active.fileName + "”？云端和本机简历库都会移除。")) return;
    setBusy(true);
    try {
      await deleteResume(active, token.trim());
      setResumes((current) => current.filter((resume) => resume.fileName !== active.fileName));
      setActiveName(resumes.find((resume) => resume.fileName !== active.fileName)?.fileName || "");
      setStatus("已删除 " + active.fileName + "。");
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  };

  const importMd = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imported: Resume[] = [];
    for (const file of files) {
      const parsed = parseStoredMarkdown(await file.text());
      let fileName = safeFileName(file.name.replace(/\.md$/i, ""));
      let suffix = 2;
      while ([...resumes, ...imported].some((resume) => resume.fileName === fileName)) {
        fileName = safeFileName(fileStem(file.name) + "-导入-" + suffix++);
      }
      imported.push({ fileName, ...parsed, updatedAt: Date.now() });
    }
    setResumes((current) => [...current, ...imported]);
    if (imported[0]) setActiveName(imported[0].fileName);
    if (imported[0]) setScreen("editor");
    setStatus("已导入 " + imported.length + " 份 MD 到本机草稿。");
    event.target.value = "";
  };

  const changePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !active) return;
    const image = new window.Image();
    const temporaryUrl = URL.createObjectURL(file);
    image.src = temporaryUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    const ratio = Math.min(1, 600 / image.width, 800 / image.height);
    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    updateSettings({ photo: canvas.toDataURL("image/jpeg", .82) });
    URL.revokeObjectURL(temporaryUrl);
    event.target.value = "";
  };

  const applyPaper = (paper: Settings["paper"]) => {
    if (paper === "A4") updateSettings({ paper, widthMm: 210, heightMm: 297, mode: "paged" });
    else if (paper === "Letter") updateSettings({ paper, widthMm: 216, heightMm: 279, mode: "paged" });
    else updateSettings({ paper });
  };

  return (
    <main className={"app screen-" + screen}>
      <header className="topbar">
        <div className="brand"><span className="brand-icon">R</span><div><strong>Resume Studio</strong><small>Markdown 简历工作台</small></div></div>
        <nav className="main-tabs" aria-label="主导航">
          <button className={screen === "library" ? "active" : ""} onClick={() => setScreen("library")}>简历库</button>
          <button className={screen === "editor" ? "active" : ""} onClick={() => setScreen("editor")}>编辑</button>
          <button className={screen === "settings" ? "active" : ""} onClick={() => setScreen("settings")}>设置</button>
        </nav>
        <div className="top-actions">
          <span className={"sync-state " + (activeDirty ? "is-dirty" : "")}>{activeDirty ? "尚未保存到云端" : "已保存"}</span>
          <button onClick={() => void refresh()} disabled={busy}>刷新</button>
          <button className="primary" onClick={() => void commit()} disabled={busy || !active}>保存</button>
          <button className="dark" onClick={() => pdfBlob && download(pdfBlob, fileStem(activeFileName) + ".pdf")} disabled={!pdfBlob || rendering}>下载 PDF</button>
        </div>
      </header>
      <div className="mobile-tabs">
        {(["edit", "preview"] as const).map((tab) =>
          <button className={mobileTab === tab ? "active" : ""} key={tab} onClick={() => setMobileTab(tab)}>
            {tab === "edit" ? "Markdown 内容" : "PDF 预览"}
          </button>,
        )}
      </div>
      <div className="workspace">
        <aside className={"editor-pane mobile-" + mobileTab}>
          <section className="library">
            <div className="section-heading"><div><small>LIBRARY</small><h2>简历库 <em>{resumes.length}</em></h2></div><button className="subtle" onClick={create}>＋ 新建</button></div>
            <div className="library-list">
              {ordered.map((resume) => (
                <button key={resume.fileName} className={"library-item " + (activeFileName === resume.fileName ? "selected" : "")}
                  onClick={() => { setActiveName(resume.fileName); setScreen("editor"); }}>
                  <span className="library-avatar">{displayName(resume).slice(0, 1)}</span>
                  <span className="library-copy"><b>{displayName(resume)}</b><small>{resume.fileName}</small></span>
                  {isDirty(resume) && <i aria-label="未保存" />}
                </button>
              ))}
              {!resumes.length && <p className="empty-list">还没有简历。新建或导入一份 Markdown。</p>}
            </div>
            <div className="library-actions">
              <button onClick={() => fileInput.current?.click()}>导入 MD</button>
              <button onClick={duplicate} disabled={!active}>复制</button>
              <button onClick={rename} disabled={!active}>改标题</button>
              <button onClick={() => active && download(new Blob([serializeResume(active)], { type: "text/markdown" }), active.fileName)} disabled={!active}>下载 MD</button>
              <button className="danger" onClick={() => void remove()} disabled={!active || busy}>删除</button>
            </div>
          </section>
          <section className="editor-section">
            <div className="section-heading"><div><small>CONTENT</small><h2>编辑内容</h2></div><button className="subtle" onClick={() => setGuideOpen(!guideOpen)}>{guideOpen ? "收起指南" : "格式指南"}</button></div>
            <div className="segmented editor-mode" role="group" aria-label="编辑方式">
              <button className={editorMode === "sections" ? "active" : ""} onClick={() => setEditorMode("sections")}>模块编辑</button>
              <button className={editorMode === "markdown" ? "active" : ""} onClick={() => setEditorMode("markdown")}>Markdown 源码</button>
            </div>
            {guideOpen && <div className="guide">
              <h3>Markdown 与 PDF 对照</h3>
              <div><code># 姓名</code><span>页首姓名</span></div>
              <div><code>## 个人基本信息</code><span>页首联系方式，不显示模块标题</span></div>
              <div><code>## 工作经历</code><span>带分割线的模块标题</span></div>
              <div><code>### 公司｜岗位</code><span>经历标题</span></div>
              <div><code>#### 项目名称</code><span>项目小标题</span></div>
              <div><code>- 成果描述</code><span>列表标记；样式、大小和粗细可在设置中调整</span></div>
              <div><code>**重点**</code><span>加粗；反引号包围的文字显示为强调色</span></div>
              <div><code>| 项目 | 结果 |</code><span>表格；下一行用 |---|---| 分隔表头</span></div>
              <div><code>:::chart</code><span>柱状图；每行写 标签 | 数值，最后用 ::: 结束</span></div>
              <p>每个块单独占一行。图片、链接和 HTML 暂不参与 PDF 排版。</p>
            </div>}
            <div className="editor-file"><span>{activeFileName || "未选择文件"}</span><small>{activeDirty ? "修改自动保存在此浏览器" : "仓库版本"}</small></div>
            {editorMode === "markdown" ? <>
              <div className="insert-tools">
                <span>插入</span>
                <button onClick={() => insertMarkdown("\n- **要点：**描述成果\n")}>列表</button>
                <button onClick={() => insertMarkdown("\n| 项目 | 结果 |\n|---|---|\n| 示例 | 100 |\n")}>表格</button>
                <button onClick={() => insertMarkdown("\n:::chart\n项目 A | 80\n项目 B | 60\n:::\n")}>图表</button>
              </div>
              <textarea ref={editorInput} aria-label="Markdown 简历正文" value={active?.markdown || ""}
                onChange={(event) => updateActive({ markdown: event.target.value })}
                placeholder="新建或选择一份简历" spellCheck={false} disabled={!active} />
            </> : <div className="section-editor">
              {active ? <>
                <label className="field-label">姓名 / 简历标题
                  <input value={rawDocument.preamble.match(/^#[ \t]+(.*)$/m)?.[1] || ""} onChange={(event) => changeName(event.target.value)} placeholder="你的姓名" />
                </label>
                {rawDocument.sections.map((section, index) => <article className="module-card" key={index}>
                  <div className="module-heading">
                    <span className="module-index">{String(index + 1).padStart(2, "0")}</span>
                    <input aria-label={"第 " + (index + 1) + " 个模块标题"} value={section.title} onChange={(event) => editSection(index, { title: event.target.value })} placeholder="模块标题" />
                    <button title="上移模块" aria-label="上移模块" onClick={() => moveSection(index, -1)} disabled={index === 0 || section.info || rawDocument.sections[index - 1]?.info}>↑</button>
                    <button title="下移模块" aria-label="下移模块" onClick={() => moveSection(index, 1)} disabled={index === rawDocument.sections.length - 1 || section.info || rawDocument.sections[index + 1]?.info}>↓</button>
                    <button title="删除模块" aria-label="删除模块" className="remove-module" onClick={() => removeSection(index)}>×</button>
                  </div>
                  <p>{section.info ? "这里填写电话、邮箱、求职方向等页首信息。" : "用 ### 写经历标题、#### 写项目标题；每行以 - 开头可创建列表。"}</p>
                  <textarea aria-label={section.title + "内容"} value={section.body} onChange={(event) => editSection(index, { body: event.target.value })} spellCheck={false} />
                  <BlockEditor body={section.body} onChange={(body) => editSection(index, { body })} />
                  <div className="module-actions">
                    <button onClick={() => editSection(index, { body: section.body + "\n- **成果：**描述结果" })}>＋ 要点</button>
                    <button onClick={() => editSection(index, { body: section.body + "\n| 项目 | 结果 |\n|---|---|\n| 示例 | 100 |" })}>＋ 表格</button>
                    <button onClick={() => editSection(index, { body: section.body + "\n:::chart\n项目 A | 80\n项目 B | 60\n:::" })}>＋ 图表</button>
                  </div>
                </article>)}
                <button className="add-module" onClick={addSection}>＋ 添加模块</button>
              </> : <p className="empty-list">请先在简历库中选择或新建一份简历。</p>}
            </div>}
          </section>
        </aside>
        <section className={"preview-pane mobile-" + mobileTab}>
          <div className="preview-toolbar">
            <div><strong>PDF 预览</strong><span>{rendering ? "生成中…" : pdfError || (pdfInfo ? pdfInfo.pages + " 页 · " + pdfInfo.widthMm + " × " + pdfInfo.heightMm + " mm" : "等待内容")}</span></div>
            <div className="zoom-tools">
              <button aria-label="缩小预览" onClick={() => setZoom(Math.max(.3, Math.round((zoom - .1) * 10) / 10))}>−</button>
              <output>{Math.round(zoom * 100)}%</output>
              <button aria-label="放大预览" onClick={() => setZoom(Math.min(1.7, Math.round((zoom + .1) * 10) / 10))}>＋</button>
              <button onClick={() => setZoom(.75)}>适中</button>
            </div>
          </div>
          <div className="preview-scroll"><PdfPreview blob={pdfBlob} zoom={zoom} /></div>
          <div className="status-line" role="status">{status}</div>
        </section>
        <aside className={"style-pane mobile-" + mobileTab}>
          <div className="section-heading"><div><small>DESIGN</small><h2>排版与输出</h2></div><button className="subtle" onClick={() => updateActive({ settings: { ...DEFAULT_SETTINGS } })} disabled={!active}>重置</button></div>
          {active && <>
            <section className="control-section">
              <h3>快速样式</h3>
              <div className="preset-grid">
                <button onClick={() => applyPreset("minimal")}><b>极简</b><small>低饱和 · 细分割线</small></button>
                <button onClick={() => applyPreset("classic")}><b>经典</b><small>宋体 · 稳重蓝灰</small></button>
                <button onClick={() => applyPreset("modern")}><b>现代</b><small>黑体 · 橙色重点</small></button>
              </div>
              <p className="control-hint">应用后可继续调整每个细节；内容和页面尺寸不会改变。</p>
            </section>
            <section className="control-section">
              <h3>PDF 页面</h3>
              <div className="segmented">
                <button className={active.settings.mode === "single" ? "active" : ""} onClick={() => updateSettings({ mode: "single" })}>自定义单页</button>
                <button className={active.settings.mode === "paged" ? "active" : ""} onClick={() => updateSettings(active.settings.heightMm === 0
                  ? { mode: "paged", paper: "A4", widthMm: 210, heightMm: 297 }
                  : { mode: "paged" })}>固定尺寸多页</button>
              </div>
              <label className="select-control">纸张
                <select value={active.settings.paper} onChange={(event) => applyPaper(event.target.value as Settings["paper"])}>
                  <option value="custom">自定义</option><option value="A4">A4 · 210 × 297 mm</option><option value="Letter">Letter · 216 × 279 mm</option>
                </select>
              </label>
              <div className="two-col">
                <NumberControl label="宽度" value={active.settings.widthMm} min={50} max={500} unit="mm" onChange={(widthMm) => updateSettings({ widthMm, paper: "custom" })} />
                <NumberControl label="高度" value={active.settings.heightMm} min={active.settings.mode === "single" ? 0 : 50} max={1500} unit="mm" onChange={(heightMm) => updateSettings({ heightMm, paper: "custom" })} />
              </div>
              {active.settings.mode === "single" && <label className="check-control"><input type="checkbox" checked={active.settings.heightMm === 0} onChange={(event) => updateSettings({ heightMm: event.target.checked ? 0 : 420 })} />按内容自动计算单页高度</label>}
              <p className="control-hint">{active.settings.mode === "single" ? "可指定异形尺寸；固定高度小于内容高度时，超出内容会被裁切。" : "内容会按所选尺寸自动分页，PDF 页数与预览一致。"}</p>
              <NumberControl label="页面边距" value={active.settings.marginMm} min={4} max={35} unit="mm" onChange={(marginMm) => updateSettings({ marginMm })} />
            </section>
            <section className="control-section">
              <h3>文字与间距</h3>
              <label className="select-control">标题字体
                <select value={active.settings.headingFontFamily} onChange={(event) => updateSettings({ headingFontFamily: event.target.value as Settings["headingFontFamily"] })}>
                  <option value="sans">思源黑体</option><option value="serif">思源宋体</option>
                </select>
              </label>
              <label className="select-control">正文字体
                <select value={active.settings.fontFamily} onChange={(event) => updateSettings({ fontFamily: event.target.value as Settings["fontFamily"] })}>
                  <option value="sans">思源黑体</option><option value="serif">思源宋体</option>
                </select>
              </label>
              <div className="two-col">
                <NumberControl label="姓名字号" value={active.settings.nameFontSize} min={12} max={48} step={.5} unit="pt" onChange={(nameFontSize) => updateSettings({ nameFontSize })} />
                <NumberControl label="模块标题字号" value={active.settings.sectionFontSize} min={8} max={30} step={.5} unit="pt" onChange={(sectionFontSize) => updateSettings({ sectionFontSize })} />
                <NumberControl label="正文字号" value={active.settings.fontSize} min={7} max={22} step={.5} unit="pt" onChange={(fontSize) => updateSettings({ fontSize })} />
                <NumberControl label="行距" value={active.settings.lineHeight} min={1.1} max={2.2} step={.05} onChange={(lineHeight) => updateSettings({ lineHeight })} />
                <NumberControl label="条目间距" value={active.settings.itemGap} min={0} max={20} unit="pt" onChange={(itemGap) => updateSettings({ itemGap })} />
                <NumberControl label="模块间距" value={active.settings.sectionGap} min={0} max={40} unit="pt" onChange={(sectionGap) => updateSettings({ sectionGap })} />
              </div>
            </section>
            <section className="control-section">
              <h3>列表</h3>
              <label className="select-control">项目符号
                <select value={active.settings.bulletStyle} onChange={(event) => updateSettings({ bulletStyle: event.target.value as Settings["bulletStyle"] })}>
                  <option value="diamond">菱形 ◆</option>
                  <option value="dot">圆点 •</option>
                  <option value="dash">短线 –</option>
                </select>
              </label>
              <NumberControl label="列表缩进" value={active.settings.bulletIndent} min={0} max={36} unit="pt" onChange={(bulletIndent) => updateSettings({ bulletIndent })} />
              <div className="two-col">
                <NumberControl label="标记大小" value={active.settings.bulletSize} min={2} max={16} step={.5} unit="pt" onChange={(bulletSize) => updateSettings({ bulletSize })} />
                <NumberControl label="短线粗细" value={active.settings.bulletStroke} min={.5} max={8} step={.5} unit="pt" onChange={(bulletStroke) => updateSettings({ bulletStroke })} />
              </div>
            </section>
            <section className="control-section">
              <h3>颜色与分割线</h3>
              <ColorControl label="正文" value={active.settings.textColor} onChange={(textColor) => updateSettings({ textColor })} />
              <ColorControl label="主题" value={active.settings.accentColor} onChange={(accentColor) => updateSettings({ accentColor })} />
              <ColorControl label="模块分割线" value={active.settings.dividerColor} onChange={(dividerColor) => updateSettings({ dividerColor })} />
              <NumberControl label="分割线粗细" value={active.settings.dividerWidth} min={0} max={5} step={.25} unit="pt" onChange={(dividerWidth) => updateSettings({ dividerWidth })} />
            </section>
            <section className="control-section">
              <h3>照片</h3>
              <label className="check-control"><input type="checkbox" checked={active.settings.showPhoto} onChange={(event) => updateSettings({ showPhoto: event.target.checked })} />显示照片</label>
              <button className="full-button" onClick={() => photoInput.current?.click()}>更换简历照片</button>
              <p className="control-hint">图片会压缩后随该 MD 文件保存。公开仓库中的简历和照片可以被任何人查看。</p>
            </section>
          </>}
          <section className="control-section github-section">
            <h3>云端保存</h3>
            <label className="select-control">自动保存
              <select value={autoSaveMinutes} onChange={(event) => setAutoSaveMinutes(Number(event.target.value))}>
                <option value={0}>关闭</option>
                <option value={1}>每 1 分钟</option>
                <option value={5}>每 5 分钟</option>
                <option value={10}>每 10 分钟</option>
              </select>
            </label>
            <p>编辑内容始终会自动保留在此浏览器。开启定时保存后，未保存的简历会按间隔同步到云端；需要在本标签页填写令牌。</p>
            <p>公开内容可直接浏览。保存与删除需要此仓库 Contents 读写权限的细粒度令牌。</p>
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">创建细粒度令牌 ↗</a>
            <label>个人访问令牌
              <input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="github_pat_…" autoComplete="off" />
            </label>
            <p>令牌仅保留在当前网页标签页的内存中，关闭后需重新输入。</p>
            <a href={repositoryUrl} target="_blank" rel="noreferrer">查看 GitHub 仓库 ↗</a>
          </section>
        </aside>
      </div>
      <input ref={fileInput} hidden type="file" accept=".md,text/markdown" multiple onChange={(event) => void importMd(event)} />
      <input ref={photoInput} hidden type="file" accept="image/*" onChange={(event) => void changePhoto(event)} />
    </main>
  );
}
