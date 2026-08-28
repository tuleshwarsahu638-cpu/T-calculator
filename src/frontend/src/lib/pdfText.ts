// Extracts text from a PDF file entirely in the browser.
//
// IMPORTANT — offline note: true offline PDF parsing needs a bundled
// library (e.g. "pdfjs-dist") added to the project's package.json. That
// package isn't part of this code export, so it can't be imported directly
// here without risking a build failure on a machine that doesn't have it
// installed yet. As a working bridge, this loads pdf.js from a CDN at the
// moment the user actually attaches a PDF (not at app startup, and not as
// a bundler import) — so the app still builds and runs fully offline for
// everything else; only "read this PDF" needs a connection until pdfjs-dist
// is added as a real dependency.
//
// biome-ignore lint/suspicious/noExplicitAny: pdf.js has no bundled types here
declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

const PDFJS_SCRIPT_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let loadPromise: Promise<void> | null = null;

function loadPdfJs(): Promise<void> {
  if (window.pdfjsLib) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PDFJS_SCRIPT_URL;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve();
      } else {
        reject(new Error("pdf.js loaded but window.pdfjsLib missing"));
      }
    };
    script.onerror = () => reject(new Error("Could not load PDF reader"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  if (!navigator.onLine) {
    throw new Error(
      "PDF padhne ke liye is version mein internet chahiye (sirf pehli baar). Ya seedha text copy-paste karein.",
    );
  }
  await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  let fullText = "";
  const maxPages = Math.min(pdf.numPages, 20); // keep it light
  for (let p = 1; p <= maxPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    // biome-ignore lint/suspicious/noExplicitAny: pdf.js text item shape
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += `${pageText}\n`;
  }
  return fullText.trim();
}
