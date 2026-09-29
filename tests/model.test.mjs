import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SETTINGS, joinRawSections, parseResume, parseStoredMarkdown, serializeResume, safeFileName, splitRawSections,
} from "../src/model.ts";

test("parses Markdown into header, contact, sections and item kinds", () => {
  const parsed = parseResume("# 张三\n\n## 个人基本信息\n邮箱：a@example.com\n\n## 工作经历\n### 公司｜岗位\n- **成果：**完成项目\n#### 子项目");
  assert.equal(parsed.name, "张三");
  assert.equal(parsed.sections.length, 2);
  assert.equal(parsed.sections[0].info, true);
  assert.deepEqual(parsed.sections[1].lines.map((line) => line.kind), ["entry", "bullet", "project"]);
});

test("settings and Markdown round-trip in one repository file", () => {
  const markdown = "# 李四\n\n## 技能\n- TypeScript";
  const resume = {
    fileName: "test.md", markdown,
    settings: { ...DEFAULT_SETTINGS, dividerWidth: 2.5, dividerColor: "#123456" },
    updatedAt: 0,
  };
  const parsed = parseStoredMarkdown(serializeResume(resume));
  assert.equal(parsed.markdown, markdown);
  assert.equal(parsed.settings.dividerWidth, 2.5);
  assert.equal(parsed.settings.dividerColor, "#123456");
});

test("recognizes tables and chart blocks as editable PDF content", () => {
  const markdown = "# 王五\n\n## 项目\n| 指标 | 数值 |\n|---|---|\n| 准确率 | 95 |\n\n:::chart\n优化前 | 60\n优化后 | 95\n:::";
  const lines = parseResume(markdown).sections[0].lines;
  assert.deepEqual(lines.map((line) => line.kind), ["table", "chart"]);
  assert.deepEqual(lines[0].rows, [["指标", "数值"], ["准确率", "95"]]);
  assert.deepEqual(lines[1].rows, [["优化前", "60"], ["优化后", "95"]]);
});

test("rejects path characters in new filenames", () => {
  assert.equal(safeFileName("../foo/bar"), "foo-bar.md");
});

test("module editing preserves Markdown and allows an empty heading while typing", () => {
  const source = "# 张三\n\n## 个人基本信息\n电话：123\n\n## 工作经历\n\n### 公司\n- 成果\n";
  const parts = splitRawSections(source);
  assert.equal(joinRawSections(parts.preamble, parts.sections), source);
  parts.sections[1].title = "";
  const editing = joinRawSections(parts.preamble, parts.sections);
  assert.equal(splitRawSections(editing).sections.length, 2);
});
