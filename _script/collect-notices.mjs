// Collect NOTICE files from license-checker output (licenses.json) and
// - copy them into docs/licenses/notices/<pkg>.NOTICE.txt
// - aggregate them into THIRD-PARTY-NOTICES.md (root + docs/licenses)
// Prerequisite: run `npm run licenses:scan` first to refresh licenses.json.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const LICENSES_JSON_PATH = path.join(ROOT, "licenses.json");
const NOTICES_DIR = path.join(ROOT, "docs", "licenses", "notices");
const THIRD_PARTY_SRC = path.join(ROOT, "THIRD-PARTY-NOTICES.md");
const THIRD_PARTY_DEST = path.join(ROOT, "docs", "licenses", "THIRD-PARTY-NOTICES.md");
const REPORTS_DIR = path.join(ROOT, "reports");

const NOTICE_CANDIDATES = [
    "NOTICE",
    "NOTICE.txt",
    "NOTICE.md",
    "Notices.txt",
    "NOTICES",
    "NOTICES.txt",
];

const sanitizePackageId = (pkgId) => pkgId.replace(/[\\/]/g, "__");

const ensureDir = async (dir) => {
    await fsp.mkdir(dir, { recursive: true });
};

const findNoticeFile = async (info) => {
    if (info.path && fs.existsSync(info.path)) {
        for (const candidate of NOTICE_CANDIDATES) {
            const noticePath = path.join(info.path, candidate);
            if (fs.existsSync(noticePath) && fs.lstatSync(noticePath).isFile()) {
                return noticePath;
            }
        }
    }

    if (info.licenseFile) {
        const licenseDir = path.dirname(info.licenseFile);
        if (fs.existsSync(licenseDir)) {
            for (const candidate of NOTICE_CANDIDATES) {
                const noticePath = path.join(licenseDir, candidate);
                if (fs.existsSync(noticePath) && fs.lstatSync(noticePath).isFile()) {
                    return noticePath;
                }
            }
        }
    }

    return null;
};

const appendStepSummary = async (lines) => {
    if (!process.env.GITHUB_STEP_SUMMARY) return;
    await fsp.appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n"));
};

const main = async () => {
    await ensureDir(NOTICES_DIR);
    await ensureDir(REPORTS_DIR);

    const raw = await fsp.readFile(LICENSES_JSON_PATH, "utf8");
    const data = JSON.parse(raw);

    const copied = [];
    const missingSource = [];

    for (const [pkgId, info] of Object.entries(data)) {
        const noticePath = await findNoticeFile(info);
        if (!noticePath) {
            missingSource.push(pkgId);
            continue;
        }

        const dest = path.join(NOTICES_DIR, `${sanitizePackageId(pkgId)}.NOTICE.txt`);
        await fsp.copyFile(noticePath, dest);
        copied.push({
            pkgId,
            source: noticePath,
            dest,
            text: (await fsp.readFile(noticePath, "utf8")).trimEnd(),
        });
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

    // Build THIRD-PARTY-NOTICES.md (root + docs)
    const noticeDocLines = [];
    noticeDocLines.push("# Third-Party Notices");
    noticeDocLines.push("");
    noticeDocLines.push(`Generated: ${new Date().toISOString()}`);
    noticeDocLines.push("");

    copied.forEach((item) => {
        noticeDocLines.push(`## ${item.pkgId}`);
        noticeDocLines.push(`Source: ${path.relative(ROOT, item.source)}`);
        noticeDocLines.push("");
        noticeDocLines.push("```text");
        noticeDocLines.push(item.text);
        noticeDocLines.push("```");
        noticeDocLines.push("");
    });

    await fsp.writeFile(THIRD_PARTY_SRC, noticeDocLines.join("\n"));
    await ensureDir(path.dirname(THIRD_PARTY_DEST));
    await fsp.writeFile(THIRD_PARTY_DEST, noticeDocLines.join("\n"));
};

main().catch((err) => {
    console.error(`::error::NOTICE collection failed: ${err.message}`);
    process.exit(1);
});
