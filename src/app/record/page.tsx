"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isSupported, setup } from "@loomhq/loom-sdk";
import type { LoomVideo, SDKButtonInterface, SDKResult, SDKUnsupportedReason } from "@loomhq/loom-sdk";

import { Footer } from "../_components/Footer";
import { SiteToolbar } from "../_components/SiteToolbar";
import { Button } from "../_components/ui/button";

const RECORDING_LIMIT_SECONDS = 2 * 60 * 60; // 2 hours
const ATTEMPT_STORAGE_KEY = "vecta.recording.attemptUsed";
const VIDEO_STORAGE_KEY = "vecta.recording.lastVideo";
const LOOM_PUBLIC_APP_ID = process.env.NEXT_PUBLIC_LOOM_PUBLIC_APP_ID ?? "";

type StoredVideo = Pick<
  LoomVideo,
  | "id"
  | "title"
  | "sharedUrl"
  | "embedUrl"
  | "duration"
  | "providerUrl"
  | "thumbnailUrl"
  | "thumbnailHeight"
  | "thumbnailWidth"
  | "width"
  | "height"
>;

const INSTRUCTIONS = [
  "Pick a quiet space, close unused tabs, and have any notes you need within reach.",
  "Click “Start recording” below. When Loom opens, choose “Screen” and select “Your entire screen” so we can see everything you present.",
  "Walk us through your background, recent work, and give a live demo or architecture walk-through. You have up to two hours.",
  "When you finish, stop the recording. Loom will upload the video automatically—copy the share link below and send it with your application.",
];

const getSupportErrorMessage = (reason: SDKUnsupportedReason | undefined) => {
  switch (reason) {
    case "incompatible-browser":
      return "Loom recording is not supported in this browser. Please switch to the latest Chrome, Edge, or Firefox.";
    case "third-party-cookies-disabled":
      return "Loom needs third-party cookies to authenticate. Enable them temporarily or add an exception for loom.com.";
    case "no-media-streams-support":
      return "This device does not allow screen or camera capture. Try another device that supports media recording.";
    default:
      return "Loom recording is unavailable in this environment. Please try again from a supported browser.";
  }
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return null;
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!hours && (secs || !minutes)) parts.push(`${secs}s`);

  return parts.join(" ");
};

