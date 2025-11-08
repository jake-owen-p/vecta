declare module "@loomhq/loom-sdk" {
  export type SDKUnsupportedReason =
    | "incompatible-browser"
    | "third-party-cookies-disabled"
    | "no-media-streams-support"
    | "generic-error";

  export type SDKState = "closed" | "pre-recording" | "active-recording" | "post-recording";

  export type Environment = "development" | "testbench" | "staging" | "production";

  export interface SDKConfig {
    bubbleResizable: boolean;
    insertButtonText: string;
    disablePreviewModal?: boolean;
    enableOnboardingTutorial?: boolean;
  }

  export interface LoomVideo {
    id: string;
    title: string;
    height: number;
    width: number;
    sharedUrl: string;
    embedUrl: string;
    providerUrl: string;
    duration?: number;
    thumbnailHeight?: number;
    thumbnailWidth?: number;
    thumbnailUrl?: string;
  }

  export interface Hooks {
    onInsertClicked?: (video: LoomVideo) => void;
    onStart?: () => void;
    onRecordingStarted?: () => void;
    onCancel?: () => void;
    onComplete?: () => void;
    onAnalyticsEvent?: (event: string) => void;
    onLifecycleUpdate?: (state: SDKState) => void;
    onRecordingComplete?: (video: LoomVideo) => void;
    onUploadComplete?: (video: LoomVideo) => void;
  }

  export interface SDKButtonInterface {
    openPreRecordPanel(): void;
    closePreRecordPanel(): void;
    moveBubble(position: { x: number; y: number }): void;
    endRecording(): void;
  }

  export interface SDKResult {
    teardown(): void;
    configureButton(options?: { element?: HTMLElement; hooks?: Hooks }): SDKButtonInterface;
    status(): { state: SDKState | undefined; success: boolean };
  }

  export function isSupported(): Promise<{ supported: boolean; error?: SDKUnsupportedReason }>;

  export function setup(options: {
    apiKey?: string;
    publicAppId?: string;
    environment?: Environment;
    config?: Partial<SDKConfig>;
    jws?: string;
  }): Promise<SDKResult>;
}


