import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

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

test("home screen keeps a YouTube-style shell with navbar, sidebar, and responsive grid", async () => {
  const app = await read("src/App.tsx");
  const home = await read("src/pages/Home.tsx");
  const navbar = await read("src/components/Navbar.tsx");

  assert.match(app, /<Navbar\s*\/>/, "App should render the global navbar");
  assert.match(app, /<Sidebar\s*\/>/, "App should render the sidebar");
  assert.match(home, /grid/, "Home page should use a grid layout for videos");
  assert.match(navbar, /Search/, "Navbar should include a search affordance");
});

test("authentication routes and pages exist for email/password flows", async () => {
  const app = await read("src/App.tsx");

  assert.ok(await exists("src/pages/Login.tsx"), "Expected src/pages/Login.tsx");
  assert.ok(await exists("src/pages/Register.tsx"), "Expected src/pages/Register.tsx");
  assert.match(app, /path="\/login"/, "App should register a /login route");
  assert.match(app, /path="\/register"/, "App should register a /register route");

  const login = await read("src/pages/Login.tsx");
  const register = await read("src/pages/Register.tsx");

  assert.match(login, /type="email"/, "Login page should have an email input");
  assert.match(login, /type="password"/, "Login page should have a password input");
  assert.match(register, /type="email"/, "Register page should have an email input");
  assert.match(register, /type="password"/, "Register page should have a password input");
});

test("profile dropdown closes on outside click without refresh", async () => {
  const navbar = await read("src/components/Navbar.tsx");

  assert.match(navbar, /useRef/, "Navbar should use refs for outside-click detection");
  assert.match(navbar, /useEffect/, "Navbar should register an outside-click listener");
  assert.match(
    navbar,
    /(mousedown|click)/,
    "Navbar should listen for document click or mousedown events",
  );
  assert.match(navbar, /contains\(/, "Navbar should check whether the click happened outside");
});

test("subscriptions route and page exist", async () => {
  const app = await read("src/App.tsx");

  assert.ok(
    await exists("src/pages/Subscriptions.tsx"),
    "Expected src/pages/Subscriptions.tsx",
  );
  assert.match(app, /path="\/subscriptions"/, "App should register a /subscriptions route");
});

test("watch page uses icon-based reactions and supports replies", async () => {
  const watch = await read("src/pages/Watch.tsx");

  assert.doesNotMatch(watch, /👍|👎/, "Watch page should not use emoji buttons for comment actions");
  assert.match(watch, /Reply/, "Watch page should expose a reply action");
  assert.match(
    watch,
    /(replyTo|parentCommentId|replies)/,
    "Watch page should model nested replies in state or payloads",
  );
});

test("create video flow exists from navbar to dedicated page", async () => {
  const app = await read("src/App.tsx");
  const navbar = await read("src/components/Navbar.tsx");

  assert.ok(
    await exists("src/pages/CreateVideo.tsx"),
    "Expected src/pages/CreateVideo.tsx",
  );
  assert.match(app, /path="\/create-video"/, "App should register a /create-video route");
  assert.match(navbar, /Create/, "Navbar should expose a Create action");

  const createVideo = await read("src/pages/CreateVideo.tsx");
  assert.match(createVideo, /Title/i, "Create video page should collect a title");
  assert.match(createVideo, /Description/i, "Create video page should collect a description");
  assert.match(
    createVideo,
    /(type="file"|thumbnail)/i,
    "Create video page should collect a thumbnail upload",
  );
});
