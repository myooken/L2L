// Apache-2.0 依存の NOTICE を docs/licenses/notices に集めるスクリプト。
// license-checker の出力 (licenses.json) を元に、各パッケージ配下の NOTICE* をコピーする。
// 1 回のコピー結果と不足一覧を reports/notice-collection.md に残す。
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import spdxParse from "spdx-expression-parse";

const parseSpdx = spdxParse;

const ROOT = process.cwd();
const LICENSES_JSON_PATH = path.join(ROOT, "licenses.json");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");
const NOTICES_DIR = path.join(ROOT, "docs", "licenses", "notices");
const REPORTS_DIR = path.join(ROOT, "reports");

const sanitizePackageId = (pkgId) => pkgId.replace(/[\\/]/g, "__");

const ensureDir = async (dir) => {
    await fsp.mkdir(dir, { recursive: true });
};

const normalizeLicenses = (value) => {
    if (!value) return "";
    if (Array.isArray(value)) return value.filter(Boolean).join(" OR ");
    return String(value).trim();
};

const splitFallbackIds = (expression) =>
    expression
        .replace(/[()]/g, " ")
        .split(/(?:AND|OR|WITH|,|\/)/i)
        .map((part) => part.trim())
        .filter(Boolean);

// SPDX 式を厳密パースし、失敗したら簡易分解
const extractIds = (expression) => {
    const trimmed = expression.trim();
    try {
        const ast = parseSpdx(trimmed);
        const walk = (node) => {
            if (!node) return [];
            if (node.license) return [node.license];
            return [...walk(node.left), ...walk(node.right)];
        };
        return [...new Set(walk(ast))];
    } catch {
        return [...new Set(splitFallbackIds(trimmed))];
    }
};

// package 配下で NOTICE* を探す
const findNoticeFile = async (info) => {
    if (info.noticeFile && fs.existsSync(info.noticeFile)) {
        return info.noticeFile;
    }
    if (!info.licenseFile || !fs.existsSync(info.licenseFile)) {
        return null;
    }
    const pkgDir = path.dirname(info.licenseFile);
    const entries = await fsp.readdir(pkgDir, { withFileTypes: true });
    const hit = entries.find(
        (entry) => entry.isFile() && /^NOTICE(\.|$)/i.test(entry.name)
    );
    return hit ? path.join(pkgDir, hit.name) : null;
};

const appendStepSummary = async (lines) => {
    if (!process.env.GITHUB_STEP_SUMMARY) return;
    await fsp.appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n"));
};

const main = async () => {
    await ensureDir(NOTICES_DIR);
    await ensureDir(REPORTS_DIR);

    // licenses.json を読み、プロジェクト自身を除外
    const raw = await fsp.readFile(LICENSES_JSON_PATH, "utf8");
    const data = JSON.parse(raw);
    const pkg = JSON.parse(await fsp.readFile(PACKAGE_JSON_PATH, "utf8"));
    const projectId = `${pkg.name}@${pkg.version}`;

    const copied = [];
    const missingSource = [];

    for (const [pkgId, info] of Object.entries(data)) {
        if (pkgId === projectId) continue;

        const expression = normalizeLicenses(info.licenses);
        const ids = extractIds(expression);
        if (!ids.includes("Apache-2.0")) {
            continue;
        }

        const noticePath = await findNoticeFile(info);
        if (!noticePath) {
            missingSource.push(pkgId);
            continue;
        }

        const dest = path.join(NOTICES_DIR, `${sanitizePackageId(pkgId)}.NOTICE.txt`);
        await fsp.copyFile(noticePath, dest);
        copied.push({ pkgId, source: noticePath, dest });
    }

    const summaryLines = [];
    summaryLines.push("# NOTICE collection");
    summaryLines.push("");
    summaryLines.push(`- Copied: ${copied.length}`);
    summaryLines.push(`- Missing in packages: ${missingSource.length}`);
    summaryLines.push("");

    if (copied.length > 0) {
        summaryLines.push("## Copied files");
        copied.forEach((item) =>
            summaryLines.push(`- ${item.pkgId}: ${path.relative(ROOT, item.dest)}`)
        );
        summaryLines.push("");
    }

    if (missingSource.length > 0) {
        summaryLines.push("## Packages without NOTICE detected");
        missingSource.forEach((pkgId) => summaryLines.push(`- ${pkgId}`));
        summaryLines.push("");
    }

    await fsp.writeFile(
        path.join(REPORTS_DIR, "notice-collection.md"),
        summaryLines.join("\n")
    );
    await appendStepSummary(summaryLines);

    copied.forEach((item) =>
        console.log(`[notice] copied ${item.pkgId} -> ${path.relative(ROOT, item.dest)}`)
    );
    missingSource.forEach((pkgId) =>
        console.log(`[notice] ${pkgId}: NOTICE not found in package`)
    );
};

main().catch((err) => {
    console.error(`::error::NOTICE 収集中にエラー: ${err.message}`);
    process.exit(1);
});
