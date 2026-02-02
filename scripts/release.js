const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkgPath = path.join(root, "package.json");
const serverRoot = path.resolve(root, "..", "cinesuper-upr2", "server");

function readPkg() {
  return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
}

function writePkg(pkg) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function bumpVersion(v, kind) {
  const parts = String(v).split(".").map((x) => parseInt(x, 10));
  const [maj, min, pat] = [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  if (kind === "major") return `${maj + 1}.0.0`;
  if (kind === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

function hasGit() {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function hasServerChanges() {
  if (!hasGit()) return true;
  try {
    const out = execSync("git status --porcelain", { cwd: serverRoot }).toString().trim();
    return out.length > 0;
  } catch {
    return true;
  }
}

function requireGhToken() {
  if (!process.env.GH_TOKEN) {
    console.error("GH_TOKEN não definido.");
    process.exit(1);
  }
}

function main() {
  const arg = String(process.argv[2] || "patch").toLowerCase();
  const kind = arg === "major" || arg === "minor" ? arg : "patch";
  requireGhToken();

  if (!hasServerChanges()) {
    console.log("Sem mudanças no server. Release cancelado.");
    process.exit(0);
  }

  const pkg = readPkg();
  const next = bumpVersion(pkg.version || "0.0.0", kind);
  pkg.version = next;
  writePkg(pkg);

  const env = {
    ...process.env,
    CSC_IDENTITY_AUTO_DISCOVERY: "false",
    ELECTRON_BUILDER_CACHE: path.join(root, ".eb-cache"),
  };
  execSync("npm run dist -- --publish always", { stdio: "inherit", cwd: root, env });
  console.log(`Release publicado: v${next}`);
}

main();
