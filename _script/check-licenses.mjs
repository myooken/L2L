// ライセンス検証のメインスクリプト。
// 役割:
//   - package.json の license が MIT かチェック
//   - license-checker が出した licenses.json を走査し、許可/禁止/未知のライセンスを検出
//   - SPDX 式を分解して texts/ の本文有無を確認
//   - Apache NOTICE と CC-BY の付随ファイルの有無を確認
//   - 結果を reports/ に JSON / Markdown で残し、GitHub Actions の annotation/summary へ出力
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import spdxParse from "spdx-expression-parse";

const parseSpdx = spdxParse; // CJS なので named import を割り当て

const ROOT = process.cwd(); // リポジトリルート想定
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");
const LICENSES_JSON_PATH = path.join(ROOT, "licenses.json");
const DOCS_ROOT = path.join(ROOT, "docs", "licenses");
const TEXTS_DIR = path.join(DOCS_ROOT, "texts");
const NOTICES_DIR = path.join(DOCS_ROOT, "notices");
const ATTRIBUTION_PATH = path.join(DOCS_ROOT, "ATTRIBUTION.md");
const REPORTS_DIR = path.join(ROOT, "reports");

const EXPECTED_PROJECT_LICENSE = "MIT";

// 許可/禁止リスト（必要に応じて追加・調整する）
const ALLOWED_LICENSES = new Set([
    "MIT",
    "MIT-0",
    "ISC",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "Apache-2.0",
    "CC0-1.0",
    "CC-BY-3.0",
    "CC-BY-4.0",
    "BlueOak-1.0.0",
    "Python-2.0",
]);

const DENIED_LICENSES = new Set(["UNLICENSED", "UNKNOWN"]);
const DENY_PATTERNS = [/^GPL/i, /^AGPL/i, /^LGPL/i, /^MPL/i, /^CC-BY-NC/i];

// 集計・出力用のバッファ
const errors = [];
const warnings = [];

const summary = {
    project: {},
    dependencies: {
        total: 0,
        licenses: new Map(),
    },
    missingLicenseTexts: new Map(),
    denied: [],
    unknown: [],
    parseErrors: [],
    missingNotices: [],
    ccByDeps: [],
};

const logError = (message) => {
    errors.push(message);
    console.error(`::error::${message}`);
};

const logWarning = (message) => {
    warnings.push(message);
    console.warn(`::warning::${message}`);
};

const ensureDir = async (dir) => {
    await fsp.mkdir(dir, { recursive: true });
};

// license-checker 出力の licenses フィールドを文字列に整形
const normalizeLicenses = (value) => {
    if (!value) return "";
    if (Array.isArray(value)) {
        return value.filter(Boolean).join(" OR ");
    }
    return String(value).trim();
};

// パスに使えない文字を避けて Apache NOTICE 用ファイル名を組み立てる
const sanitizePackageId = (pkgId) => pkgId.replace(/[\\/]/g, "__");

// SPDX AST からライセンス ID を列挙
const collectIdsFromAst = (node) => {
    if (!node) return [];
    if (node.license) return [node.license];
    return [...collectIdsFromAst(node.left), ...collectIdsFromAst(node.right)];
};

// パース失敗時のフォールバック簡易分解
const splitFallbackIds = (expression) =>
    expression
        .replace(/[()]/g, " ")
        .split(/(?:AND|OR|WITH|,|\/)/i)
        .map((part) => part.trim())
        .filter(Boolean);

// SPDX 式からライセンス ID を抽出（厳密パースが駄目ならフォールバック）
const extractLicenseIds = (expression, pkgId) => {
    const trimmed = expression.trim();
    try {
        return [...new Set(collectIdsFromAst(parseSpdx(trimmed)))];
    } catch (err) {
        summary.parseErrors.push({ pkgId, expression, error: err.message });
        logWarning(
            `[parse] ${pkgId} のライセンス式 "${trimmed}" を厳密解釈できませんでした。簡易分解で判定します。`
        );
        return [...new Set(splitFallbackIds(trimmed))];
    }
};

const isDeniedId = (id) =>
    DENIED_LICENSES.has(id) || DENY_PATTERNS.some((pattern) => pattern.test(id));

const isAllowedId = (id) => {
    if (ALLOWED_LICENSES.has(id)) return true;
    if (/^CC-BY(-\d\.\d)?$/i.test(id)) return true;
    if (/^BSD-2-Clause(-.+)?$/i.test(id)) return true;
    if (/^BSD-3-Clause(-.+)?$/i.test(id)) return true;
    return false;
};

