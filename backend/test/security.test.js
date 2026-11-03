const {
  register,
  login,
  logout,
  getEmailFromAuthorization,
  reset,
  save,
} = require("../src/presentationService");
const { readFileSync } = require("fs");
const path = require("path");
const os = require("os");
beforeEach(async () => {
  await reset();
});
test("passwords are salted and never stored as plaintext for new users", async () => {
  await register("one@example.test", "strong-password", "One");
  await register("two@example.test", "strong-password", "Two");
  await save();
  const accounts = JSON.parse(
    readFileSync(
      path.join(os.tmpdir(), "presto-test-" + process.pid + ".json"),
      "utf8",
    ),
  ).admins;
  expect(accounts["one@example.test"].password).toMatch(/^scrypt\$/);
  expect(accounts["one@example.test"].password).not.toBe(
    accounts["two@example.test"].password,
  );
  expect(JSON.stringify(accounts)).not.toContain("strong-password");
});
test("logout invalidates the issued token", async () => {
  const token = await register("one@example.test", "strong-password", "One");
  expect(getEmailFromAuthorization("Bearer " + token)).toBe("one@example.test");
  await logout("one@example.test");
  expect(() => getEmailFromAuthorization("Bearer " + token)).toThrow(
    "Invalid token",
  );
});
test("a new login replaces the earlier session", async () => {
  const original = await register("one@example.test", "strong-password", "One");
  const replacement = await login("one@example.test", "strong-password");
  expect(() => getEmailFromAuthorization("Bearer " + original)).toThrow();
  expect(getEmailFromAuthorization("Bearer " + replacement)).toBe(
    "one@example.test",
  );
});
test("invalid and missing authorization fail closed", () => {
  for (const value of [undefined, "", "forged", "Bearer invalid"])
    expect(() => getEmailFromAuthorization(value)).toThrow("Invalid token");
});
test("registration rejects invalid data and prototype property names", async () => {
  await expect(
    register("__proto__", "strong-password", "One"),
  ).rejects.toThrow();
  await expect(register("one@example.test", "short", "One")).rejects.toThrow();
  await expect(
    register("one@example.test", "strong-password", " "),
  ).rejects.toThrow();
});
