import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Copy,
  FileText,
  Globe,
  History,
  KeyRound,
  Loader2,
  Mic,
  Pin,
  PinOff,
  RefreshCw,
  RotateCcw,
  Share2,
  Sigma,
  Sparkles,
  Type,
  Volume2,
  VolumeX,
  WifiOff,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FreeAiHistoryPanel } from "../components/FreeAiHistoryPanel";
import { MarkdownLite } from "../components/MarkdownLite";
import type { FreeAiHistoryItem } from "../hooks/useFreeAiHistory";
import { useAiPlusKey } from "../hooks/useAiPlusKey";
import { useAiUsageLimit } from "../hooks/useAiUsageLimit";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { useFreeAiHistory } from "../hooks/useFreeAiHistory";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useSpeech } from "../hooks/useSpeech";
import { AI_PROVIDERS, DEFAULT_PROVIDER } from "../lib/aiProviders";
import { solveFree } from "../lib/freeAssistant";
import { normalizeQuestion } from "../lib/normalizeQuestion";
import { extractTextFromPdf } from "../lib/pdfText";
import { formatStepByStep } from "../lib/stepFormat";
import { randomTuleshwarMessage } from "../lib/tuleshwarMessages";
import { useAiLanguageMode } from "../lib/useAiLanguageMode";
import { parseAndSolve } from "./AiMathSolver";

function evaluateMathExpression(expr: string): number | null {
  const clean = expr
    .toLowerCase()
    .replace(/plus/g, "+")
    .replace(/minus|subtract/g, "-")
    .replace(/times|multiplied by|into/g, "*")
    .replace(/divided by|over/g, "/")
    .replace(/percent of/g, "%")
    .replace(/percent/g, "/100")
    .replace(/cubed/g, "**3")
    .replace(/squared/g, "**2")
    .replace(/pi/g, "3.14159")
    .replace(/[^\d+\-*/().\s^%]/g, "")
    .replace(/\^/g, "**")
    .replace(/%/g, "/100*");
  try {
    const result = new Function(`return ${clean}`)();
    if (typeof result === "number" && Number.isFinite(result)) return result;
  } catch {
    /* ignore */
  }
  return null;
}

interface FreeChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourceQuestion?: string;
  historyId?: string;
}

function loadFreeChatHistory(): FreeChatMsg[] {
  try {
    return JSON.parse(localStorage.getItem("freeAiChatHistory") || "[]");
  } catch {
    return [];
  }
}