// package 配下で NOTICE ファイルを探す（license-checker の noticeFile が無くても拾う）
const hasNoticeFile = async (info) => {
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

// JSON ロードのラッパー（エラー時に annotation を出す）
const loadJson = async (filePath, label) => {
    try {
        const text = await fsp.readFile(filePath, "utf8");
        return JSON.parse(text);
    } catch (err) {
        logError(`[init] ${label} を読み込めませんでした: ${err.message}`);
        throw err;
    }
};

// 下記は全てレポート生成用のユーティリティ
const recordLicenseUsage = (id, pkgId) => {
    if (!summary.dependencies.licenses.has(id)) {
        summary.dependencies.licenses.set(id, []);
    }
    summary.dependencies.licenses.get(id).push(pkgId);
};

const recordMissingText = (id, pkgId) => {
    if (!summary.missingLicenseTexts.has(id)) {
        summary.missingLicenseTexts.set(id, new Set());
    }
    summary.missingLicenseTexts.get(id).add(pkgId);
};

const buildReportFiles = async () => {
    await ensureDir(REPORTS_DIR);
    const licenseMap = Object.fromEntries(
        [...summary.dependencies.licenses.entries()].map(([id, pkgs]) => [
            id,
            [...new Set(pkgs)].sort(),
        ])
    );
    const missingTexts = Object.fromEntries(
        [...summary.missingLicenseTexts.entries()].map(([id, pkgs]) => [
            id,
            [...pkgs].sort(),
        ])
    );
    const reportJson = {
        project: summary.project,
        dependencies: {
            total: summary.dependencies.total,
            licenses: licenseMap,
        },
        denied: summary.denied,
        unknown: summary.unknown,
        parseErrors: summary.parseErrors,
        missingLicenseTexts: missingTexts,
        missingNotices: summary.missingNotices,
        ccByDeps: summary.ccByDeps,
        warnings,
        errors,
    };
    const jsonPath = path.join(REPORTS_DIR, "license-report.json");
    const mdPath = path.join(REPORTS_DIR, "license-report.md");

    await fsp.writeFile(jsonPath, JSON.stringify(reportJson, null, 2));

    const mdLines = [];
    mdLines.push("# License Check Report");
    mdLines.push("");
    mdLines.push(
        `- Project: ${summary.project.name}@${summary.project.version} (${summary.project.license})`
    );
    mdLines.push(`- Dependencies scanned: ${summary.dependencies.total}`);
    mdLines.push(`- Errors: ${errors.length}`);
    mdLines.push(`- Warnings: ${warnings.length}`);
    mdLines.push("");
    if (errors.length > 0) {
        mdLines.push("## Errors");
        errors.forEach((err) => mdLines.push(`- ${err}`));
        mdLines.push("");
    }
    if (warnings.length > 0) {
        mdLines.push("## Warnings");
        warnings.forEach((warn) => mdLines.push(`- ${warn}`));
        mdLines.push("");
    }
    if (Object.keys(missingTexts).length > 0) {
        mdLines.push("## Missing License Texts");
        for (const [id, pkgs] of Object.entries(missingTexts)) {
            mdLines.push(`- ${id}: ${pkgs.join(", ")}`);
        }
        mdLines.push("");
    }
    if (summary.missingNotices.length > 0) {
        mdLines.push("## Missing NOTICE files");
        summary.missingNotices.forEach((item) => {
            mdLines.push(
                `- ${item.pkgId}: expected ${item.expected} (source ${item.source ?? "unknown"})`
            );
        });
        mdLines.push("");
    }
    await fsp.writeFile(mdPath, mdLines.join("\n"));
};

// GitHub Actions の Step Summary にも簡易版を追記
const appendStepSummary = async () => {
    if (!process.env.GITHUB_STEP_SUMMARY) return;
    const lines = [];
    const projectLine = `${summary.project.name}@${summary.project.version} — package.json license: ${summary.project.license} (expected ${EXPECTED_PROJECT_LICENSE})`;
    lines.push(`# License Check`);
    lines.push("");
    lines.push(`- ${projectLine}`);
    lines.push(`- Dependencies scanned: ${summary.dependencies.total}`);
    lines.push(`- Errors: ${errors.length}`);
    lines.push(`- Warnings: ${warnings.length}`);
    lines.push("");
    if (errors.length > 0) {
        lines.push("## What failed");
        errors.forEach((err) => lines.push(`- ${err}`));
        lines.push("");
    }
    if (warnings.length > 0) {
        lines.push("## Warnings");
        warnings.forEach((warn) => lines.push(`- ${warn}`));
        lines.push("");
    }
    if (summary.ccByDeps.length > 0) {
        lines.push(
            `- Attribution required for CC-BY dependencies: ${summary.ccByDeps.join(", ")}`
        );
        lines.push("");
    }
    await fsp.appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n"));
};

const main = async () => {
    // package.json / licenses.json をロード
    const pkg = await loadJson(PACKAGE_JSON_PATH, "package.json");
    const data = await loadJson(LICENSES_JSON_PATH, "licenses.json");

    summary.project = {
        name: pkg.name,
        version: pkg.version,
        license: pkg.license ?? "(not set)",
        expected: EXPECTED_PROJECT_LICENSE,
    };

    if (summary.project.license !== EXPECTED_PROJECT_LICENSE) {
        logError(
            `[project] package.json の license が想定 (${EXPECTED_PROJECT_LICENSE}) と異なります: ${summary.project.license}`
        );
    }

    const projectId = `${pkg.name}@${pkg.version}`;

    for (const [pkgId, info] of Object.entries(data)) {
        if (pkgId === projectId) continue; // skip root project

        summary.dependencies.total += 1;
        const expression = normalizeLicenses(info.licenses);

        if (!expression) {
            logError(`[${pkgId}] license 情報が空です。license-checker の出力を確認してください。`);
            summary.unknown.push({ pkgId, license: expression });
            continue;
        }

        // SPDX 式を分解して個別のライセンス ID を取得
        const ids = extractLicenseIds(expression, pkgId);
        ids.forEach((id) => recordLicenseUsage(id, pkgId));

        // 禁止ライセンス検知
        const deniedIds = ids.filter(isDeniedId);
        if (deniedIds.length > 0) {
            logError(`[${pkgId}] 禁止ライセンスを検出: ${deniedIds.join(", ")}`);
            summary.denied.push({ pkgId, license: expression, denied: deniedIds });
        }

        // 許可リスト外（ただし禁止でもない）を unknown として扱う
        const unknownIds = ids.filter((id) => !isAllowedId(id) && !isDeniedId(id));
        if (unknownIds.length > 0) {
            logError(`[${pkgId}] 許可リスト外のライセンス: ${unknownIds.join(", ")}`);
            summary.unknown.push({ pkgId, license: expression, unknownIds });
        }

        // texts/ に本文が存在するか確認
        ids.forEach((id) => {
            const textPath = path.join(TEXTS_DIR, `${id}.txt`);
            if (!fs.existsSync(textPath)) {
                logError(
                    `[texts] docs/licenses/texts/${id}.txt が見つかりません（依存: ${pkgId}）`
                );
                recordMissingText(id, pkgId);
            }
        });

        // CC-BY の存在はあとで ATTRIBUTION を要求
        if (ids.some((id) => /^CC-BY/i.test(id))) {
            summary.ccByDeps.push(pkgId);
        }

        // Apache の場合は NOTICE 必須チェック
        if (ids.includes("Apache-2.0")) {
            const noticeSource = await hasNoticeFile(info);
            const expectedNotice = path.join(
                NOTICES_DIR,
                `${sanitizePackageId(pkgId)}.NOTICE.txt`
            );
            if (noticeSource && !fs.existsSync(expectedNotice)) {
                logError(
                    `[notice] Apache-2.0 依存 ${pkgId} の NOTICE が docs/licenses/notices にありません（期待: ${path.relative(
                        ROOT,
                        expectedNotice
                    )} / source: ${noticeSource}）`
                );
                summary.missingNotices.push({
                    pkgId,
                    expected: path.relative(ROOT, expectedNotice),
                    source: noticeSource,
                });
            }
        }
    }

    summary.ccByDeps = [...new Set(summary.ccByDeps)];

    if (summary.ccByDeps.length > 0) {
        if (!fs.existsSync(ATTRIBUTION_PATH)) {
            logError(
                `[attribution] CC-BY ライブラリがありますが docs/licenses/ATTRIBUTION.md がありません。対象: ${summary.ccByDeps.join(
                    ", "
                )}`
            );
        } else if (!fs.readFileSync(ATTRIBUTION_PATH, "utf8").trim()) {
            logError(
                `[attribution] docs/licenses/ATTRIBUTION.md の中身が空です。対象: ${summary.ccByDeps.join(
                    ", "
                )}`
            );
        }
    }

    await buildReportFiles();
    await appendStepSummary();

    if (errors.length > 0) {
        console.error(`[FAIL] ライセンスチェックで ${errors.length} 件の問題を検出しました。`);
        process.exit(1);
    }

    console.log(
        `[OK] ライセンスチェック完了。依存 ${summary.dependencies.total} 件を確認しました。`
    );
};

main().catch((err) => {
    console.error(`::error::予期しないエラー: ${err.message}`);
    process.exit(1);
});
