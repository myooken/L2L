// scripts/check-licenses.mjs
import fs from "node:fs";

const licensesJsonPath = "licenses.json"; // npx license-checker --json で作るやつ
const pkgJsonPath = "package.json";

// 1. プロジェクト自身のライセンス確認
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
const projectLicense = pkg.license ?? "(not set)";

// 将来ライセンス変えたくなったらここだけ書き換えればいい
const expectedProjectLicense = "MIT";

if (projectLicense !== expectedProjectLicense) {
    console.error(
        `[ERROR] package.json の license が想定と違う。期待値: ${expectedProjectLicense}, 実際: ${projectLicense}`
    );
    process.exit(1);
}

// 自分自身の package 名+version（license-checker のキーと合わせる）
const projectName = pkg.name;
const projectVersion = pkg.version;
const projectId = `${projectName}@${projectVersion}`;

// 2. 依存ライセンス一覧の読み込み
const text = fs.readFileSync(licensesJsonPath, "utf8");
const data = JSON.parse(text); // license-checker の --json 出力

// 許可ライセンスと禁止ライセンスの簡易ポリシー
const allowExact = new Set([
    "MIT",
    "ISC",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "Apache-2.0",
    // ↓必要に応じて追加
    "Python-2.0",
    "CC-BY-4.0",
]);

const denyPatterns = [
    /^GPL/i,
    /^AGPL/i,
    /^LGPL/i,
    /^MPL/i,
    /^CC-BY-NC/i,
];

const denyExact = new Set([
    "UNLICENSED",
    "UNKNOWN",
]);

const badDeps = [];

for (const [pkgName, info] of Object.entries(data)) {
    // 👇 自分自身（ルートプロジェクト）はここで除外
    if (pkgName === projectId) {
        continue;
    }

    const lic = info.licenses || "UNKNOWN";

    // 明示的に許可されているなら OK
    if (allowExact.has(lic)) continue;

    // 明示的に禁止
    if (denyExact.has(lic)) {
        badDeps.push({ pkgName, lic, reason: "denyExact" });
        continue;
    }

    // パターンマッチ（GPL*, LGPL* など）
    if (denyPatterns.some((re) => re.test(lic))) {
        badDeps.push({ pkgName, lic, reason: "denyPattern" });
        continue;
    }

    // どちらでもないものは警告として扱う
    console.warn(
        `[WARN] 許可/禁止のどちらにも含まれていないパッケージ："${lic}" ライセンス名： ${pkgName}`
    );
}

// NG があれば CI 失敗にする
if (badDeps.length > 0) {
    console.error(
        "\n[ERROR] ポリシーに反するライセンスを持つ依存が発見されました。："
    );
    for (const d of badDeps) {
        console.error(`  - ${d.pkgName}: ${d.lic} (${d.reason})`);
    }
    process.exit(1);
}

console.log("[OK] ライセンスチェック終了（MIT 前提で問題なし）");
