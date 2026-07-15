import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_PROJECTS } from "./src/data/initialProjects.js";
import { Project } from "./src/types.js";

const app = express();
const PORT = 3000;

// Increase limit to handle base64 image/file uploads in CMS
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup paths
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const DATA_FILE = path.join(process.cwd(), "src", "data", "projects-db.json");
const SOUNDS_FILE = path.join(process.cwd(), "src", "data", "sounds-db.json");
const CONFIG_FILE = path.join(process.cwd(), "src", "data", "config-db.json");

const INITIAL_SOUNDS = [
  {
    id: "procedural",
    name: "Atelier Procedural Synth (Default)",
    url: "procedural",
    active: true
  }
];

const INITIAL_CONFIG = {
  passcode: "shailora"
};

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Make public folder accessible
app.use(express.static(path.join(process.cwd(), "public")));

// Initialize database files if they don't exist
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_PROJECTS, null, 2), "utf-8");
}

if (!fs.existsSync(SOUNDS_FILE)) {
  fs.writeFileSync(SOUNDS_FILE, JSON.stringify(INITIAL_SOUNDS, null, 2), "utf-8");
}

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(INITIAL_CONFIG, null, 2), "utf-8");
}

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch (error) {
    console.error("Error reading config-db.json", error);
  }
  return INITIAL_CONFIG;
}

function writeConfig(config: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

// Helper to read database
function readProjects(): Project[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading projects-db.json, falling back to initial projects", error);
  }
  return INITIAL_PROJECTS;
}

