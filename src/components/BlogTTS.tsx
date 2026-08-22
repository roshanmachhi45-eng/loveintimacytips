
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";

interface BlogTTSProps {
  contentId?: string;
}

interface SpeechChunk {
  text: string;
}

/*
 * BlogTTS
 *
 * This component reads ONLY the blog article content.
 *
 * IMPORTANT:
 * BlogDetails.tsx ke actual article content container par:
 *
 * id="blog-article-content"
 *
 * hona chahiye.
 *
 * Example:
 *
 * <article id="blog-article-content">
 * ...
 * </article>
 */

/* --------------------------------------------------
   DEFAULT SETTINGS
-------------------------------------------------- */

const DEFAULT_CONTENT_ID = "blog-article-content";

/*
 * User ko speed control nahi diya jayega.
 * 0.9 ek comfortable reading speed hai.
 */
const SPEECH_RATE = 0.9;

/*
 * Normal natural pitch.
 */
const SPEECH_PITCH = 1;

/*
 * Full volume.
 */
const SPEECH_VOLUME = 1;

/*
 * Chunks bahut bade hone par Android/mobile browsers
 * SpeechSynthesis ko problem ho sakti hai.
 */
const MAX_CHUNK_LENGTH = 220;


/* --------------------------------------------------
   TEXT CLEANING
-------------------------------------------------- */

function cleanText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* --------------------------------------------------
   CREATE SPEECH CHUNKS
-------------------------------------------------- */

function createSpeechChunks(article: HTMLElement): SpeechChunk[] {
  /*
   * Article ki copy banate hain taaki original website
   * ke content ko modify na karein.
   */
  const clone = article.cloneNode(true) as HTMLElement;

  /*
   * In elements ko TTS nahi padhega.
   *
   * TOC
   * TTS controls
   * navigation
   * footer
   * buttons
   * scripts/styles
   */
  const elementsToRemove = clone.querySelectorAll(
    [
      "[data-blog-tts]",
      "[data-toc]",
      ".table-of-contents",
      ".toc",
      "nav",
      "footer",
      "script",
      "style",
      "button",
      "noscript",
    ].join(",")
  );

  elementsToRemove.forEach((element) => {
    element.remove();
  });

  /*
   * Sirf article ka text nikaalo.
   */
  const articleText = cleanText(clone.textContent || "");

  if (!articleText) {
    return [];
  }

  /*
   * Pehle sentence boundaries par split karne ki koshish.
   */
  const sentences = articleText.match(
    /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g
  );

  if (!sentences) {
    return [{ text: articleText }];
  }

  const chunks: SpeechChunk[] = [];

  let currentChunk = "";

  for (const rawSentence of sentences) {
    const sentence = cleanText(rawSentence);

    if (!sentence) {
      continue;
    }

    /*
     * Agar current chunk + sentence limit ke andar hai,
     * to same chunk me add karo.
     */
    if (
      currentChunk.length > 0 &&
      currentChunk.length + sentence.length + 1 <= MAX_CHUNK_LENGTH
    ) {
      currentChunk += ` ${sentence}`;
      continue;
    }

    /*
     * Current chunk available hai to save karo.
     */
    if (currentChunk.length > 0) {
      chunks.push({
        text: currentChunk,
      });

      currentChunk = "";
    }

    /*
     * Agar ek single sentence hi bahut bada hai,
     * to usko words ke basis par todna padega.
     */
    if (sentence.length > MAX_CHUNK_LENGTH) {
      const words = sentence.split(/\s+/);

      let wordChunk = "";

      for (const word of words) {
        if (
          wordChunk.length > 0 &&
          wordChunk.length + word.length + 1 > MAX_CHUNK_LENGTH
        ) {
          chunks.push({
            text: wordChunk,
          });

          wordChunk = word;
        } else {
          wordChunk =
            wordChunk.length > 0
              ? `${wordChunk} ${word}`
              : word;
        }
      }

      if (wordChunk.length > 0) {
        currentChunk = wordChunk;
      }
    } else {
      currentChunk = sentence;
    }
  }

  /*
   * Last chunk save karo.
   */
  if (currentChunk.length > 0) {
    chunks.push({
      text: currentChunk,
    });
  }

  return chunks;
}


