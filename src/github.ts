import { parseStoredMarkdown, serializeResume, type Resume } from "./model";

const owner = "beep-bebop";
const repository = "resume-data";
const folder = "resumes";
const api = "https://api.github.com/repos/" + owner + "/" + repository + "/contents/" + folder;

type GitHubEntry = { name: string; sha: string; download_url: string | null; type: string };
type FileResponse = { sha: string; content: string; encoding: string };

function headers(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: "Bearer " + token } : {}),
  };
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { message?: string };
    return body.message || "HTTP " + response.status;
  } catch {
    return "HTTP " + response.status;
  }
}

function decodeBase64(value: string): string {
  const bytes = Uint8Array.from(atob(value.replace(/\s/g, "")), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function listResumes(token?: string): Promise<Resume[]> {
  const response = await fetch(api + "?ref=main", { headers: headers(token), cache: "no-store" });
  if (!response.ok) throw new Error("读取仓库失败：" + await errorMessage(response));
  const entries = (await response.json() as GitHubEntry[])
    .filter((entry) => entry.type === "file" && /\.md$/i.test(entry.name));
  return Promise.all(entries.map(async (entry) => {
    const file = await fetch(api + "/" + encodeURIComponent(entry.name) + "?ref=main", {
      headers: headers(token),
      cache: "no-store",
    });
    if (!file.ok) throw new Error("读取 " + entry.name + " 失败：" + await errorMessage(file));
    const body = decodeBase64((await file.json() as FileResponse).content);
    const parsed = parseStoredMarkdown(body);
    const resume: Resume = {
      fileName: entry.name,
      markdown: parsed.markdown,
      settings: parsed.settings,
      sha: entry.sha,
      updatedAt: Date.now(),
    };
    resume.committedBody = serializeResume(resume);
    return resume;
  }));
}

export async function saveResume(resume: Resume, token: string): Promise<Resume> {
  if (!token.trim()) throw new Error("请先填写 GitHub 令牌");
  const url = api + "/" + encodeURIComponent(resume.fileName);
  const currentResponse = await fetch(url + "?ref=main", { headers: headers(token), cache: "no-store" });
  let current: FileResponse | null = null;
  if (currentResponse.ok) current = await currentResponse.json() as FileResponse;
  else if (currentResponse.status !== 404) throw new Error("检查版本失败：" + await errorMessage(currentResponse));

  if (current && resume.sha && current.sha !== resume.sha) {
    throw new Error("仓库文件已由其他设备修改。请先刷新仓库并处理冲突。");
  }
  if (current && !resume.sha && decodeBase64(current.content) !== serializeResume(resume)) {
    throw new Error("仓库中已存在同名文件，请修改文件名后保存。");
  }
  const body = serializeResume(resume);
  const response = await fetch(url, {
    method: "PUT",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update resume: " + resume.fileName,
      content: encodeBase64(body),
      branch: "main",
      ...(current ? { sha: current.sha } : {}),
    }),
  });
  if (!response.ok) throw new Error("提交失败：" + await errorMessage(response));
  const result = await response.json() as { content: { sha: string } };
  return { ...resume, sha: result.content.sha, committedBody: body, updatedAt: Date.now() };
}

export async function deleteResume(resume: Resume, token: string): Promise<void> {
  if (!token.trim()) throw new Error("请先填写 GitHub 令牌");
  const url = api + "/" + encodeURIComponent(resume.fileName);
  const currentResponse = await fetch(url + "?ref=main", { headers: headers(token), cache: "no-store" });
  if (currentResponse.status === 404) return;
  if (!currentResponse.ok) throw new Error("检查文件失败：" + await errorMessage(currentResponse));
  const current = await currentResponse.json() as FileResponse;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Delete resume: " + resume.fileName,
      sha: current.sha,
      branch: "main",
    }),
  });
  if (!response.ok) throw new Error("删除失败：" + await errorMessage(response));
}

export const repositoryUrl = "https://github.com/" + owner + "/" + repository;