function FreeAssistant() {
  const speech = useSpeech();
  const historyStore = useFreeAiHistory();
  const { mode: langMode, setMode: setLangMode } = useAiLanguageMode();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<FreeChatMsg[]>(loadFreeChatHistory);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showFormula, setShowFormula] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("freeAiChatHistory", JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loadingMsg]);

  const runQuery = (rawText: string) => {
    const text = normalizeQuestion(rawText);
    if (!text.trim()) return;

    const userMsg: FreeChatMsg = { id: `${Date.now()}-u`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoadingMsg(randomTuleshwarMessage());

    const pushAnswer = (content: string, saveToHistory: boolean) => {
      const historyId = saveToHistory ? historyStore.addEntry(text, content) : undefined;
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", content, sourceQuestion: text, historyId },
      ]);
      setLoadingMsg(null);
    };

    // A short, real "thinking" pause — the solver itself runs in a few ms,
    // this just keeps the friendly indicator visible long enough to read
    // rather than flashing instantly. Everything still stays on-device.
    setTimeout(() => {
      // Try science / small-talk lookup first (periodic table, constants, formulas)
      const science = solveFree(text);
      if (science) {
        const content = science.detail
          ? `${science.answer}\n\n${science.detail}`
          : science.answer;
        pushAnswer(content, true);
        return;
      }

      // Try the step-by-step math solver — formatted as Step 1–6
      const math = parseAndSolve(text);
      if (math) {
        pushAnswer(formatStepByStep(math, langMode, showFormula), true);
        return;
      }

      // Fall back to a basic arithmetic evaluator
      const basic = evaluateMathExpression(text);
      if (basic !== null) {
        const rounded = String(Number(basic.toFixed(6)));
        pushAnswer(`**${rounded}**`, true);
        return;
      }

      const fallbackMsg =
        langMode === "hi"
          ? "इस प्रश्न के लिए **AI Plus (Internet)** की आवश्यकता है — AI+ tab try करें, या सवाल सरल तरीके से दोबारा लिखें।"
          : langMode === "en"
            ? "This question needs **AI Plus (Internet)** — try the AI+ tab, or rephrase the question more simply."
            : "Is prashna ke liye **AI Plus (Internet)** ki avashyakta hai — AI+ tab try karein, ya sawaal ko simple tarike se dobara likhein.";
      pushAnswer(fallbackMsg, false);
    }, 350);
  };

  const regenerate = (sourceQuestion: string) => {
    // Re-run the same question fresh (skips the extra user bubble).
    setLoadingMsg(randomTuleshwarMessage());
    const text = sourceQuestion;
    setTimeout(() => {
      const science = solveFree(text);
      const math = parseAndSolve(text);
      let content: string;
      let saveToHistory = true;
      if (science) {
        content = science.detail ? `${science.answer}\n\n${science.detail}` : science.answer;
      } else if (math) {
        content = formatStepByStep(math, langMode, showFormula);
      } else {
        const basic = evaluateMathExpression(text);
        if (basic !== null) {
          content = `**${String(Number(basic.toFixed(6)))}**`;
        } else {
          content = "Dobara try kiya, lekin abhi bhi is sawaal ka offline jawab nahi mil paya.";
          saveToHistory = false;
        }
      }
      const historyId = saveToHistory ? historyStore.addEntry(text, content) : undefined;
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", content, sourceQuestion: text, historyId },
      ]);
      setLoadingMsg(null);
    }, 300);
  };

  const askSimilar = (sourceQuestion: string) => {
    // Simple heuristic: nudge the numbers in the original question so it's
    // a genuinely different (but related) practice question, not a repeat.
    const nudged = sourceQuestion.replace(/\d+(\.\d+)?/g, (m) => {
      const n = Number.parseFloat(m);
      const bump = Math.max(1, Math.round(n * 0.3)) || 1;
      return String(Math.round(n + bump));
    });
    if (nudged === sourceQuestion) {
      runQuery(`${sourceQuestion} (ek aur tarike se)`);
    } else {
      runQuery(nudged);
    }
  };

  const toggleBookmark = (msg: FreeChatMsg) => {
    if (msg.historyId) historyStore.togglePin(msg.historyId);
  };

  const handleMic = () => {
    if (speech.isListening) {
      speech.stopListening();
      return;
    }
    speech.resetTranscript();
    speech.startListening();
  };

  // Run query once listening stops and we have a fresh transcript
  if (!speech.isListening && speech.transcript && speech.transcript !== query) {
    const transcript = speech.transcript;
    setQuery(transcript);
    runQuery(transcript);
  }

  const handleFileAttach = async (file: File) => {
    setAttachError(null);
    setAttachedFileName(file.name);
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setIsExtracting(true);
      try {
        const text = await extractTextFromPdf(file);
        setQuery((prev) => (prev ? `${prev}\n${text}` : text));
      } catch (e) {
        setAttachError(e instanceof Error ? e.message : "PDF nahi pad paya.");
      } finally {
        setIsExtracting(false);
      }
      return;
    }
    // Plain text file — read directly, no library needed
    try {
      const text = await file.text();
      setQuery((prev) => (prev ? `${prev}\n${text}` : text));
    } catch {
      setAttachError("File nahi pad paya.");
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("freeAiChatHistory");
  };

  const copyMsg = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  const handleSelectHistory = (item: FreeAiHistoryItem) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-u`, role: "user", content: item.question },
      { id: `${Date.now() + 1}-a`, role: "assistant", content: item.answer },
    ]);
    setHistoryOpen(false);
  };

  return (
    <div className="flex flex-col h-[560px]">
      {!speech.isSupported && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive mb-2 shrink-0">
          Voice is not supported in this browser. Try Chrome or Edge — typing
          still works below.
        </div>
      )}
      {speech.speechError && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 mb-2 shrink-0">
          {speech.speechError}
        </div>
      )}

      {historyOpen ? (
        <div className="flex-1 overflow-y-auto mb-2">
          <FreeAiHistoryPanel
            items={historyStore.items}
            onTogglePin={historyStore.togglePin}
            onDelete={historyStore.deleteEntry}
            onClear={historyStore.clearHistory}
            onSelect={handleSelectHistory}
            onClose={() => setHistoryOpen(false)}
          />
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
              <Sparkles className="h-8 w-8 text-primary/50" />
              <p className="text-sm">Apna academic sawaal poochho</p>
              <p className="text-xs">Mic, type, ya PDF/text file attach karo — bina internet</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl p-3 ${
                m.role === "user"
                  ? "bg-primary/10 ml-8"
                  : "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 mr-2"
              }`}
            >
              {m.role === "assistant" ? (
                <MarkdownLite text={m.content} />
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
              )}
              {m.role === "assistant" && (
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => copyMsg(m.content)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    aria-label="Copy"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      speech.isSpeaking ? speech.stopSpeaking() : speech.speak(m.content)
                    }
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    aria-label={speech.isSpeaking ? "Stop" : "Play"}
                  >
                    {speech.isSpeaking ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </button>
                  {m.sourceQuestion && (
                    <button
                      type="button"
                      onClick={() => regenerate(m.sourceQuestion!)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                      aria-label="Regenerate"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                  {m.sourceQuestion && (
                    <button
                      type="button"
                      onClick={() => askSimilar(m.sourceQuestion!)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                      aria-label="Similar question"
                    >
                      <Wand2 className="h-3 w-3" />
                    </button>
                  )}
                  {m.historyId && (
                    <button
                      type="button"
                      onClick={() => toggleBookmark(m)}
                      className="p-1 rounded text-muted-foreground hover:text-amber-500"
                      aria-label="Bookmark"
                    >
                      {historyStore.items.find((h) => h.id === m.historyId)?.pinned ? (
                        <PinOff className="h-3 w-3 text-amber-500" />
                      ) : (
                        <Pin className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {loadingMsg && (
            <div className="rounded-2xl p-3 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 mr-2 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">{loadingMsg}</p>
            </div>
          )}
        </div>
      )}

      {attachedFileName && (
        <div className="relative w-fit mt-2 shrink-0 flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1 text-xs">
          <FileText className="h-3.5 w-3.5" />
          <span className="max-w-[140px] truncate">{attachedFileName}</span>
          {isExtracting && <Loader2 className="h-3 w-3 animate-spin" />}
          <button
            type="button"
            onClick={() => {
              setAttachedFileName(null);
              setAttachError(null);
            }}
            className="text-muted-foreground hover:text-destructive ml-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {attachError && (
        <p className="text-[11px] text-destructive mt-1 shrink-0">{attachError}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf,.txt,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileAttach(file);
        }}
      />

      {/* Input row */}
      <div className="flex items-end gap-2 mt-2 shrink-0">
        <button
          type="button"
          onClick={handleMic}
          disabled={!speech.isSupported}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
            speech.isListening
              ? "bg-destructive/20 border-2 border-destructive animate-pulse"
              : "bg-primary/15 border-2 border-primary"
          }`}
          aria-label="Voice input"
        >
          <Mic className={`h-5 w-5 ${speech.isListening ? "text-destructive" : "text-primary"}`} />
        </button>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full shrink-0"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach PDF or text file"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPaste={() => {
            // Normalize pasted text on the next tick, after the browser
            // inserts it, so formatting/extra spaces don't confuse the
            // solver later.
            setTimeout(() => setQuery((q) => normalizeQuestion(q)), 0);
          }}
          placeholder="Type, paste, or attach a question..."
          rows={1}
          className="flex-1 rounded-2xl px-3 py-2.5 bg-muted resize-none outline-none text-sm max-h-24"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              runQuery(query);
            }
          }}
        />
        <Button
          size="icon"
          className="h-11 w-11 rounded-full shrink-0"
          onClick={() => runQuery(query)}
          disabled={!query.trim()}
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between mt-1.5 shrink-0">
        <button
          type="button"
          onClick={clearChat}
          className="text-[11px] text-muted-foreground hover:text-destructive"
        >
          Clear Chat
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFormula((v) => !v)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
              showFormula
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
            aria-label="Toggle formula step"
          >
            <Sigma className="h-3 w-3" />
            Formula
          </button>
          <div className="flex items-center rounded-full bg-muted p-0.5 text-[10px] font-medium">
            {(["hi", "en", "mix"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setLangMode(m)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  langMode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {m === "hi" ? "हिं" : m === "en" ? "EN" : "मिक्स"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <History className="h-3 w-3" />
            {historyOpen ? "Back to Chat" : "History"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

function loadChatHistory(): ChatMsg[] {
  try {
    return JSON.parse(localStorage.getItem("aiPlusChatHistory") || "[]");
  } catch {
    return [];
  }
}

function AiPlusAssistant() {
  const { apiKey, hasKey, setApiKey, clearApiKey } = useAiPlusKey();
  const speech = useSpeech();
  const isOnline = useOnlineStatus();
  const { flags } = useFeatureFlags();
  const { remaining, limitReached, recordUsage, grantReward } = useAiUsageLimit(
    flags.aiDailyFreeLimit,
    flags.aiRewardPerAd,
  );
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>(loadChatHistory);
  const [streamingText, setStreamingText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ data: string; mediaType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("aiPlusChatHistory", JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const [header, base64] = result.split(",");
      const mediaType = header.match(/data:(.*);base64/)?.[1] || "image/jpeg";
      setImageData({ data: base64, mediaType });
    };
    reader.readAsDataURL(file);
  };

  const runQuery = async (text: string, historyOverride?: ChatMsg[]) => {
    if ((!text.trim() && !imageData) || !apiKey) return;
    if (!isOnline) {
      setError("Internet connection required for AI Plus.");
      return;
    }
    if (flags.aiDailyFreeLimit > 0 && limitReached) {
      if (flags.rewardedAdForAiEnabled) {
        setShowRewardDialog(true);
      } else {
        setError("Aaj ki free AI+ limit poori ho gayi. Kal phir try karein.");
      }
      return;
    }
    const baseHistory = historyOverride ?? messages;
    const userMsg: ChatMsg = {
      id: `${Date.now()}-u`,
      role: "user",
      content: text,
      image: imagePreview ?? undefined,
    };
    const nextHistory = [...baseHistory, userMsg];
    setMessages(nextHistory);
    setQuery("");
    setImagePreview(null);
    const currentImage = imageData;
    setImageData(null);
    setError(null);
    setThinking(true);
    setStreamingText("");

    try {
      const provider = AI_PROVIDERS[DEFAULT_PROVIDER];
      let fullText = "";
      let firstChunk = true;
      await provider.streamChat(
        nextHistory.map((m) => ({ role: m.role, content: m.content })),
        apiKey,
        (delta) => {
          if (firstChunk) {
            setThinking(false);
            setStreaming(true);
            firstChunk = false;
          }
          fullText += delta;
          setStreamingText(fullText);
        },
        currentImage ?? undefined,
      );
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", content: fullText },
      ]);
      speech.speak(fullText);
      if (flags.aiDailyFreeLimit > 0) recordUsage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed. Please try again.");
    } finally {
      setThinking(false);
      setStreaming(false);
      setStreamingText("");
    }
  };

  const regenerate = () => {
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const idx = messages.length - 1 - lastUserIdx;
    const trimmed = messages.slice(0, idx);
    runQuery(messages[idx].content, trimmed);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("aiPlusChatHistory");
  };

  const copyMsg = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };
  const shareMsg = (text: string) => {
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else copyMsg(text);
  };

  if (!speech.isListening && speech.transcript && speech.transcript !== query) {
    setQuery(speech.transcript);
    runQuery(speech.transcript);
  }

  if (!hasKey) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold flex items-center gap-1.5">
            <KeyRound className="h-4 w-4 text-amber-600" /> API Key Chahiye
          </p>
          <p className="text-xs text-muted-foreground">
            AI+ ek Cloud AI hai, khule sawalon ka detailed jawab deta hai,
            photo se bhi solve karta hai — iske liye apni Anthropic API key
            chahiye (paisa lagta hai, aap khud manage karte hain).
          </p>
        </div>
        <Input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="sk-ant-..."
        />
        <Button className="w-full" onClick={() => setApiKey(keyInput)}>
          Save Key
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[520px]">
      {!isOnline && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive font-medium mb-2 shrink-0">
          <WifiOff className="h-4 w-4 shrink-0" />
          Internet connection required for AI Plus.
        </div>
      )}
      {flags.aiDailyFreeLimit > 0 && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground mb-2 shrink-0">
          <span>Aaj bache hue questions: {remaining}</span>
          {flags.rewardedAdForAiEnabled && (
            <button
              type="button"
              onClick={() => setShowRewardDialog(true)}
              className="text-primary font-medium"
            >
              + Ad dekhkar extra paayein
            </button>
          )}
        </div>
      )}
      {speech.speechError && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 mb-2 shrink-0">
          {speech.speechError}
        </div>
      )}

      {/* Chat scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && !thinking && !streaming && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <Sparkles className="h-8 w-8 text-purple-500/50" />
            <p className="text-sm">Cloud AI se kuch bhi poochho</p>
            <p className="text-xs">Mic, type, ya photo attach karo</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={m.id}
            className={`rounded-2xl p-3 ${
              m.role === "user"
                ? "bg-primary/10 ml-8"
                : "bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/20 mr-2"
            }`}
          >
            {m.image && (
              <img src={m.image} alt="attached" className="max-h-28 rounded-lg mb-2" />
            )}
            {m.role === "assistant" ? (
              <MarkdownLite text={m.content} />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            )}
            {m.role === "assistant" && (
              <div className="flex items-center gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => copyMsg(m.content)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  aria-label="Copy"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => shareMsg(m.content)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  aria-label="Share"
                >
                  <Share2 className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    speech.isSpeaking ? speech.stopSpeaking() : speech.speak(m.content)
                  }
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  aria-label="Speak"
                >
                  <Volume2 className="h-3 w-3" />
                </button>
                {idx === messages.length - 1 && (
                  <button
                    type="button"
                    onClick={regenerate}
                    className="flex items-center gap-1 p-1 rounded text-muted-foreground hover:text-foreground text-[10px]"
                  >
                    <RotateCcw className="h-3 w-3" /> Regenerate
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="rounded-2xl p-3 bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/20 mr-2 flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
            </span>
            <span className="text-xs text-muted-foreground">Thinking...</span>
          </div>
        )}
        {streaming && streamingText && (
          <div className="rounded-2xl p-3 bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/20 mr-2">
            <MarkdownLite text={streamingText} />
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>

      {imagePreview && (
        <div className="relative w-fit mt-2 shrink-0">
          <img src={imagePreview} alt="Attached" className="max-h-20 rounded-lg border border-border" />
          <button
            type="button"
            onClick={() => {
              setImagePreview(null);
              setImageData(null);
            }}
            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageSelect(file);
        }}
      />

      {/* Input row */}
      <div className="flex items-end gap-2 mt-2 shrink-0">
        <button
          type="button"
          onClick={() =>
            speech.isListening ? speech.stopListening() : speech.startListening()
          }
          disabled={!speech.isSupported}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
            speech.isListening
              ? "bg-destructive/20 border-2 border-destructive animate-pulse"
              : "bg-purple-500/15 border-2 border-purple-500"
          }`}
        >
          <Mic className={`h-5 w-5 ${speech.isListening ? "text-destructive" : "text-purple-500"}`} />
        </button>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full shrink-0"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach photo"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything..."
          rows={1}
          className="flex-1 rounded-2xl px-3 py-2.5 bg-muted resize-none outline-none text-sm max-h-24"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              runQuery(query);
            }
          }}
        />
        <Button
          size="icon"
          className="h-11 w-11 rounded-full shrink-0"
          onClick={() => runQuery(query)}
          disabled={thinking || streaming || (!query.trim() && !imageData)}
        >
          {thinking || streaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Type className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between mt-1.5 shrink-0">
        <button
          type="button"
          onClick={clearChat}
          className="text-[11px] text-muted-foreground hover:text-destructive"
        >
          Clear Chat
        </button>
        <button
          type="button"
          onClick={clearApiKey}
          className="text-[11px] text-muted-foreground hover:text-destructive"
        >
          Remove API key
        </button>
      </div>

      {/* Rewarded-ad dialog — demo/simulation until a real ad SDK is
          connected (Admin Panel → Providers → Ads). Reward only grants
          after the "ad" finishes; user can always skip and try again
          tomorrow instead of watching. */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extra Questions Unlock Karein</DialogTitle>
            <DialogDescription>
              Aaj ki free limit poori ho gayi hai. Ek chhota advertisement
              dekhkar {flags.aiRewardPerAd} extra questions paayein.
              {!watchingAd && " (Abhi demo mode hai — real ad provider connect hone tak yeh sirf simulation hai.)"}
            </DialogDescription>
          </DialogHeader>
          {watchingAd ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Ad chal raha hai…</p>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
                Skip
              </Button>
              <Button
                onClick={() => {
                  setWatchingAd(true);
                  setTimeout(() => {
                    grantReward();
                    setWatchingAd(false);
                    setShowRewardDialog(false);
                  }, 2500);
                }}
              >
                Ad Dekhein
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function VoiceCalculator() {
  const { flags } = useFeatureFlags();

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Mic className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            AI Assistant
          </h3>
          <p className="text-xs text-muted-foreground">
            {flags.aiPlusEnabled
              ? "Free (instant) or AI+ (powerful, needs your key)"
              : "Free (instant, offline)"}
          </p>
        </div>
      </div>

      {flags.aiPlusEnabled ? (
        <Tabs defaultValue="free" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="free" className="flex-1">
              Free
            </TabsTrigger>
            <TabsTrigger value="aiplus" className="flex-1 gap-1">
              <Sparkles className="h-3.5 w-3.5" /> AI+ <Globe className="h-3 w-3 opacity-60" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="free" className="mt-4">
            <FreeAssistant />
          </TabsContent>
          <TabsContent value="aiplus" className="mt-4">
            <AiPlusAssistant />
          </TabsContent>
        </Tabs>
      ) : (
        <FreeAssistant />
      )}
    </div>
  );
}
