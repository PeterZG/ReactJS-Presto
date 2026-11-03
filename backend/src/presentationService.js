// Local coursework companion service; API routes retain the supplied contract.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { randomBytes, scryptSync, timingSafeEqual } = require("crypto");
const jwt = require("jsonwebtoken");
const AsyncLock = require("async-lock");
const { InputError, AccessError } = require("./apiErrors");

const lock = new AsyncLock();
// With no configured key, tokens deliberately become invalid after a restart.
const signingKey = process.env.JWT_SECRET || randomBytes(64).toString("hex");
if (signingKey.length < 32)
  throw new Error("JWT_SECRET must contain at least 32 characters.");
const databaseFile =
  process.env.NODE_ENV === "test"
    ? path.join(os.tmpdir(), "presto-test-" + process.pid + ".json")
    : path.resolve(process.env.PRESTO_DATABASE_FILE || "database.json");
let accounts = Object.create(null);
if (process.env.NODE_ENV !== "test" && fs.existsSync(databaseFile)) {
  const stored = JSON.parse(fs.readFileSync(databaseFile, "utf8"));
  if (!stored.admins || typeof stored.admins !== "object" || Array.isArray(stored.admins))
    throw new Error("Invalid account database.");
  accounts = stored.admins;
}

function writeAccounts(snapshot) {
  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  const temporaryFile = databaseFile + "." + randomBytes(8).toString("hex") + ".tmp";
  try {
    fs.writeFileSync(
      temporaryFile,
      JSON.stringify({ admins: snapshot }, null, 2),
      { mode: 0o600, flag: "wx" },
    );
    fs.renameSync(temporaryFile, databaseFile);
  } finally {
    if (fs.existsSync(temporaryFile)) fs.unlinkSync(temporaryFile);
  }
}

// Publish a new in-memory snapshot only after its atomic disk write succeeds.
// A failed registration, login or edit must leave the previous state usable.
function changeAccounts(operation) {
  return lock.acquire("accounts", () => {
    const nextAccounts = Object.assign(Object.create(null), accounts);
    const result = operation(nextAccounts);
    writeAccounts(nextAccounts);
    accounts = nextAccounts;
    return result;
  });
}

const save = () => lock.acquire("accounts", () => writeAccounts(accounts));
const reset = () => lock.acquire("accounts", () => {
  const emptyAccounts = Object.create(null);
  writeAccounts(emptyAccounts);
  accounts = emptyAccounts;
});

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return (
    "scrypt$" + salt + "$" + scryptSync(password, salt, 32).toString("hex")
  );
}
function passwordMatches(password, encoded) {
  if (
    typeof password !== "string" ||
    password.length > 512 ||
    typeof encoded !== "string"
  )
    return false;
  if (!encoded.startsWith("scrypt$")) {
    // Read-only compatibility until an existing local account next signs in.
    const supplied = Buffer.from(password);
    const legacy = Buffer.from(encoded);
    return (
      supplied.length === legacy.length && timingSafeEqual(supplied, legacy)
    );
  }
  const [, salt, value] = encoded.split("$");
  const expected = Buffer.from(value || "", "hex");
  const actual = scryptSync(password, salt, 32);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function issueToken(email, account) {
  account.sessionId = randomBytes(24).toString("hex");
  return jwt.sign({ email, sessionId: account.sessionId }, signingKey, {
    algorithm: "HS256",
    expiresIn: "8h",
  });
}
function getEmailFromAuthorization(authorization) {
  try {
    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    )
      throw new Error();
    const payload = jwt.verify(authorization.slice(7), signingKey, {
      algorithms: ["HS256"],
    });
    const account = Object.hasOwn(accounts, payload.email)
      ? accounts[payload.email]
      : null;
    if (
      !account ||
      !account.sessionId ||
      account.sessionId !== payload.sessionId
    )
      throw new Error();
    return payload.email;
  } catch {
    throw new AccessError("Invalid token");
  }
}
const login = (email, password) =>
  changeAccounts((nextAccounts) => {
    const existing = typeof email === "string" && Object.hasOwn(nextAccounts, email)
      ? nextAccounts[email] : null;
    const account = existing ? { ...existing } : null;
    if (!account || !passwordMatches(password, account.password))
      throw new InputError("Invalid username or password");
    if (!account.password.startsWith("scrypt$"))
      account.password = hashPassword(password);
    nextAccounts[email] = account;
    return issueToken(email, account);
  });
const logout = (email) =>
  changeAccounts((nextAccounts) => {
    if (!Object.hasOwn(nextAccounts, email)) throw new AccessError("Invalid token");
    nextAccounts[email] = { ...nextAccounts[email], sessionId: null };
  });
const register = (email, password, name) =>
  changeAccounts((nextAccounts) => {
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 512 ||
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 120
    ) {
      throw new InputError(
        "Provide a valid email, name and password of 8 to 512 characters.",
      );
    }
    if (Object.hasOwn(nextAccounts, email))
      throw new InputError("Email address already registered");
    nextAccounts[email] = {
      name: name.trim(),
      password: hashPassword(password),
      store: {},
    };
    return issueToken(email, nextAccounts[email]);
  });
const getStore = (email) =>
  lock.acquire("accounts", () => ({
    store: JSON.parse(JSON.stringify(accounts[email].store)),
  }));
const setStore = (email, store) =>
  changeAccounts((nextAccounts) => {
    if (!store || typeof store !== "object")
      throw new InputError("Store must be an object or array.");
    nextAccounts[email] = {
      ...nextAccounts[email],
      store: JSON.parse(JSON.stringify(store)),
    };
  });
module.exports = {
  save,
  reset,
  getEmailFromAuthorization,
  login,
  logout,
  register,
  getStore,
  setStore,
};
