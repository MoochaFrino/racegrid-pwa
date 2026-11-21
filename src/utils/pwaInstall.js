let deferredPrompt = null;
let isInstalled = false;
const listeners = new Set();

function checkStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function notify() {
  const state = getPwaInstallState();
  listeners.forEach((cb) => cb(state));
}

export function initPwaInstallListener() {
  if (typeof window === "undefined") return;
  if (checkStandalone()) isInstalled = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    isInstalled = true;
    notify();
  });
}

export function getPwaInstallState() {
  return {
    canInstall: Boolean(deferredPrompt),
    isInstalled: isInstalled || checkStandalone(),
    isStandalone: checkStandalone(),
  };
}

export function subscribePwaInstall(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function triggerPwaInstall() {
  if (!deferredPrompt) return { outcome: "unavailable" };
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === "accepted") {
    deferredPrompt = null;
    isInstalled = true;
  }
  notify();
  return choice;
}