/* --------------------------------------------------
   COMPONENT
-------------------------------------------------- */

export default function BlogTTS({
  contentId = DEFAULT_CONTENT_ID,
}: BlogTTSProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const chunksRef = useRef<SpeechChunk[]>([]);
  const currentChunkRef = useRef(0);

  /*
   * Yeh ref batata hai ki user ne manually stop kiya hai.
   */
  const stoppedRef = useRef(false);

  /*
   * Yeh ref batata hai ki component unmount ho raha hai.
   */
  const mountedRef = useRef(true);

  /* ------------------------------------------------
     STOP SPEECH
  ------------------------------------------------ */

  const stopSpeech = useCallback(() => {
    stoppedRef.current = true;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (!mountedRef.current) {
      return;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setIsFinished(false);

    currentChunkRef.current = 0;
  }, []);


  /* ------------------------------------------------
     SPEAK CURRENT CHUNK
  ------------------------------------------------ */

  const speakCurrentChunk = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    if (stoppedRef.current) {
      return;
    }

    const chunks = chunksRef.current;

    /*
     * Article complete.
     */
    if (currentChunkRef.current >= chunks.length) {
      window.speechSynthesis.cancel();

      if (mountedRef.current) {
        setIsPlaying(false);
        setIsPaused(false);
        setIsFinished(true);
      }

      return;
    }

    const currentChunk =
      chunks[currentChunkRef.current];

    if (!currentChunk?.text) {
      currentChunkRef.current += 1;
      speakCurrentChunk();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      currentChunk.text
    );

    /*
     * Fixed natural reading settings.
     */
    utterance.rate = SPEECH_RATE;
    utterance.pitch = SPEECH_PITCH;
    utterance.volume = SPEECH_VOLUME;

    /*
     * Browser ki available English voice choose karne ki
     * koshish.
     *
     * Android/Chrome me available voice browser/device
     * par depend karegi.
     */
    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang.toLowerCase() === "en-us"
        ) ||
        voices.find(
          (voice) =>
            voice.lang.toLowerCase() === "en-gb"
        ) ||
        voices.find(
          (voice) =>
            voice.lang.toLowerCase().startsWith("en")
        );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    /*
     * Current chunk complete hone ke baad next chunk.
     */
    utterance.onend = () => {
      if (!mountedRef.current) {
        return;
      }

      if (stoppedRef.current) {
        return;
      }

      currentChunkRef.current += 1;

      /*
       * Next chunk ko thoda asynchronously start karna
       * mobile browsers ke liye zyada reliable hota hai.
       */
      window.setTimeout(() => {
        if (!stoppedRef.current) {
          speakCurrentChunk();
        }
      }, 30);
    };

    /*
     * Speech error.
     */
    utterance.onerror = (event) => {
      if (!mountedRef.current) {
        return;
      }

      /*
       * "interrupted" normally tab aa sakta hai jab
       * speech cancel/pause hua ho.
       */
      if (
        event.error === "interrupted" ||
        event.error === "canceled"
      ) {
        return;
      }

      setIsPlaying(false);
      setIsPaused(false);
    };

    /*
     * Speech start.
     */
    utterance.onstart = () => {
      if (!mountedRef.current) {
        return;
      }

      setIsPlaying(true);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);


  /* ------------------------------------------------
     PLAY / RESUME
  ------------------------------------------------ */

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    /*
     * Agar speech paused hai to resume karo.
     */
    if (isPaused) {
      stoppedRef.current = false;

      window.speechSynthesis.resume();

      setIsPlaying(true);
      setIsPaused(false);

      return;
    }

    /*
     * Agar article pehle complete ho chuka hai,
     * Play dabane par beginning se start karo.
     */
    if (isFinished) {
      currentChunkRef.current = 0;
      setIsFinished(false);
    }

    /*
     * Article element find karo.
     */
    const article = document.getElementById(contentId);

    if (!article) {
      console.error(
        `BlogTTS: Article element "#${contentId}" nahi mila.`
      );

      return;
    }

    /*
     * First time article content read karo.
     */
    if (chunksRef.current.length === 0) {
      const chunks = createSpeechChunks(article);

      if (chunks.length === 0) {
        console.error(
          "BlogTTS: Article me readable text nahi mila."
        );

        return;
      }

      chunksRef.current = chunks;
      currentChunkRef.current = 0;
    }

    /*
     * Agar speech engine already kuch bol raha hai,
     * pehle cancel karo.
     */
    window.speechSynthesis.cancel();

    stoppedRef.current = false;

    setIsPlaying(true);
    setIsPaused(false);
    setIsFinished(false);

    /*
     * Mobile browser me cancel ke turant baad speak kabhi-kabhi
     * ignore ho sakta hai, isliye small delay.
     */
    window.setTimeout(() => {
      if (!stoppedRef.current) {
        speakCurrentChunk();
      }
    }, 50);
  }, [
    contentId,
    isFinished,
    isPaused,
    speakCurrentChunk,
  ]);


  /* ------------------------------------------------
     PAUSE
  ------------------------------------------------ */

  const handlePause = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.pause();

    setIsPlaying(false);
    setIsPaused(true);
  }, []);


  /* ------------------------------------------------
     CLEANUP
  ------------------------------------------------ */

  useEffect(() => {
    mountedRef.current = true;

    /*
     * Voices load hone ke baad browser ki voice list
     * available ho sakti hai.
     */
    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        handleVoicesChanged
      );
    }

    return () => {
      mountedRef.current = false;
      stoppedRef.current = true;

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );
      }
    };
  }, []);


  /* ------------------------------------------------
     RESET WHEN BLOG CHANGES
  ------------------------------------------------ */

  useEffect(() => {
    /*
     * Naya blog open hone par previous speech data clear.
     */
    chunksRef.current = [];
    currentChunkRef.current = 0;

    stoppedRef.current = true;

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(false);
    setIsPaused(false);
    setIsFinished(false);
  }, [contentId]);


  /* ------------------------------------------------
     UI
  ------------------------------------------------ */

  return (
    <div
      data-blog-tts
      className="my-6 w-full"
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          rounded-2xl
          border
          border-gray-200
          bg-white
          px-4
          py-3
          shadow-sm
          dark:border-gray-700
          dark:bg-gray-900
        "
      >
        {/* LEFT SIDE */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gray-100
              dark:bg-gray-800
            "
          >
            <Volume2
              size={20}
              strokeWidth={2}
              className="text-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              Listen to this article
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isFinished
                ? "Article finished"
                : isPaused
                ? "Paused"
                : isPlaying
                ? "Reading article..."
                : "Listen at a comfortable speed"}
            </p>
          </div>
        </div>


        {/* RIGHT SIDE BUTTONS */}
        <div className="flex shrink-0 items-center gap-2">

          {/* PLAY / RESUME */}
          {!isPlaying && (
            <button
              type="button"
              onClick={handlePlay}
              aria-label={
                isPaused
                  ? "Resume article"
                  : "Play article"
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black
                text-white
                transition
                hover:scale-105
                hover:bg-gray-800
                active:scale-95
                dark:bg-white
                dark:text-black
                dark:hover:bg-gray-200
              "
            >
              <Play
                size={18}
                fill="currentColor"
                strokeWidth={2}
              />
            </button>
          )}

          {/* PAUSE */}
          {isPlaying && (
            <button
              type="button"
              onClick={handlePause}
              aria-label="Pause article"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black
                text-white
                transition
                hover:scale-105
                hover:bg-gray-800
                active:scale-95
                dark:bg-white
                dark:text-black
                dark:hover:bg-gray-200
              "
            >
              <Pause
                size={18}
                fill="currentColor"
                strokeWidth={2}
              />
            </button>
          )}

          {/* STOP */}
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={stopSpeech}
              aria-label="Stop article"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-gray-300
                bg-white
                text-gray-700
                transition
                hover:scale-105
                hover:bg-gray-100
                active:scale-95
                dark:border-gray-600
                dark:bg-gray-900
                dark:text-gray-200
                dark:hover:bg-gray-800
              "
            >
              <Square
                size={15}
                fill="currentColor"
                strokeWidth={2}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
