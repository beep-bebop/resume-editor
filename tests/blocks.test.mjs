import assert from "node:assert/strict";
import test from "node:test";
import { chartMarkdown, editableBlocks, replaceEditableBlock, tableMarkdown } from "../src/blocks.ts";

test("direct block controls can edit lists, tables, and charts without touching nearby Markdown", () => {
  const body = "### 项目\n- 原要点\n\n| 指标 | 结果 |\n|---|---|\n| 速度 | 80 |\n\n:::chart\n之前 | 60\n之后 | 90\n:::";
  const blocks = editableBlocks(body);
  assert.deepEqual(blocks.map((block) => block.kind), ["bullet", "table", "chart"]);
  const changed = replaceEditableBlock(body, blocks[1], tableMarkdown([["指标", "结果"], ["速度", "95"]]));
  assert.ok(changed.includes("| 速度 | 95 |"));
  assert.ok(changed.includes("- 原要点"));
  assert.ok(changed.includes("之前 | 60"));
  assert.equal(chartMarkdown([["优化前", "50"], ["优化后", "90"]]), ":::chart\n优化前 | 50\n优化后 | 90\n:::");
});
