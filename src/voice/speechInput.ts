/**
 * Microphone-to-text wrapper using the Web Speech API (SpeechRecognition).
 * Fails gracefully if the API is absent (some Chromium builds lack it).
 * Does NOT auto-send — final results are placed in the input for the student to review.
 */

/** Handle returned by createSpeechInput for controlling the recognizer. */
export interface SpeechInputHandle {
  /** Starts recognition in the given locale (e.g. 'en-US' or 'fa-IR'). */
  start(locale: string): void;
  /** Stops recognition cleanly. */
  stop(): void;
  /** True if SpeechRecognition is available in this browser. */
  readonly isSupported: boolean;
}

/** Options passed when creating a speech input instance. */
interface SpeechInputOptions {
  /** Called for both interim (isFinal=false) and final (isFinal=true) results. */
  onResult: (text: string, isFinal: boolean) => void;
  /** Called when recognition encounters an error. */
  onError: (err: string) => void;
  /** Called when the recognition session ends (either naturally or via stop()). */
  onEnd: () => void;
}

// Feature-detect the SpeechRecognition constructor (vendor-prefixed in some builds)
const SpeechRecognitionCtor: typeof SpeechRecognition | undefined =
  (typeof window !== 'undefined' && (window.SpeechRecognition ?? (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)) || undefined;

/**
 * Creates a SpeechRecognition-based speech input handle.
 * If the API is not supported, isSupported is false and start/stop are no-ops.
 */
export function createSpeechInput(opts: SpeechInputOptions): SpeechInputHandle {
  if (!SpeechRecognitionCtor) {
    // Not supported — return a graceful no-op handle
    return {
      isSupported: false,
      start: () => undefined,
      stop: () => undefined,
    };
  }

  let recognition: SpeechRecognition | null = null;

  function start(locale: string): void {
    // Stop any existing session first
    stop();

    recognition = new SpeechRecognitionCtor!();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = locale;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        opts.onResult(transcript, result.isFinal);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('[speechInput] Recognition error:', event.error);
      opts.onError(event.error);
    };

    recognition.onend = () => {
      opts.onEnd();
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('[speechInput] Failed to start recognition:', err);
      opts.onError(String(err));
    }
  }

  function stop(): void {
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Ignore errors when stopping — recognizer may already be stopped
      }
      recognition = null;
    }
  }

  return { isSupported: true, start, stop };
}