// Helper to write database
function writeProjects(projects: Project[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

// Helpers for soundtracks
function readSounds() {
  try {
    if (fs.existsSync(SOUNDS_FILE)) {
      const content = fs.readFileSync(SOUNDS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading sounds-db.json", error);
  }
  return INITIAL_SOUNDS;
}

function writeSounds(sounds: any[]) {
  fs.writeFileSync(SOUNDS_FILE, JSON.stringify(sounds, null, 2), "utf-8");
}

// Initialize Gemini client safely
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// ==========================================
// API ENDPOINTS
// ==========================================

// Get all projects
app.get("/api/projects", (req, res) => {
  const projects = readProjects();
  // Sort by homepageOrder ascending
  const sorted = [...projects].sort((a, b) => (a.homepageOrder || 0) - (b.homepageOrder || 0));
  res.json(sorted);
});

// Get single project
app.get("/api/projects/:id", (req, res) => {
  const projects = readProjects();
  const project = projects.find((p) => p.id === req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});

// Create project
app.post("/api/projects", (req, res) => {
  const projects = readProjects();
  const newProject: Project = req.body;
  
  if (!newProject.id) {
    newProject.id = newProject.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // Ensure unique id
  let finalId = newProject.id;
  let counter = 1;
  while (projects.some((p) => p.id === finalId)) {
    finalId = `${newProject.id}-${counter}`;
    counter++;
  }
  newProject.id = finalId;

  projects.push(newProject);
  writeProjects(projects);
  res.status(201).json(newProject);
});

// Update project
app.put("/api/projects/:id", (req, res) => {
  const projects = readProjects();
  const index = projects.findIndex((p) => p.id === req.params.id);
  
  if (index !== -1) {
    projects[index] = { ...projects[index], ...req.body, id: req.params.id };
    writeProjects(projects);
    res.json(projects[index]);
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});

// Delete project
app.delete("/api/projects/:id", (req, res) => {
  const projects = readProjects();
  const filtered = projects.filter((p) => p.id !== req.params.id);
  
  if (projects.length !== filtered.length) {
    writeProjects(filtered);
    res.json({ success: true, message: "Project deleted" });
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});

// ==========================================
// SOUND TRACKS ENDPOINTS
// ==========================================

// Get all sounds
app.get("/api/sounds", (req, res) => {
  res.json(readSounds());
});

// Create sound
app.post("/api/sounds", (req, res) => {
  const sounds = readSounds();
  const newSound = req.body;
  newSound.id = `sound-${Date.now()}`;
  newSound.active = false;
  sounds.push(newSound);
  writeSounds(sounds);
  res.status(201).json(newSound);
});

// Update sound (e.g. toggle active)
app.put("/api/sounds/:id", (req, res) => {
  const sounds = readSounds();
  const index = sounds.findIndex((s: any) => s.id === req.params.id);
  if (index !== -1) {
    if (req.body.active === true) {
      // Deactivate all others first
      sounds.forEach((s: any) => s.active = false);
    }
    sounds[index] = { ...sounds[index], ...req.body };
    writeSounds(sounds);
    res.json(sounds[index]);
  } else {
    res.status(404).json({ error: "Sound not found" });
  }
});

// Delete sound
app.delete("/api/sounds/:id", (req, res) => {
  const sounds = readSounds();
  const filtered = sounds.filter((s: any) => s.id !== req.params.id);
  // Ensure at least one active sound exists if we deleted the active one
  if (sounds.find((s: any) => s.id === req.params.id)?.active) {
    if (filtered.length > 0) {
      filtered[0].active = true;
    }
  }
  writeSounds(filtered);
  res.json({ success: true });
});

// Admin Passcode APIs
app.get("/api/admin/passcode", (req, res) => {
  const config = readConfig();
  res.json({ passcode: config.passcode });
});

app.post("/api/admin/auth", (req, res) => {
  const { password } = req.body;
  const config = readConfig();
  const inputPass = (password || "").trim();
  const storedPass = (config.passcode || "").trim() || "shailora";

  if (!inputPass) {
    return res.json({ authenticated: false });
  }

  const isMatch = inputPass === storedPass;
  res.json({ authenticated: isMatch });
});

app.post("/api/admin/change-passcode", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const trimmedNew = (newPassword || "").trim();
  if (!trimmedNew) {
    return res.status(400).json({ error: "New passcode cannot be empty." });
  }

  const config = readConfig();
  const inputCurrent = (currentPassword || "").trim();
  const storedPass = (config.passcode || "").trim() || "shailora";

  const isMatch = inputCurrent === storedPass;
  
  if (!isMatch) {
    return res.status(401).json({ error: "Current passcode is incorrect." });
  }

  config.passcode = trimmedNew;
  writeConfig(config);
  res.json({ success: true, message: "Passcode updated successfully." });
});

// File upload endpoint (receives base64 data)
app.post("/api/upload", (req, res) => {
  try {
    const { fileData, fileName, mimeType } = req.body;
    if (!fileData || !fileName) {
      return res.status(400).json({ error: "Missing fileData or fileName" });
    }

    // Clean base64 string
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // Create unique filename
    const ext = path.extname(fileName) || ".jpg";
    const base = path.basename(fileName, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const uniqueName = `${base}-${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);
    
    // Return relative URL for static file serving
    res.json({ url: `/uploads/${uniqueName}`, fileName: uniqueName });
  } catch (error: any) {
    console.error("Error during upload", error);
    res.status(500).json({ error: error.message || "Failed to upload file" });
  }
});

// AI critique & architecture analysis using Gemini
app.post("/api/projects/:id/ai-critique", async (req, res) => {
  const projects = readProjects();
  const project = projects.find((p) => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Fallback simulated response if no API key is set
  const generateSimulatedCritique = (title: string, category: string, style: string) => ({
    philosophy: `The design of ${title} serves as an investigation into silent volumetric presence. Reflecting SHAILORA's core doctrine of minimalist Monumentalism, it represents an intersection between natural topology and pristine human geometry. By refusing extraneous ornamentation, the structure establishes a calm dialogue with its surroundings, framing light and air as the primary building blocks.`,
    spatialExperience: `Walking through the spaces reveals an intentional delay in sensory transition. The corridors serve as decompression chambers, slowly revealing massive, double-height volumes. Sunlight penetrates at steep, dramatic angles, creating sharp partitions of shadow and light across the unvarnished floor plates. It feels cold but sheltering, monumental yet deeply intimate.`,
    materialTectonics: `The tectonics center around contrast and gravity. Raw cast-in-place concrete offers a heavy thermal and optical mass, contrasted against the sleek weightlessness of anodized aluminum frames. The joinery is entirely recessed, making individual structural elements appear as massive, floating lintels that celebrate structural honesty and material purity.`,
    environmentalIntegration: `The structure is engineered to dissolve into or firmly anchor its site. Rather than competing with the surrounding landscape, its horizontal volumes guide the eye toward the horizon, while the thermal mass of the heavy walls absorbs diurnal temperature spikes, celebrating passive sustainability.`,
    curatedRecommendations: [
      "Integrate recessed linear skylights to accent the raw concrete joints",
      "Introduce black oxidized steel door profiles for visual sharpness",
      "Complement the concrete with custom low-slung dark cedar furniture",
      "Utilize native gravel beds along the base of the walls to blur the perimeter",
    ],
    isSimulated: true,
  });

  if (!ai) {
    // No API key configured
    return res.json(generateSimulatedCritique(project.title, project.category, project.architecturalStyle));
  }

  try {
    const prompt = `You are a world-class architectural critic and spatial philosopher representing prestigious publications like El Croquis, Architectural Review, or Detail.
Analyze the following architectural project from the premium firm SHAILORA:

Project Name: ${project.title}
Category: ${project.category}
Location: ${project.location}
Year: ${project.year}
Style: ${project.architecturalStyle}
Materials: ${project.materialPalette.join(", ")}
Description: ${project.description}
Concept: ${project.conceptText}

Provide a deep, sophisticated, high-end critique following this exact JSON structure:
{
  "philosophy": "Deep analytical description of the design's philosophical and architectural concept (3-4 sentences)",
  "spatialExperience": "Immersive narrative of what it feels like to walk through and inhabit the spaces (3-4 sentences)",
  "materialTectonics": "Technical critique of the material pairings, junctions, and structural honesty (3-4 sentences)",
  "environmentalIntegration": "Critique of how the structure behaves within its natural or urban ecosystem (2-3 sentences)",
  "curatedRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"]
}

Adopt a highly sophisticated, calm, editorial, intellectual, and poetic tone. Keep the language humble but exceptionally refined (resembling Snøhetta, Herzog & de Meuron, OMA). Do not use sales hype or emojis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            philosophy: { type: Type.STRING },
            spatialExperience: { type: Type.STRING },
            materialTectonics: { type: Type.STRING },
            environmentalIntegration: { type: Type.STRING },
            curatedRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["philosophy", "spatialExperience", "materialTectonics", "environmentalIntegration", "curatedRecommendations"],
        },
      },
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      res.json({ ...parsed, isSimulated: false });
    } else {
      res.json(generateSimulatedCritique(project.title, project.category, project.architecturalStyle));
    }
  } catch (error) {
    console.error("Error calling Gemini API in critique", error);
    res.json(generateSimulatedCritique(project.title, project.category, project.architecturalStyle));
  }
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SHAILORA Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
