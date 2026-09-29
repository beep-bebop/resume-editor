export type PdfMode = "single" | "paged";
export type FontWeight = 300 | 400 | 600 | 800;

export type Settings = {
  mode: PdfMode;
  widthMm: number;
  heightMm: number;
  paper: "A4" | "Letter" | "custom";
  marginMm: number;
  fontSize: number;
  fontFamily: "sans" | "serif";
  headingFontFamily: "sans" | "serif";
  nameFontSize: number;
  sectionFontSize: number;
  nameFontWeight: FontWeight;
  sectionFontWeight: FontWeight;
  entryFontWeight: FontWeight;
  bodyFontWeight: FontWeight;
  lineHeight: number;
  itemGap: number;
  bulletStyle: "diamond" | "dot" | "dash";
  bulletIndent: number;
  bulletSize: number;
  bulletStroke: number;
  sectionGap: number;
  dividerWidth: number;
  showSectionDivider: boolean;
  headerDividerWidth: number;
  headerDividerGap: number;
  showHeaderDivider: boolean;
  textColor: string;
  accentColor: string;
  dividerColor: string;
  photo: string;
  showPhoto: boolean;
};

export type Resume = {
  fileName: string;
  markdown: string;
  settings: Settings;
  sha?: string;
  committedBody?: string;
  updatedAt: number;
};

export type Line = {
  kind: "entry" | "project" | "bullet" | "paragraph" | "table" | "chart";
  text: string;
  rows?: string[][];
};
export type Section = { title: string; lines: Line[]; info: boolean };
export type ParsedResume = { name: string; preamble: string[]; sections: Section[] };
export type RawSection = { title: string; body: string; afterHeading: string; info: boolean };

export const DEFAULT_SETTINGS: Settings = {
  mode: "single",
  widthMm: 266,
  heightMm: 0,
  paper: "custom",
  marginMm: 10,
  fontSize: 12,
  fontFamily: "sans",
  headingFontFamily: "sans",
  nameFontSize: 23,
  sectionFontSize: 14,
  nameFontWeight: 800,
  sectionFontWeight: 800,
  entryFontWeight: 600,
  bodyFontWeight: 400,
  lineHeight: 1.42,
  itemGap: 4,
  bulletStyle: "diamond",
  bulletIndent: 12,
  bulletSize: 8,
  bulletStroke: 2.5,
  sectionGap: 13,
  dividerWidth: 1,
  showSectionDivider: true,
  headerDividerWidth: 1.5,
  headerDividerGap: 9,
  showHeaderDivider: true,
  textColor: "#20242a",
  accentColor: "#d75b18",
  dividerColor: "#d7d4ce",
  photo: "",
  showPhoto: true,
};

const SETTINGS_MARKER = /\n?<!-- resume-studio: (\{[^\n]*\}) -->\s*$/;

export function parseStoredMarkdown(source: string): { markdown: string; settings: Settings } {
  const match = source.match(SETTINGS_MARKER);
  if (!match) return { markdown: source.trimEnd(), settings: { ...DEFAULT_SETTINGS } };
  try {
    const parsed = JSON.parse(match[1]) as Partial<Settings>;
    return {
      markdown: source.replace(SETTINGS_MARKER, "").trimEnd(),
      settings: { ...DEFAULT_SETTINGS, ...parsed },
    };
  } catch {
    return { markdown: source.trimEnd(), settings: { ...DEFAULT_SETTINGS } };
  }
}

export function serializeResume(resume: Resume): string {
  return resume.markdown.trimEnd() + "\n\n<!-- resume-studio: " +
    JSON.stringify(resume.settings) + " -->\n";
}

export function parseResume(markdown: string): ParsedResume {
  const source = markdown.replace(/\r\n?/g, "\n");
  const starts = [...source.matchAll(/^##[ \t]+(.*)$/gm)];
  const intro = source.slice(0, starts[0]?.index ?? source.length);
  const name = intro.match(/^#[ \t]+(.+)$/m)?.[1]?.trim() || "未命名简历";
  const preamble = intro.split("\n").map((line) => line.trim())
    .filter((line) => line && !line.startsWith("# "));
  const sections = starts.map((match, index) => {
    const begin = (match.index ?? 0) + match[0].length;
    const end = starts[index + 1]?.index ?? source.length;
    const title = match[1].trim();
    const rawLines = source.slice(begin, end).split("\n");
    const lines: Line[] = [];
    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const text = rawLines[lineIndex].trim();
      if (!text) continue;
      if (text === ":::chart") {
        const rows: string[][] = [];
        while (++lineIndex < rawLines.length && rawLines[lineIndex].trim() !== ":::") {
          const row = rawLines[lineIndex].split("|").map((cell) => cell.trim()).filter(Boolean);
          if (row.length >= 2) rows.push(row.slice(0, 2));
        }
        lines.push({ kind: "chart", text: "", rows });
        continue;
      }
      if (text.startsWith("|") && text.endsWith("|")) {
        const rows: string[][] = [];
        while (lineIndex < rawLines.length) {
          const candidate = rawLines[lineIndex].trim();
          if (!candidate.startsWith("|") || !candidate.endsWith("|")) break;
          const cells = candidate.slice(1, -1).split("|").map((cell) => cell.trim());
          if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
          lineIndex++;
        }
        lineIndex--;
        lines.push({ kind: "table", text: "", rows });
        continue;
      }
      if (text.startsWith("#### ")) lines.push({ kind: "project", text: text.slice(5) });
      else if (text.startsWith("### ")) lines.push({ kind: "entry", text: text.slice(4) });
      else if (/^[-*]\s+/.test(text)) lines.push({ kind: "bullet", text: text.replace(/^[-*]\s+/, "") });
      else lines.push({ kind: "paragraph", text });
    }
    return { title, lines, info: /个人|基本信息|联系方式/.test(title) };
  });
  return { name, preamble, sections };
}

export function splitRawSections(markdown: string): { preamble: string; sections: RawSection[] } {
  const source = markdown.replace(/\r\n?/g, "\n");
  const starts = [...source.matchAll(/^##[ \t]+(.*)$/gm)];
  const preamble = source.slice(0, starts[0]?.index ?? source.length);
  return {
    preamble,
    sections: starts.map((match, index) => {
      const bodyStart = (match.index ?? 0) + match[0].length;
      const bodyEnd = starts[index + 1]?.index ?? source.length;
      const title = match[1].trim();
      const rawBody = source.slice(bodyStart, bodyEnd);
      const afterHeading = rawBody.match(/^\n*/)?.[0] || "";
      return {
        title,
        body: rawBody.slice(afterHeading.length),
        afterHeading,
        info: /个人|基本信息|联系方式/.test(title),
      };
    }),
  };
}

export function joinRawSections(preamble: string, sections: RawSection[]): string {
  return preamble + sections.map((section) =>
    "## " + section.title + section.afterHeading + section.body,
  ).join("");
}

export function displayName(resume: Resume): string {
  return parseResume(resume.markdown).name;
}

export function mmToPt(mm: number): number {
  return mm * 72 / 25.4;
}

export function fileStem(fileName: string): string {
  return fileName.replace(/\.md$/i, "");
}

export function safeFileName(value: string): string {
  const stem = value.trim().replace(/[\\/:*?"<>|]/g, "-").replace(/^[.\-]+/, "").slice(0, 72);
  return (stem || "resume") + ".md";
}
