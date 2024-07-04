import fs from "fs";
import path from "path";

const SAVE_LOGS = process.env.SAVE_LOGS;
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const outputLog = fs.createWriteStream(
  path.join(__dirname, "../../logs/outputs.log"),
  { flags: "a" }
);
const errorsLog = fs.createWriteStream(
  path.join(__dirname, "../../logs/errors.log"),
  { flags: "a" }
);
const warrningsLog = fs.createWriteStream(
  path.join(__dirname, "../../logs/warrnings.log"),
  { flags: "a" }
);

function logger(logStream, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;

  if (SAVE_LOGS === "true") {
    logStream.write(logMessage);
  }
}

function info(message) {
  logger(outputLog, `[INFO] ${message}`);
}

function error(message) {
  console.error(message);
  logger(errorsLog, `[ERROR] ${message}`);
}

function warning(message) {
  console.warn(message);
  logger(warrningsLog, `[WARNING] ${message}`);
}

export { info, error, warning };
