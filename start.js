import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastapiDir = join(__dirname, "servers/fastapi");
const nextjsDir = join(__dirname, "servers/nextjs");

const args = process.argv.slice(2);
const hasDevArg = args.includes("--dev") || args.includes("-d");
const isDev = hasDevArg;
const canChangeKeys = process.env.CAN_CHANGE_KEYS !== "false";
const isWindows = process.platform === "win32";

const fastapiPort = 8000;
const nextjsPort = 3000;
const appmcpPort = 8001;

// Set up APP_DATA_DIRECTORY if not defined
const appDataDir = process.env.APP_DATA_DIRECTORY || join(__dirname, "app_data");
process.env.APP_DATA_DIRECTORY = appDataDir;

const userConfigPath = join(appDataDir, "userConfig.json");
const userDataDir = dirname(userConfigPath);

// Create user_data directory if it doesn't exist
if (!existsSync(userDataDir)) {
  mkdirSync(userDataDir, { recursive: true });
}

// Setup node_modules for development
const setupNodeModules = () => {
  return new Promise((resolve, reject) => {
    console.log("Setting up node_modules for Next.js...");
    const npmProcess = spawn(isWindows ? "npm.cmd" : "npm", ["install"], {
      cwd: nextjsDir,
      stdio: "inherit",
      env: process.env,
      shell: isWindows,
    });

    npmProcess.on("error", (err) => {
      console.error("npm install failed:", err);
      reject(err);
    });

    npmProcess.on("exit", (code) => {
      if (code === 0) {
        console.log("npm install completed successfully");
        resolve();
      } else {
        console.error(`npm install failed with exit code: ${code}`);
        reject(new Error(`npm install failed with exit code: ${code}`));
      }
    });
  });
};

process.env.USER_CONFIG_PATH = userConfigPath;

//? UserConfig is only setup if API Keys can be changed
const setupUserConfigFromEnv = () => {
  let existingConfig = {};

  if (existsSync(userConfigPath)) {
    existingConfig = JSON.parse(readFileSync(userConfigPath, "utf8"));
  }

  if (!["ollama", "openai", "google"].includes(existingConfig.LLM)) {
    existingConfig.LLM = undefined;
  }

  const userConfig = {
    LLM: process.env.LLM || existingConfig.LLM,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || existingConfig.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || existingConfig.OPENAI_MODEL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || existingConfig.GOOGLE_API_KEY,
    GOOGLE_MODEL: process.env.GOOGLE_MODEL || existingConfig.GOOGLE_MODEL,
    OLLAMA_URL: process.env.OLLAMA_URL || existingConfig.OLLAMA_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || existingConfig.OLLAMA_MODEL,
    ANTHROPIC_API_KEY:
      process.env.ANTHROPIC_API_KEY || existingConfig.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL:
      process.env.ANTHROPIC_MODEL || existingConfig.ANTHROPIC_MODEL,
    CUSTOM_LLM_URL: process.env.CUSTOM_LLM_URL || existingConfig.CUSTOM_LLM_URL,
    CUSTOM_LLM_API_KEY:
      process.env.CUSTOM_LLM_API_KEY || existingConfig.CUSTOM_LLM_API_KEY,
    CUSTOM_MODEL: process.env.CUSTOM_MODEL || existingConfig.CUSTOM_MODEL,
    PEXELS_API_KEY: process.env.PEXELS_API_KEY || existingConfig.PEXELS_API_KEY,
    PIXABAY_API_KEY:
      process.env.PIXABAY_API_KEY || existingConfig.PIXABAY_API_KEY,
    IMAGE_PROVIDER: process.env.IMAGE_PROVIDER || existingConfig.IMAGE_PROVIDER,
    TOOL_CALLS: process.env.TOOL_CALLS || existingConfig.TOOL_CALLS,
    DISABLE_THINKING:
      process.env.DISABLE_THINKING || existingConfig.DISABLE_THINKING,
    EXTENDED_REASONING:
      process.env.EXTENDED_REASONING || existingConfig.EXTENDED_REASONING,
    WEB_GROUNDING: process.env.WEB_GROUNDING || existingConfig.WEB_GROUNDING,
    USE_CUSTOM_URL: process.env.USE_CUSTOM_URL || existingConfig.USE_CUSTOM_URL,
    COMFYUI_URL: process.env.COMFYUI_URL || existingConfig.COMFYUI_URL,
    COMFYUI_WORKFLOW:
      process.env.COMFYUI_WORKFLOW || existingConfig.COMFYUI_WORKFLOW,
    DALL_E_3_QUALITY:
      process.env.DALL_E_3_QUALITY || existingConfig.DALL_E_3_QUALITY,
    GPT_IMAGE_1_5_QUALITY:
      process.env.GPT_IMAGE_1_5_QUALITY || existingConfig.GPT_IMAGE_1_5_QUALITY,
  };

  writeFileSync(userConfigPath, JSON.stringify(userConfig));
};

