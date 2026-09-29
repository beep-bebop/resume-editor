export type EditableBlock = {
  kind: "bullet" | "table" | "chart";
  start: number;
  end: number;
  text?: string;
  rows?: string[][];
};

export function editableBlocks(body: string): EditableBlock[] {
  const lines = body.split("\n");
  const blocks: EditableBlock[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line === ":::chart") {
      const start = index;
      const rows: string[][] = [];
      while (++index < lines.length && lines[index].trim() !== ":::") {
        const cells = lines[index].split("|").map((cell) => cell.trim());
        if (cells.length >= 2) rows.push(cells.slice(0, 2));
      }
      blocks.push({ kind: "chart", start, end: Math.min(index, lines.length - 1), rows });
    } else if (line.startsWith("|") && line.endsWith("|")) {
      const start = index;
      const rows: string[][] = [];
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        const cells = lines[index].trim().slice(1, -1).split("|").map((cell) => cell.trim());
        if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
        index++;
      }
      blocks.push({ kind: "table", start, end: index - 1, rows });
      index--;
    } else if (/^[-*]\s+/.test(line)) {
      blocks.push({ kind: "bullet", start: index, end: index, text: line.replace(/^[-*]\s+/, "") });
    }
  }
  return blocks;
}

export function replaceEditableBlock(body: string, block: EditableBlock, replacement: string): string {
  const lines = body.split("\n");
  lines.splice(block.start, block.end - block.start + 1, ...replacement.split("\n"));
  return lines.join("\n");
}

export function tableMarkdown(rows: string[][]): string {
  if (!rows.length) return "";
  const columns = Math.max(1, ...rows.map((row) => row.length));
  const cells = rows.map((row) => Array.from({ length: columns }, (_, index) => row[index] || ""));
  const header = "| " + cells[0].join(" | ") + " |";
  const separator = "|" + Array(columns).fill("---").join("|") + "|";
  return [header, separator, ...cells.slice(1).map((row) => "| " + row.join(" | ") + " |")].join("\n");
}

export function chartMarkdown(rows: string[][]): string {
  return [":::chart", ...rows.map(([label, value]) => (label || "") + " | " + (value || "")), ":::"].join("\n");
}
