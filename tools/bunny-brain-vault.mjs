#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const VAULT_NAME = "Bunny Brain";
const LETTERS_DIR_NAME = "01 Bunny Letters";
const WORLD_DIR_NAME = "02 世界观";
const LIBRARY_DIR_NAME = "03 资料库";
const INBOX_DIR_NAME = "99 收件箱";

const SPECIAL_NOTES = new Map([
  ["世界观.md", WORLD_DIR_NAME],
  ["兔子人设.md", WORLD_DIR_NAME],
  ["写作规范.md", LIBRARY_DIR_NAME],
  ["标题库.md", LIBRARY_DIR_NAME],
  ["金句库.md", LIBRARY_DIR_NAME],
  ["心理学灵感.md", LIBRARY_DIR_NAME]
]);

const STUBS = {
  "世界观.md": "# 世界观\n",
  "兔子人设.md": "# 兔子人设\n",
  "写作规范.md": [
    "# 写作规范",
    "",
    "- Bunny Letter 一律放在 `01 Bunny Letters/`。",
    "- 原始 `.md` 先放进 `99 收件箱/`，再运行 `npm run bunny-brain:sync` 自动归档。",
    "- 整理脚本只补 Frontmatter 和移动文件，不改正文。"
  ].join("\n"),
  "标题库.md": "# 标题库\n",
  "金句库.md": "# 金句库\n",
  "心理学灵感.md": "# 心理学灵感\n",
  "Index.md": [
    "# Bunny Brain Index",
    "",
    "```dataview",
    "TABLE id, title, chapter, volume, emotion, theme, tags, created, status",
    'FROM "01 Bunny Letters"',
    "SORT created DESC",
    "```"
  ].join("\n")
};

function getVaultPaths(baseDir) {
  const vaultDir = path.join(baseDir, VAULT_NAME);
  return {
    baseDir,
    vaultDir,
    lettersDir: path.join(vaultDir, LETTERS_DIR_NAME),
    worldDir: path.join(vaultDir, WORLD_DIR_NAME),
    libraryDir: path.join(vaultDir, LIBRARY_DIR_NAME),
    inboxDir: path.join(vaultDir, INBOX_DIR_NAME),
    indexFile: path.join(vaultDir, "Index.md")
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureFile(filePath, content) {
  if (await fileExists(filePath)) return;
  await fs.writeFile(filePath, content, "utf8");
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n/g, "\n");
}

function stripWrappingQuotes(value) {
  if (!value) return "";
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  // ponytail: This only supports flat `key: value` frontmatter; if notes start using nested YAML, switch to a real parser.
  for (const line of normalizeLineEndings(match[1]).split("\n")) {
    if (!line.trim()) continue;
    const parts = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!parts) continue;
    meta[parts[1]] = parts[2];
  }

  return {
    meta,
    body: content.slice(match[0].length)
  };
}

function quoteYaml(value) {
  if (!value) return "";
  return JSON.stringify(String(value));
}

