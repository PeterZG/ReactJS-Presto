const express = require("express");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { InputError, AccessError } = require("./apiErrors");
const swaggerDocument = require("../swagger.json");
const {
  getEmailFromAuthorization,
  login,
  logout,
  register,
  getStore,
  setStore,
} = require("./presentationService");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

const catchErrors = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err instanceof InputError) {
      res.status(400).send({ error: err.message });
    } else if (err instanceof AccessError) {
      res.status(403).send({ error: err.message });
    } else {
      console.error("Local API request failed:", err.name);
      if (!res.headersSent)
        res.status(500).send({ error: "A system error occurred" });
    }
  }
};

// Service mutations persist before these routes send a success response.

const authed = (fn) => async (req, res) => {
  const email = getEmailFromAuthorization(req.header("Authorization"));
  await fn(req, res, email);
};

app.post(
  "/admin/auth/login",
  catchErrors(async (req, res) => {
    const { email, password } = req.body;
    const token = await login(email, password);
    return res.json({ token });
  }),
);

app.post(
  "/admin/auth/register",
  catchErrors(async (req, res) => {
    const { email, password, name } = req.body;
    const token = await register(email, password, name);
    return res.json({ token });
  }),
);

app.post(
  "/admin/auth/logout",
  catchErrors(
    authed(async (req, res, email) => {
      await logout(email);
      return res.json({});
    }),
  ),
);

// The supplied API stores each account's complete presentation collection.

app.get(
  "/store",
  catchErrors(
    authed(async (req, res, email) => {
      return res.json({ store: await getStore(email) });
    }),
  ),
);

app.put(
  "/store",
  catchErrors(
    authed(async (req, res, email) => {
      await setStore(email, req.body.store);
      return res.json({});
    }),
  ),
);

app.get("/", (req, res) => res.redirect("/docs"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Body-parser failures also use the JSON error contract consumed by the client.
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    res.status(400).json({ error: "The request body must contain valid JSON." });
  } else if (error.type === "entity.too.large") {
    res.status(413).json({ error: "The request body exceeds the 50 MB limit." });
  } else {
    console.error("Local API request failed:", error.name);
    res.status(500).json({ error: "A system error occurred" });
  }
});

// Tests use an operating-system assigned port so a local demo can stay open.
const port =
  process.env.NODE_ENV === "test"
    ? 0
    : Number(process.env.PORT || process.env.BACKEND_PORT || 5005);

const server = app.listen(port, process.env.HOST || "127.0.0.1", () => {
  console.log(`Backend is now listening on port ${port}!`);
  console.log(`For API docs, navigate to http://localhost:${port}`);
});

module.exports = server;
