const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const qrcode = require("qrcode-terminal");

const currentEnv = process.env.PROJECT_RUN;

if (currentEnv === "prod") {
  // eslint-disable-next-line no-undef
  puppeteerOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--ignore-certificate-errors",
      "--disable-blink-features=AutomationControlled",
    ],
    // executablePath: '/usr/bin/google-chrome-stable'
  };
} else if (currentEnv === "dev") {
  // eslint-disable-next-line no-undef
  puppeteerOptions = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--ignore-certificate-errors",
      "--disable-blink-features=AutomationControlled",
    ],
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  };
}

require("dotenv").config();

const client = new Client({
  authStrategy: new RemoteAuth({
    store: new MongoStore({ mongoose }),
    backupSyncIntervalMs: 300000,
    clientId: process.env.CLIENTID,
  }),
  puppeteer: puppeteerOptions,
});

// Gera o QR Code no terminal
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR Code gerado. Escaneie para conectar.");
});

let isAuthenticated = false;

client.on("authenticated", () => {
  if (!isAuthenticated) {
    console.log("Autenticado com sucesso!");
    isAuthenticated = true;
  }
});

client.on("auth_failure", (error) => {
  console.error("Falha na autenticação:", error);
});

// Eventos de inicialização
const clientReadyPromise = new Promise((resolve, reject) => {
  client.on("ready", () => {
    clientReady = true;
    console.log("Cliente WhatsApp está pronto!");
    resolve(); // Resolve a Promise
  });

  client.on("remote_session_saved", () => {
    console.log("Session Remote Saved!");
  });

  client.on("auth_failure", (error) => {
    console.error("Falha na autenticação:", error);
    reject(error);
  });

  client.on("disconnected", (reason) => {
    console.log("WhatsApp desconectado:", reason);
    clientReady = false;
  });
});

// Eventos personalizados serão definidos nos handlers
module.exports = { client, clientReadyPromise };
