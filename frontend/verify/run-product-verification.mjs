import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ name, message });
    console.error(`FAIL ${name}`);
    console.error(`  ${message}`);
  }
}

await check("home screen shell uses navbar, sidebar, and video grid", async () => {
  const app = await read("src/App.tsx");
  const home = await read("src/pages/Home.tsx");
  const navbar = await read("src/components/Navbar.tsx");

  assert.match(app, /<Navbar\s*\/>/);
  assert.match(app, /<Sidebar\s*\/>/);
  assert.match(home, /grid/);
  assert.match(navbar, /Search/);
});

await check("login and register routes/pages exist for email-password auth", async () => {
  const app = await read("src/App.tsx");

  assert.ok(await exists("src/pages/Login.tsx"), "Expected src/pages/Login.tsx");
  assert.ok(await exists("src/pages/Register.tsx"), "Expected src/pages/Register.tsx");
  assert.match(app, /path="\/login"/);
  assert.match(app, /path="\/register"/);

  const login = await read("src/pages/Login.tsx");
  const register = await read("src/pages/Register.tsx");

  assert.match(login, /type="email"/);
  assert.match(login, /type="password"/);
  assert.match(register, /type="email"/);
  assert.match(register, /type="password"/);
});

await check("profile dropdown closes on outside click", async () => {
  const navbar = await read("src/components/Navbar.tsx");

  assert.match(navbar, /useRef/);
  assert.match(navbar, /useEffect/);
  assert.match(navbar, /(mousedown|click)/);
  assert.match(navbar, /contains\(/);
});

await check("subscriptions route and page exist", async () => {
  const app = await read("src/App.tsx");

  assert.ok(await exists("src/pages/Subscriptions.tsx"), "Expected src/pages/Subscriptions.tsx");
  assert.match(app, /path="\/subscriptions"/);
});

await check("watch page supports replies and non-emoji comment reactions", async () => {
  const watch = await read("src/pages/Watch.tsx");

  assert.doesNotMatch(watch, /👍|👎/);
  assert.match(watch, /Reply/);
  assert.match(watch, /(replyTo|parentCommentId|replies)/);
});

await check("create video flow exists", async () => {
  const app = await read("src/App.tsx");
  const navbar = await read("src/components/Navbar.tsx");

  assert.ok(await exists("src/pages/CreateVideo.tsx"), "Expected src/pages/CreateVideo.tsx");
  assert.match(app, /path="\/create-video"/);
  assert.match(navbar, /Create/);

  const createVideo = await read("src/pages/CreateVideo.tsx");
  assert.match(createVideo, /Title/i);
  assert.match(createVideo, /Description/i);
  assert.match(createVideo, /(type="file"|thumbnail)/i);
});

await check("repo does not keep committed local secret artifacts", async () => {
  assert.equal(
    await exists("../client_secret_226593134854-g5dg8pcgf8d30l603n9gdq3inkirm0g8.apps.googleusercontent.com.json"),
    false,
    "Remove committed OAuth client secret JSON before publishing"
  );
});

if (failures.length > 0) {
  console.error(`\n${failures.length} verification check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("\nAll verification checks passed.");
}
