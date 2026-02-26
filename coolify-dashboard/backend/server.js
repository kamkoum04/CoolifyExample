require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

const COOLIFY_API_URL = (process.env.COOLIFY_API_URL || "").replace(/\/+$/, "");
const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN || "";

if (!COOLIFY_API_URL || !COOLIFY_API_TOKEN || COOLIFY_API_TOKEN === "YOUR_API_TOKEN_HERE") {
  console.error("⚠️  Please set COOLIFY_API_URL and COOLIFY_API_TOKEN in .env");
}

app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------- Helpers ----------

async function coolifyFetch(path, options = {}) {
  const url = `${COOLIFY_API_URL}/api/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${COOLIFY_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(typeof data === "object" ? JSON.stringify(data) : data);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Health ----------

app.get("/api/health", async (_req, res) => {
  try {
    const version = await coolifyFetch("/version");
    res.json({ status: "ok", coolifyVersion: version });
  } catch (e) {
    res.status(502).json({ status: "error", message: e.message });
  }
});

// ---------- Servers ----------

app.get("/api/servers", async (_req, res) => {
  try {
    const data = await coolifyFetch("/servers");
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Projects ----------

app.get("/api/projects", async (_req, res) => {
  try {
    const data = await coolifyFetch("/projects");
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const data = await coolifyFetch("/projects", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.status(201).json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/projects/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/projects/${req.params.uuid}`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.delete("/api/projects/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/projects/${req.params.uuid}`, {
      method: "DELETE",
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Project Environments ----------

app.get("/api/projects/:uuid/environments", async (req, res) => {
  try {
    const data = await coolifyFetch(`/projects/${req.params.uuid}/environments`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/projects/:uuid/:envNameOrUuid", async (req, res) => {
  try {
    const data = await coolifyFetch(
      `/projects/${req.params.uuid}/${req.params.envNameOrUuid}`
    );
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Applications ----------

app.get("/api/applications", async (_req, res) => {
  try {
    const data = await coolifyFetch("/applications");
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/applications/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/applications/public", async (req, res) => {
  try {
    const data = await coolifyFetch("/applications/public", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.status(201).json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.patch("/api/applications/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}`, {
      method: "PATCH",
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.delete("/api/applications/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}`, {
      method: "DELETE",
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Application Actions ----------

app.get("/api/applications/:uuid/start", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}/start`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/applications/:uuid/stop", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}/stop`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/applications/:uuid/restart", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}/restart`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Application Logs ----------

app.get("/api/applications/:uuid/logs", async (req, res) => {
  try {
    const lines = req.query.lines || 100;
    const data = await coolifyFetch(
      `/applications/${req.params.uuid}/logs?lines=${lines}`
    );
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Application Env Vars ----------

app.get("/api/applications/:uuid/envs", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}/envs`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/applications/:uuid/envs", async (req, res) => {
  try {
    const data = await coolifyFetch(`/applications/${req.params.uuid}/envs`, {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.status(201).json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Deployments ----------

app.get("/api/deployments", async (_req, res) => {
  try {
    const data = await coolifyFetch("/deployments");
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/deployments/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/deployments/${req.params.uuid}`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/deployments/applications/:uuid", async (req, res) => {
  try {
    const skip = req.query.skip || 0;
    const take = req.query.take || 10;
    const data = await coolifyFetch(
      `/deployments/applications/${req.params.uuid}?skip=${skip}&take=${take}`
    );
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/deploy", async (req, res) => {
  try {
    const params = new URLSearchParams();
    if (req.query.uuid) params.set("uuid", req.query.uuid);
    if (req.query.tag) params.set("tag", req.query.tag);
    if (req.query.force) params.set("force", req.query.force);
    const data = await coolifyFetch(`/deploy?${params.toString()}`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Services (Docker Compose) ----------

app.get("/api/services", async (_req, res) => {
  try {
    const data = await coolifyFetch("/services");
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/services", async (req, res) => {
  try {
    const data = await coolifyFetch("/services", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.status(201).json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/services/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/services/${req.params.uuid}`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.patch("/api/services/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/services/${req.params.uuid}`, {
      method: "PATCH",
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.delete("/api/services/:uuid", async (req, res) => {
  try {
    const data = await coolifyFetch(`/services/${req.params.uuid}`, {
      method: "DELETE",
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/services/:uuid/start", async (req, res) => {
  try {
    const data = await coolifyFetch(`/services/${req.params.uuid}/start`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/services/:uuid/stop", async (req, res) => {
  try {
    const data = await coolifyFetch(`/services/${req.params.uuid}/stop`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/services/:uuid/restart", async (req, res) => {
  try {
    const data = await coolifyFetch(`/services/${req.params.uuid}/restart`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------- Start ----------

app.listen(PORT, () => {
  console.log(`🚀 Coolify Dashboard Backend running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to Coolify at: ${COOLIFY_API_URL}`);
});