const RecordInterviewPage = () => {
  const [hasAttempted, setHasAttempted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingLimitReached, setRecordingLimitReached] = useState(false);
  const [video, setVideo] = useState<LoomVideo | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const sdkInstanceRef = useRef<SDKResult | null>(null);
  const sdkButtonRef = useRef<SDKButtonInterface | null>(null);
  const limitTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const initializationRef = useRef(false);

  const clearLimitTimer = useCallback(() => {
    if (typeof window === "undefined") return;
    if (limitTimerRef.current) {
      window.clearTimeout(limitTimerRef.current);
      limitTimerRef.current = null;
    }
  }, []);

  const startLimitTimer = useCallback(() => {
    if (typeof window === "undefined") return;
    clearLimitTimer();
    limitTimerRef.current = window.setTimeout(() => {
      setRecordingLimitReached(true);
      sdkButtonRef.current?.endRecording();
    }, RECORDING_LIMIT_SECONDS * 1000);
  }, [clearLimitTimer]);

  const markAttemptUsed = useCallback(() => {
    setHasAttempted((previous) => {
      if (!previous && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(ATTEMPT_STORAGE_KEY, "true");
        } catch (storageError) {
          console.error("Unable to persist Loom attempt flag", storageError);
        }
      }
      return true;
    });
  }, []);

  const persistVideo = useCallback((loomVideo: LoomVideo) => {
    setVideo(loomVideo);
    if (typeof window === "undefined") return;
    try {
      const payload: StoredVideo = {
        id: loomVideo.id,
        title: loomVideo.title,
        sharedUrl: loomVideo.sharedUrl,
        embedUrl: loomVideo.embedUrl,
        duration: loomVideo.duration,
        providerUrl: loomVideo.providerUrl,
        thumbnailUrl: loomVideo.thumbnailUrl,
        thumbnailHeight: loomVideo.thumbnailHeight,
        thumbnailWidth: loomVideo.thumbnailWidth,
        width: loomVideo.width,
        height: loomVideo.height,
      };
      window.localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(payload));
    } catch (storageError) {
      console.error("Unable to persist Loom recording metadata", storageError);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedAttempt = window.localStorage.getItem(ATTEMPT_STORAGE_KEY);
      if (storedAttempt === "true") {
        setHasAttempted(true);
      }

      const storedVideoRaw = window.localStorage.getItem(VIDEO_STORAGE_KEY);
      if (storedVideoRaw) {
        const parsed = JSON.parse(storedVideoRaw) as StoredVideo;
        if (
          parsed &&
          typeof parsed.id === "string" &&
          typeof parsed.sharedUrl === "string" &&
          typeof parsed.embedUrl === "string"
        ) {
          setVideo(parsed as LoomVideo);
          setStatus("Recording ready. Copy the Loom link below.");
        }
      }
    } catch (storageError) {
      console.error("Unable to restore saved Loom data", storageError);
    }
  }, []);

  useEffect(() => {
    if (!copyFeedback || typeof window === "undefined") return;
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopyFeedback(null);
      copyTimerRef.current = null;
    }, 2500);

    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, [copyFeedback]);

  useEffect(() => {
    if (hasAttempted) return;
    if (sdkButtonRef.current || initializationRef.current) return;
    if (!LOOM_PUBLIC_APP_ID) {
      setStatus(null);
      setError("Loom is not configured. Ask the Vecta team to set NEXT_PUBLIC_LOOM_PUBLIC_APP_ID.");
      return;
    }

    let isActive = true;
    initializationRef.current = true;
    setIsLoading(true);
    setError(null);

    const initialise = async () => {
      try {
        const support = await isSupported();
        if (!isActive) return;

        if (!support.supported) {
          setStatus(null);
          setError(getSupportErrorMessage(support.error));
          return;
        }

        const sdkResult = await setup({
          publicAppId: LOOM_PUBLIC_APP_ID,
          config: {
            bubbleResizable: false,
            insertButtonText: "Record interview",
            disablePreviewModal: false,
          },
        });

        if (!isActive) {
          sdkResult.teardown();
          return;
        }

        sdkInstanceRef.current = sdkResult;
        const button = sdkResult.configureButton({
          hooks: {
            onStart: () => {
              setError(null);
              setRecordingLimitReached(false);
              setStatus("Preparing the Loom recorder…");
            },
            onRecordingStarted: () => {
              markAttemptUsed();
              setIsRecording(true);
              setStatus("Recording in progress");
              setRecordingLimitReached(false);
              startLimitTimer();
            },
            onLifecycleUpdate: (state) => {
              if (state === "post-recording") {
                setStatus("Wrapping up your recording…");
              }
            },
            onCancel: () => {
              clearLimitTimer();
              setIsRecording(false);
              setStatus("Recording cancelled. If this was a mistake, contact the Vecta team.");
            },
            onRecordingComplete: () => {
              clearLimitTimer();
              setIsRecording(false);
              setIsUploading(true);
              setStatus("Uploading your recording to Loom…");
            },
            onUploadComplete: (loomVideo) => {
              setIsUploading(false);
              persistVideo(loomVideo);
              setStatus("Upload complete. Copy the Loom link below and share it with the team.");
            },
          },
        });

        sdkButtonRef.current = button;
        setSdkReady(true);
        setStatus("Recorder ready. Choose screen-only when Loom opens. You have one attempt.");
      } catch (sdkError) {
        console.error("Failed to initialise the Loom SDK", sdkError);
        setStatus(null);
        setError(sdkError instanceof Error ? sdkError.message : "Failed to initialise Loom.");
      } finally {
        if (isActive) {
          setIsLoading(false);
          initializationRef.current = false;
        }
      }
    };

    void initialise();

    return () => {
      isActive = false;
    };
  }, [hasAttempted, startLimitTimer, clearLimitTimer, markAttemptUsed, persistVideo]);

  useEffect(() => {
    return () => {
      clearLimitTimer();
      if (typeof window !== "undefined" && copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
      sdkInstanceRef.current?.teardown();
      sdkInstanceRef.current = null;
      sdkButtonRef.current = null;
    };
  }, [clearLimitTimer]);

  const handleRecordClick = useCallback(() => {
    if (!sdkButtonRef.current) return;
    setCopyFeedback(null);
    setError(null);
    setStatus("Opening Loom recorder…");
    sdkButtonRef.current.openPreRecordPanel();
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!video?.sharedUrl) return;
    try {
      await navigator.clipboard.writeText(video.sharedUrl);
      setCopyFeedback("Link copied to clipboard.");
    } catch (copyError) {
      console.error("Unable to copy Loom link", copyError);
      setCopyFeedback("Copy failed. Please copy the link manually.");
    }
  }, [video]);

  const recordButtonDisabled = hasAttempted || !sdkReady || isLoading || isRecording || isUploading;
  const recordButtonLabel = hasAttempted
    ? "Attempt used"
    : isRecording
      ? "Recording…"
      : isUploading
        ? "Uploading…"
        : isLoading
          ? "Setting up…"
          : "Start recording";

  const recordingDurationLabel = video ? formatDuration(video.duration) : null;

  return (
    <div className="min-h-screen bg-[#090200] text-white">
      <SiteToolbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr,1fr]">
          <section className="space-y-8">
            <header className="space-y-4">
              <span className="block h-1 w-16 rounded-full bg-[#FF3600]" />
              <h1 className="text-4xl font-semibold md:text-5xl">Record your Vecta interview</h1>
              <p className="max-w-2xl text-lg text-white/70">
                This Loom replaces a live screening. You have a single attempt to record up to two hours. Show us how you
                think, build, and communicate&mdash;walk through recent work, demonstrate an agent you shipped, or explain an
                architecture decision end-to-end.
              </p>
            </header>

            <div className="rounded-3xl border border-white/5 bg-[#120606] p-8 shadow-xl shadow-black/40">
              <h2 className="text-2xl font-semibold">How to make it count</h2>
              <ul className="mt-6 space-y-5">
                {INSTRUCTIONS.map((instruction, index) => (
                  <li key={instruction} className="flex items-start gap-4 text-base text-white/80">
                    <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#FF3600]/40 bg-[#FF3600]/10 text-sm font-semibold text-[#FF3600]">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-2xl border border-white/10 bg-[#150807] p-6 text-sm text-white/70">
                <div className="font-semibold text-white">Important</div>
                <ul className="mt-3 space-y-2">
                  <li>• You can only start the recorder once. If anything breaks, email the team.</li>
                  <li>• Loom will run under Vecta&apos;s account via our public app ID.</li>
                  <li>• Maximum recording length: {RECORDING_LIMIT_SECONDS / 3600} hours. We auto-stop anything longer.</li>
                </ul>
              </div>
            </div>

            {video && (
              <section className="rounded-3xl border border-white/5 bg-[#120606] p-8 shadow-xl shadow-black/40">
                <header className="flex flex-wrap items-center gap-4">
                  <h2 className="text-2xl font-semibold">Your Loom recording</h2>
                  {recordingDurationLabel ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                      {recordingDurationLabel}
                    </span>
                  ) : null}
                </header>
                <p className="mt-4 text-sm text-white/60">
                  Keep this link handy&mdash;it&apos;s what we&apos;ll review. If you need to update anything, contact the team before
                  submitting a new video.
                </p>

                {!isUploading && video.embedUrl ? (
                  <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <iframe
                      src={`${video.embedUrl}?hide_owner=true&hide_share=true`}
                      allow="accelerometer; autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                      title={video.title ?? "Loom recording preview"}
                    />
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-[#150807] p-8 text-center text-sm text-white/60">
                    {isUploading ? "Uploading to Loom… stay on this page until it completes." : "Preview unavailable."}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#150807] p-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-white/50">Shareable link</span>
                    <a
                      href={video.sharedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-base text-[#FF9266] underline decoration-[#FF9266]/60 underline-offset-4 hover:text-[#ffb49b]"
                    >
                      {video.sharedUrl}
                    </a>
                  </div>
                  <Button onClick={handleCopyLink} size="sm" variant="secondary">
                    Copy link
                  </Button>
                </div>
                {copyFeedback ? (
                  <p className="mt-3 text-sm text-white/60">{copyFeedback}</p>
                ) : (
                  <p className="mt-3 text-xs uppercase tracking-wide text-white/40">
                    If the button fails, highlight and copy the link manually.
                  </p>
                )}
              </section>
            )}
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#150807] p-8 shadow-xl shadow-black/40">
              <h2 className="text-xl font-semibold text-white">Ready when you are</h2>
              <p className="mt-2 text-sm text-white/70">
                Your recording window: up to {RECORDING_LIMIT_SECONDS / 60} minutes. The recorder will close automatically once
                you hit the limit.
              </p>

              <Button
                className="mt-6 h-12 w-full rounded-full text-base font-semibold"
                disabled={recordButtonDisabled}
                onClick={handleRecordClick}
                variant="accent"
              >
                {recordButtonLabel}
              </Button>

              <div className="mt-6 space-y-3 text-sm">
                {status ? <p className="text-white/70">{status}</p> : null}
                {isRecording ? (
                  <p className="text-[#FF9266]">
                    We&apos;re capturing your entire screen. When you&apos;re done, hit stop inside Loom to upload automatically.
                  </p>
                ) : null}
                {isUploading ? (
                  <p className="text-[#FF9266]">Keep this tab open—closing it early can interrupt the upload.</p>
                ) : null}
                {recordingLimitReached ? (
                  <p className="text-[#FF9266]">
                    We stopped the recording at the two-hour mark. If you need more time, contact the Vecta team.
                  </p>
                ) : null}
                {error ? <p className="text-red-400">{error}</p> : null}
                {hasAttempted && !video ? (
                  <p className="text-[#FF9266]">
                    Attempt recorded. If your video isn&apos;t appearing, refresh once, then reach out to the team for help.
                  </p>
                ) : null}
                {!sdkReady && !error ? (
                  <p className="text-white/50">
                    Initialising Loom&hellip; this can take a few seconds the first time as we verify your browser.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#120606] p-6 text-sm text-white/70 shadow-lg shadow-black/40">
              <h3 className="text-base font-semibold text-white">What we&apos;re looking for</h3>
              <ul className="mt-3 space-y-2">
                <li>• How you structure agentic systems end-to-end.</li>
                <li>• Clear reasoning about trade-offs and evaluation.</li>
                <li>• A shipped workflow, automation, or architecture in action.</li>
              </ul>
              <p className="mt-4 text-xs uppercase tracking-wide text-white/40">
                Send any additional materials (repos, diagrams, dashboards) to your point of contact right after you share the Loom.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecordInterviewPage;