const startServers = async () => {
  // Resolve Python executable (prefer local virtual environment if it exists)
  let pythonCmd = "python";
  if (isWindows) {
    const venvPython = join(fastapiDir, ".venv", "Scripts", "python.exe");
    if (existsSync(venvPython)) {
      pythonCmd = venvPython;
    }
  } else {
    const venvPython = join(fastapiDir, ".venv", "bin", "python");
    if (existsSync(venvPython)) {
      pythonCmd = venvPython;
    }
  }
  console.log(`Using Python executable: ${pythonCmd}`);

  const fastApiProcess = spawn(
    pythonCmd,
    [
      "server.py",
      "--port",
      fastapiPort.toString(),
      "--reload",
      isDev ? "true" : "false",
    ],
    {
      cwd: fastapiDir,
      stdio: "inherit",
      env: process.env,
    }
  );

  fastApiProcess.on("error", (err) => {
    console.error("FastAPI process failed to start:", err);
  });

  const appmcpProcess = spawn(
    pythonCmd,
    ["mcp_server.py", "--port", appmcpPort.toString()],
    {
      cwd: fastapiDir,
      stdio: "ignore",
      env: process.env,
    }
  );

  appmcpProcess.on("error", (err) => {
    console.error("App MCP process failed to start:", err);
  });

  const nextjsProcess = spawn(
    isWindows ? "npm.cmd" : "npm",
    [
      "run",
      isDev ? "dev" : "start",
      "--",
      "-H",
      "127.0.0.1",
      "-p",
      nextjsPort.toString(),
    ],
    {
      cwd: nextjsDir,
      stdio: "inherit",
      env: process.env,
      shell: isWindows,
    }
  );

  nextjsProcess.on("error", (err) => {
    console.error("Next.js process failed to start:", err);
  });

  const ollamaProcess = spawn("ollama", ["serve"], {
    cwd: "/",
    stdio: "inherit",
    env: process.env,
    shell: isWindows,
  });

  ollamaProcess.on("error", (err) => {
    console.warn("Ollama is not installed or not in PATH. If you plan to use local models via Ollama, please install it and make sure it is running.");
  });

  ollamaProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.log(`Ollama process exited with code ${code}. (This is normal if Ollama is already running in the background)`);
    }
  });

  // Keep the Node process alive until one of the main servers exits
  const exitCode = await Promise.race([
    new Promise((resolve) => fastApiProcess.on("exit", resolve)),
    new Promise((resolve) => nextjsProcess.on("exit", resolve)),
  ]);

  console.log(`One of the critical processes exited. Exit code: ${exitCode}`);
  process.exit(exitCode);
};

// Start nginx service
const startNginx = () => {
  if (isWindows) {
    console.log("Skipping Nginx service startup on Windows. Next.js is configured to proxy API requests directly to the FastAPI server.");
    return;
  }
  const nginxProcess = spawn("service", ["nginx", "start"], {
    stdio: "inherit",
    env: process.env,
  });

  nginxProcess.on("error", (err) => {
    console.error("Nginx process failed to start:", err);
  });

  nginxProcess.on("exit", (code) => {
    if (code === 0) {
      console.log("Nginx started successfully");
    } else {
      console.error(`Nginx failed to start with exit code: ${code}`);
    }
  });
};

const main = async () => {
  if (isDev) {
    await setupNodeModules();
  }

  if (canChangeKeys) {
    setupUserConfigFromEnv();
  }

  startServers();
  startNginx();
};

main();
