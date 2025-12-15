// docs/licenses/index.md を自動生成するスクリプト。
// 役割:
//   - LICENSE の本文を折りたたみで表示
//   - THIRD-PARTY-LICENSES.md を docs/ 配下にコピー
//   - texts/ と notices/ をディレクトリ走査して <details> で列挙
//   - licenses.json を読んでライセンス別の件数表を挿入
//   - レポートを reports/license-page.md に残し、必要なら Step Summary に追記
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import spdxParse from "spdx-expression-parse";

const parseSpdx = spdxParse;

const ROOT = process.cwd();
const DOCS_ROOT = path.join(ROOT, "docs", "licenses");
const TEXTS_DIR = path.join(DOCS_ROOT, "texts");
const NOTICES_DIR = path.join(DOCS_ROOT, "notices");
const ATTRIBUTION_PATH = path.join(DOCS_ROOT, "ATTRIBUTION.md");
const LICENSE_PAGE_PATH = path.join(DOCS_ROOT, "index.md");
const THIRD_PARTY_SRC = path.join(ROOT, "THIRD-PARTY-LICENSES.md");
const THIRD_PARTY_DEST = path.join(DOCS_ROOT, "THIRD-PARTY-LICENSES.md");
const LICENSES_JSON_PATH = path.join(ROOT, "licenses.json");
const REPORTS_DIR = path.join(ROOT, "reports");

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

// SPDX 式を解釈し、失敗時は簡易分解
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

// licenses.json を集計してライセンス毎の件数を返す
const readLicenseCounts = async () => {
    if (!fs.existsSync(LICENSES_JSON_PATH)) return { total: 0, counts: new Map() };
    const json = JSON.parse(await fsp.readFile(LICENSES_JSON_PATH, "utf8"));
    const pkg = JSON.parse(await fsp.readFile(path.join(ROOT, "package.json"), "utf8"));
    const projectId = `${pkg.name}@${pkg.version}`;
    const counts = new Map();
    let total = 0;
    for (const [pkgId, info] of Object.entries(json)) {
        if (pkgId === projectId) continue;
        total += 1;
        const ids = extractIds(normalizeLicenses(info.licenses));
        ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
    }
    return { total, counts };
};

// Markdown の <details> をお手軽生成
const renderDetails = (title, bodyLines) => [
    "<details>",
    `<summary>${title}</summary>`,
    "",
    ...bodyLines,
    "</details>",
    "",
];

const main = async () => {
    // 必要ディレクトリを用意
    await Promise.all([
        ensureDir(DOCS_ROOT),
        ensureDir(TEXTS_DIR),
        ensureDir(NOTICES_DIR),
        ensureDir(REPORTS_DIR),
    ]);

    // THIRD-PARTY-LICENSES.md を docs 配下にコピー（Pages で閲覧できるようにする）
    if (fs.existsSync(THIRD_PARTY_SRC)) {
        await fsp.copyFile(THIRD_PARTY_SRC, THIRD_PARTY_DEST);
    }

    // プロジェクトの LICENSE 本文
    const projectLicense = fs.existsSync(path.join(ROOT, "LICENSE"))
        ? await fsp.readFile(path.join(ROOT, "LICENSE"), "utf8")
        : "";

    // 依存ライセンス件数の集計
    const { total: dependencyCount, counts: licenseCounts } = await readLicenseCounts();

    const lines = [];
    lines.push("# Licenses");
    lines.push("");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");

    lines.push("## This Project");
    lines.push("- License: MIT (package.json)");
    lines.push("- Source: LICENSE");
    lines.push("");
    if (projectLicense) {
        lines.push(
            ...renderDetails("MIT License (full text)", [
                "```text",
                projectLicense.trimEnd(),
                "```",
            ])
        );
    }

    lines.push("## Third-Party Summary");
    lines.push(`- Dependencies scanned: ${dependencyCount}`);
    if (fs.existsSync(THIRD_PARTY_DEST)) {
        lines.push(`- Third-party list: [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md)`);
    } else {
        lines.push(
            "- Third-party list: (missing) run `npm run licenses:scan` to generate THIRD-PARTY-LICENSES.md"
        );
    }
    lines.push(`- Raw report: licenses.json`);
    lines.push("");

    if (licenseCounts.size > 0) {
        lines.push("### License Distribution");
        lines.push("| License | Packages |");
        lines.push("| --- | --- |");
        for (const [id, count] of [...licenseCounts.entries()].sort()) {
            lines.push(`| ${id} | ${count} |`);
        }
        lines.push("");
    }

    lines.push("## License Texts");
    const licenseFiles = fs.existsSync(TEXTS_DIR)
        ? (await fsp.readdir(TEXTS_DIR)).filter((f) => f.toLowerCase().endsWith(".txt"))
        : [];
    if (licenseFiles.length === 0) {
        lines.push("- No license texts found in docs/licenses/texts.");
        lines.push("");
    } else {
        licenseFiles.sort();
        for (const file of licenseFiles) {
            const content = await fsp.readFile(path.join(TEXTS_DIR, file), "utf8");
            lines.push(
                ...renderDetails(file.replace(/\.txt$/i, ""), [
                    "```text",
                    content.trimEnd(),
                    "```",
                ])
            );
        }
    }

    lines.push("## Notices");
    const noticeFiles = fs.existsSync(NOTICES_DIR)
        ? (await fsp.readdir(NOTICES_DIR)).filter((f) => f.toLowerCase().includes("notice"))
        : [];
    if (noticeFiles.length === 0) {
        lines.push("- No NOTICE files collected yet.");
        lines.push("");
    } else {
        noticeFiles.sort();
        for (const file of noticeFiles) {
            const content = await fsp.readFile(path.join(NOTICES_DIR, file), "utf8");
            lines.push(
                ...renderDetails(file, [
                    "```text",
                    content.trimEnd(),
                    "```",
                ])
            );
        }
    }

    lines.push("## Attribution");
    if (fs.existsSync(ATTRIBUTION_PATH)) {
        const attribution = await fsp.readFile(ATTRIBUTION_PATH, "utf8");
        lines.push(
            ...renderDetails("ATTRIBUTION.md", [
                attribution.trim()
                    ? attribution.trim()
                    : "_ATTRIBUTION.md exists but is empty._",
            ])
        );
    } else {
        lines.push("- No attribution required (ATTRIBUTION.md not present).");
        lines.push("");
    }

    await fsp.writeFile(LICENSE_PAGE_PATH, lines.join("\n"));
    await fsp.writeFile(
        path.join(REPORTS_DIR, "license-page.md"),
        ["# License page", "", `- Generated: ${new Date().toISOString()}`, ""].join("\n")
    );

    if (process.env.GITHUB_STEP_SUMMARY) {
        await fsp.appendFile(
            process.env.GITHUB_STEP_SUMMARY,
            [
                "# License page",
                "",
                `- Generated docs/licenses/index.md`,
                `- License texts: ${licenseFiles.length}`,
                `- Notices: ${noticeFiles.length}`,
                "",
            ].join("\n")
        );
    }

    console.log(
        `[OK] docs/licenses/index.md を更新しました。texts:${licenseFiles.length}, notices:${noticeFiles.length}`
    );
};

main().catch((err) => {
    console.error(`::error::license page 生成でエラー: ${err.message}`);
    process.exit(1);
});
