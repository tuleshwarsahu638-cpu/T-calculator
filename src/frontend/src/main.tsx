import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Register the service worker so the app works offline and can be
// installed to the home screen. Uses a relative path so it works
// correctly whether hosted at a domain root or a subfolder.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      // Check for a new version periodically and whenever the app
      // regains focus, so installed users see the update banner promptly.
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          reg.update().catch(() => {});
        }
      });
    }).catch(() => {
      // Non-fatal — the app still works fully online without it.
    });
  });
}
