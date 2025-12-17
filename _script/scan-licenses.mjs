import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "docs", "licenses");
const THIRD_PARTY_SRC = path.join(ROOT, "THIRD-PARTY-LICENSES.md");
const THIRD_PARTY_DEST = path.join(DOCS_DIR, "THIRD-PARTY-LICENSES.md");
const LICENSES_JSON_PATH = path.join(ROOT, "licenses.json");
const CUSTOM_FORMAT_PATH = path.join(ROOT, "_script", "license-checker-format.json");

const ensureDir = async (dir) => {
    await fsp.mkdir(dir, { recursive: true });
};

const toProjectId = (pkg) => `${pkg.name}@${pkg.version}`;

const resolveLicenseChecker = () => {
    const bin = process.platform === "win32" ? "license-checker.cmd" : "license-checker";
    const binPath = path.join(ROOT, "node_modules", ".bin", bin);
    if (!fs.existsSync(binPath)) {
        throw new Error("license-checker is not installed. Run npm install first.");
    }
    return binPath;
};

const buildCommand = (args) => {
    const bin = resolveLicenseChecker();
    if (process.platform === "win32") {
        return { file: "cmd.exe", args: ["/c", bin, ...args] };
    }
    return { file: bin, args };
};

const runLicenseChecker = async (args) => {
    const cmd = buildCommand(args);
    const { stdout } = await execFileAsync(cmd.file, cmd.args, {
        cwd: ROOT,
        maxBuffer: 20 * 1024 * 1024,
    });
    return stdout;
};

const sortJsonByKey = (data) =>
    Object.fromEntries(Object.keys(data).sort().map((key) => [key, data[key]]));

const readLicenseText = async (info) => {
    if (info.licenseText && String(info.licenseText).trim()) {
        return String(info.licenseText).trimEnd();
    }
    const licenseFile = info.licenseFile
        ? path.isAbsolute(info.licenseFile)
            ? info.licenseFile
            : path.join(ROOT, info.licenseFile)
        : null;
    if (licenseFile && fs.existsSync(licenseFile)) {
        return (await fsp.readFile(licenseFile, "utf8")).trimEnd();
    }
    return null;
};

const buildOutputs = async (projectId) => {
    const jsonArgs = [
        "--json",
        "--production",
        "--customPath",
        CUSTOM_FORMAT_PATH,
        "--excludePackages",
        projectId,
    ];

    const [jsonOutput, mdOutput] = await Promise.all([
        runLicenseChecker(jsonArgs),
    ]);

    const jsonData = sortJsonByKey(JSON.parse(jsonOutput));
    delete jsonData[projectId];

    const lines = [];
    lines.push("# Third-Party Licenses");
    lines.push("");
    for (const [pkgId, info] of Object.entries(jsonData)) {
        lines.push(`## ${pkgId}`);
        if (info.repository) {
            lines.push(`- Repository: ${info.repository}`);
        }
        if (info.licenses) {
            lines.push(`- License: ${info.licenses}`);
        }
        if (info.licenseFile) {
            const relPath = path.isAbsolute(info.licenseFile)
                ? path.relative(ROOT, info.licenseFile)
                : info.licenseFile;
            lines.push(`- License file: ${relPath}`);
        }
        lines.push("");

        const text = await readLicenseText(info);
        if (text) {
            lines.push("```text");
            lines.push(text);
            lines.push("```");
        } else {
            lines.push("_License text could not be found._");
        }
        lines.push("");
    }

    const markdown = lines.join("\n");

    return { jsonData, markdown };
};

const main = async () => {
    const pkg = JSON.parse(await fsp.readFile(path.join(ROOT, "package.json"), "utf8"));
    const projectId = toProjectId(pkg);

    await ensureDir(DOCS_DIR);

    const { jsonData, markdown } = await buildOutputs(projectId);

    await fsp.writeFile(LICENSES_JSON_PATH, JSON.stringify(jsonData, null, 2));
    await Promise.all([
        fsp.writeFile(THIRD_PARTY_SRC, markdown),
        fsp.writeFile(THIRD_PARTY_DEST, markdown),
    ]);

    console.log(
        `[OK] licenses.json と THIRD-PARTY-LICENSES.md を出力しました (excluded ${projectId})`
    );
};

main().catch((err) => {
    console.error(`::error::license scan failed: ${err.message}`);
    process.exit(1);
});