function compactTimestamp(isoString) {
  return isoString.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function sanitizeIdPart(value) {
  const ascii = value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "bunny-letter";
}

function titleFromBody(body, fallbackName) {
  const heading = normalizeLineEndings(body).match(/^#\s+(.+)$/m);
  if (heading?.[1]?.trim()) return heading[1].trim();
  return fallbackName;
}

function buildFrontmatter(meta) {
  const tagsValue = meta.tags && meta.tags.trim() ? meta.tags.trim() : "[]";
  return [
    "---",
    `id: ${quoteYaml(meta.id)}`,
    `title: ${quoteYaml(meta.title)}`,
    `chapter: ${meta.chapter ?? ""}`,
    `volume: ${meta.volume ?? ""}`,
    `emotion: ${meta.emotion ?? ""}`,
    `theme: ${meta.theme ?? ""}`,
    `tags: ${tagsValue}`,
    `created: ${quoteYaml(meta.created)}`,
    "status: draft",
    "---"
  ].join("\n");
}

function buildLetterContent(rawContent, fallbackName, createdAt) {
  const { meta, body } = parseFrontmatter(rawContent);
  const title = stripWrappingQuotes(meta.title) || titleFromBody(body, fallbackName);
  const id = stripWrappingQuotes(meta.id) || `${compactTimestamp(createdAt)}-${sanitizeIdPart(fallbackName)}`;
  const nextMeta = {
    id,
    title,
    chapter: meta.chapter ?? "",
    volume: meta.volume ?? "",
    emotion: meta.emotion ?? "",
    theme: meta.theme ?? "",
    tags: meta.tags ?? "[]",
    created: stripWrappingQuotes(meta.created) || createdAt
  };

  return `${buildFrontmatter(nextMeta)}\n${body}`;
}

function sanitizePathSegment(value) {
  return String(value)
    .replace(/[/:\\\0]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeVolumeLabel(volumeLabel) {
  return volumeLabel.replace(/\s+/g, "");
}

function buildTagList(tags) {
  return `[${tags.map((tag) => JSON.stringify(tag)).join(", ")}]`;
}

function parseAnthology(rawContent, sourceName, createdAt) {
  const normalized = normalizeLineEndings(rawContent);
  const seriesMatch = normalized.match(/^#\s+(.+)$/m);
  const volumeMatch = normalized.match(/^##\s*(Vol\.\s*\d+)(?:｜([^｜\n]+))?(?:｜([0-9–-]+))?$/m);
  if (!seriesMatch || !volumeMatch) {
    throw new Error(`Cannot parse anthology header: ${sourceName}`);
  }

  const seriesTitle = seriesMatch[1].trim();
  const volume = normalizeVolumeLabel(volumeMatch[1].trim());
  const theme = (volumeMatch[2] ?? "").trim();
  const entryRegex = /^###\s*(\d{3})｜(.+)$/gm;
  const sectionRegex = /^##\s+/gm;
  const matches = [...normalized.matchAll(entryRegex)];

  if (!matches.length) {
    throw new Error(`No anthology entries found: ${sourceName}`);
  }

  return matches.map((match, index) => {
    const headingIndex = match.index ?? 0;
    const nextHeadingIndex = index + 1 < matches.length ? (matches[index + 1].index ?? normalized.length) : normalized.length;
    sectionRegex.lastIndex = headingIndex + match[0].length;
    const nextSection = sectionRegex.exec(normalized);
    const hardStop = nextSection && nextSection.index < nextHeadingIndex ? nextSection.index : nextHeadingIndex;
    const block = normalized
      .slice(headingIndex, hardStop)
      .replace(/\n---\n*$/s, "")
      .trimEnd();

    return {
      seriesTitle,
      volume,
      theme,
      chapter: match[1],
      title: match[2].trim(),
      content: block,
      createdAt,
      id: `${sanitizeIdPart(seriesTitle)}-${volume.toLowerCase()}-${match[1]}`
    };
  });
}

async function importAnthologyFiles(baseDir, sourceFiles) {
  if (!sourceFiles.length) {
    throw new Error("No source files provided.");
  }

  const paths = getVaultPaths(baseDir);
  await ensureVaultLayout(paths);
  const imported = [];

  for (const sourceFile of sourceFiles) {
    const rawContent = await fs.readFile(sourceFile, "utf8");
    const stats = await fs.stat(sourceFile);
    const createdAt = stats.birthtime instanceof Date && !Number.isNaN(stats.birthtime.valueOf())
      ? stats.birthtime.toISOString()
      : new Date().toISOString();
    const entries = parseAnthology(rawContent, path.basename(sourceFile), createdAt);

    for (const entry of entries) {
      const seriesDir = path.join(paths.lettersDir, sanitizePathSegment(entry.seriesTitle), sanitizePathSegment(entry.volume));
      await ensureDir(seriesDir);
      const fileName = `${entry.chapter} ${sanitizePathSegment(entry.title)}.md`;
      const targetPath = await nextAvailablePath(path.join(seriesDir, fileName));
      const tags = buildTagList([
        "bunny-letter",
        sanitizeIdPart(entry.seriesTitle),
        entry.volume.toLowerCase()
      ]);
      const noteContent = buildFrontmatter({
        id: entry.id,
        title: entry.title,
        chapter: entry.chapter,
        volume: entry.volume,
        emotion: "",
        theme: entry.theme,
        tags,
        created: entry.createdAt
      });
      await fs.writeFile(targetPath, `${noteContent}\n${entry.content}\n`, "utf8");
      imported.push(targetPath);
    }
  }

  await normalizeLetters(paths);
  return { paths, imported };
}

async function nextAvailablePath(filePath) {
  if (!(await fileExists(filePath))) return filePath;
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  for (let index = 2; ; index += 1) {
    const candidate = path.join(dir, `${base}-${index}${ext}`);
    if (!(await fileExists(candidate))) return candidate;
  }
}

async function ensureVaultLayout(paths) {
  await Promise.all([
    ensureDir(paths.vaultDir),
    ensureDir(paths.lettersDir),
    ensureDir(paths.worldDir),
    ensureDir(paths.libraryDir),
    ensureDir(paths.inboxDir)
  ]);

  await ensureFile(paths.indexFile, STUBS["Index.md"]);

  for (const [noteName, folderName] of SPECIAL_NOTES) {
    const dir = folderName === WORLD_DIR_NAME ? paths.worldDir : paths.libraryDir;
    await ensureFile(path.join(dir, noteName), STUBS[noteName]);
  }
}

async function routeInboxFiles(paths) {
  const entries = await fs.readdir(paths.inboxDir, { withFileTypes: true });
  const moved = [];

  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".md") continue;

    const sourcePath = path.join(paths.inboxDir, entry.name);
    const stats = await fs.stat(sourcePath);
    const rawContent = await fs.readFile(sourcePath, "utf8");
    const specialFolder = SPECIAL_NOTES.get(entry.name);

    if (specialFolder) {
      const targetDir = specialFolder === WORLD_DIR_NAME ? paths.worldDir : paths.libraryDir;
      const targetPath = path.join(targetDir, entry.name);
      const stub = STUBS[entry.name];

      if (!(await fileExists(targetPath))) {
        await fs.rename(sourcePath, targetPath);
        moved.push(targetPath);
        continue;
      }

      const currentContent = normalizeLineEndings(await fs.readFile(targetPath, "utf8"));
      if (currentContent === normalizeLineEndings(stub)) {
        await fs.writeFile(targetPath, rawContent, "utf8");
        await fs.rm(sourcePath);
        moved.push(targetPath);
        continue;
      }

      const duplicatePath = await nextAvailablePath(path.join(targetDir, entry.name));
      await fs.rename(sourcePath, duplicatePath);
      moved.push(duplicatePath);
      continue;
    }

    const createdAt = stats.birthtime instanceof Date && !Number.isNaN(stats.birthtime.valueOf())
      ? stats.birthtime.toISOString()
      : new Date().toISOString();
    const fallbackName = path.basename(entry.name, ".md");
    const normalizedContent = buildLetterContent(rawContent, fallbackName, createdAt);
    const targetPath = await nextAvailablePath(path.join(paths.lettersDir, entry.name));
    await fs.writeFile(targetPath, normalizedContent, "utf8");
    await fs.rm(sourcePath);
    moved.push(targetPath);
  }

  return moved;
}

async function normalizeLetters(paths) {
  const entries = await fs.readdir(paths.lettersDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".md") continue;
    const filePath = path.join(paths.lettersDir, entry.name);
    const stats = await fs.stat(filePath);
    const rawContent = await fs.readFile(filePath, "utf8");
    const createdAt = stats.birthtime instanceof Date && !Number.isNaN(stats.birthtime.valueOf())
      ? stats.birthtime.toISOString()
      : new Date().toISOString();
    const nextContent = buildLetterContent(rawContent, path.basename(entry.name, ".md"), createdAt);
    if (normalizeLineEndings(rawContent) !== nextContent) {
      await fs.writeFile(filePath, nextContent, "utf8");
    }
  }
}

async function syncVault(baseDir = process.cwd()) {
  const paths = getVaultPaths(baseDir);
  await ensureVaultLayout(paths);
  const moved = await routeInboxFiles(paths);
  await normalizeLetters(paths);
  return { paths, moved };
}

async function runSelfCheck() {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "bunny-brain-"));
  const paths = getVaultPaths(tmpRoot);

  await ensureVaultLayout(paths);
  assert.equal(await fileExists(paths.indexFile), true);
  assert.equal(await fileExists(path.join(paths.worldDir, "世界观.md")), true);
  assert.equal(await fileExists(path.join(paths.libraryDir, "写作规范.md")), true);

  const inboxLetter = path.join(paths.inboxDir, "雨后小信.md");
  const originalBody = "# 雨后小信\r\n\r\n今天也许有点难，但我想把它记下来。\r\n";
  await fs.writeFile(inboxLetter, originalBody, "utf8");
  await routeInboxFiles(paths);

  const letterPath = path.join(paths.lettersDir, "雨后小信.md");
  const letterContent = await fs.readFile(letterPath, "utf8");
  assert.match(letterContent, /^---\nid: /);
  assert.match(letterContent, /title: "雨后小信"/);
  assert.match(letterContent, /status: draft/);
  assert.equal(letterContent.endsWith(originalBody), true);

  const worldInbox = path.join(paths.inboxDir, "世界观.md");
  await fs.writeFile(worldInbox, "# 世界观\n\n兔兔住在会保存情绪的花园里。\n", "utf8");
  await routeInboxFiles(paths);
  const worldContent = await fs.readFile(path.join(paths.worldDir, "世界观.md"), "utf8");
  assert.match(worldContent, /会保存情绪的花园/);

  const anthologyPath = path.join(tmpRoot, "Bunny Test Vol1.md");
  await fs.writeFile(
    anthologyPath,
    [
      "# Bunny Test",
      "",
      "## Vol.1｜测试主题｜001–002",
      "",
      "---",
      "",
      "### 001｜第一封",
      "",
      "第一段。",
      "",
      "---",
      "",
      "### 002｜第二封",
      "",
      "第二段。",
      "",
      "---",
      "",
      "## 使用建议"
    ].join("\n"),
    "utf8"
  );
  const { imported } = await importAnthologyFiles(tmpRoot, [anthologyPath]);
  assert.equal(imported.length, 2);
  const importedContent = await fs.readFile(imported[0], "utf8");
  assert.match(importedContent, /title: "第一封"/);
  assert.match(importedContent, /chapter: 001/);
  assert.match(importedContent, /volume: Vol\.1/);
  assert.match(importedContent, /theme: 测试主题/);
  assert.match(importedContent, /### 001｜第一封/);
  assert.doesNotMatch(importedContent, /使用建议/);

  await fs.rm(tmpRoot, { recursive: true, force: true });
}

async function main() {
  const command = process.argv[2] ?? "sync";

  if (command === "init") {
    const { paths } = await syncVault();
    console.log(`Vault ready: ${paths.vaultDir}`);
    return;
  }

  if (command === "sync") {
    const { paths, moved } = await syncVault();
    console.log(`Vault synced: ${paths.vaultDir}`);
    console.log(`Moved ${moved.length} markdown file(s).`);
    return;
  }

  if (command === "self-check") {
    await runSelfCheck();
    console.log("Self-check passed.");
    return;
  }

  if (command === "import-anthology") {
    const sourceFiles = process.argv.slice(3);
    const { paths, imported } = await importAnthologyFiles(process.cwd(), sourceFiles);
    console.log(`Anthologies imported into: ${paths.lettersDir}`);
    console.log(`Created ${imported.length} letter file(s).`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
