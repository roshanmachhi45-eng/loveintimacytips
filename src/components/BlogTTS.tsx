import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Pause,
  Play,
  Square,
  Volume2,
} from 'lucide-react';

interface BlogTTSProps {
  contentId?: string;
}

/*
 * =========================================================
 * SETTINGS
 * =========================================================
 */

const DEFAULT_CONTENT_ID = 'blog-article-content';

/*
 * Fixed reading speed.
 *
 * User ko manual speed control nahi diya gaya.
 * 0.92 browser ki normal voice se thoda comfortable
 * aur natural reading speed deta hai.
 */

const SPEECH_RATE = 0.92;
const SPEECH_PITCH = 1;
const SPEECH_VOLUME = 1;

/*
 * Mobile browsers mein bahut lambi SpeechSynthesisUtterance
 * kabhi-kabhi pause/resume ke baad stuck ho jati hai.
 *
 * Isliye article ko small chunks mein read karenge.
 */

const MAX_CHUNK_LENGTH = 220;

/*
 * Android/browser mein kabhi-kabhi speech boundary event
 * late aata hai. Isliye current position ko safely track
 * karne ke liye ye values use hongi.
 */

interface SpeechChunk {
  text: string;
}

/*
 * =========================================================
 * TEXT CLEANING
 * =========================================================
 */

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

/*
 * =========================================================
 * CREATE SPEECH CHUNKS
 * =========================================================
 */

function createSpeechChunks(
  article: HTMLElement
): SpeechChunk[] {
  /*
   * Article ka clone banaya ja raha hai.
   *
   * Original website DOM ko touch nahi karna.
   */

  const clone =
    article.cloneNode(true) as HTMLElement;

  /*
   * TTS ko in elements ko kabhi nahi padhna chahiye.
   */

  clone
    .querySelectorAll(
      'script, style, button, nav, aside, form, input, textarea, select'
    )
    .forEach((element) => {
      element.remove();
    });

  /*
   * Article ke andar se actual readable text.
   */

  const rawText =
    clone.innerText ||
    clone.textContent ||
    '';

  const text = cleanText(rawText);

  if (!text) {
    return [];
  }

  /*
   * Pehle sentences ke around split karne ki koshish.
   *
   * Isse voice zyada natural lagegi.
   */

  const sentences =
    text.match(
      /[^.!?]+[.!?]+|[^.!?]+$/g
    ) || [text];

  const chunks: SpeechChunk[] = [];

  let current = '';

  for (const sentence of sentences) {
    const cleanSentence =
      cleanText(sentence);

    if (!cleanSentence) {
      continue;
    }

    /*
     * Agar current chunk mein sentence add karne se
     * maximum length cross nahi hoti,
     * to same chunk mein rakho.
     */

    if (
      current.length > 0 &&
      current.length +
        cleanSentence.length +
        1 <=
        MAX_CHUNK_LENGTH
    ) {
      current =
        `${current} ${cleanSentence}`;

      continue;
    }

    /*
     * Current chunk save karo.
     */

    if (current) {
      chunks.push({
        text: current,
      });
    }

    /*
     * Bahut bada sentence ho to usko words ke basis par
     * smaller chunks mein tod do.
     */

    if (
      cleanSentence.length >
      MAX_CHUNK_LENGTH
    ) {
      const words =
        cleanSentence.split(/\s+/);

      let wordChunk = '';

      for (const word of words) {
        if (
          wordChunk &&
          wordChunk.length +
            word.length +
            1 >
            MAX_CHUNK_LENGTH
        ) {
          chunks.push({
            text: wordChunk,
          });

          wordChunk = word;
        } else {
          wordChunk = wordChunk
            ? `${wordChunk} ${word}`
            : word;
        }
      }

      current = wordChunk;
    } else {
      current = cleanSentence;
    }
  }

  if (current) {
    chunks.push({
      text: current,
    });
  }

  return chunks;
}

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function BlogTTS({
  contentId = DEFAULT_CONTENT_ID,
}: BlogTTSProps) {
  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [isSupported, setIsSupported] =
    useState(true);

  /*
   * Speech chunks.
   */

  const chunksRef =
    useRef<SpeechChunk[]>([]);

  /*
   * Current chunk index.
   */

  const currentChunkRef =
    useRef(0);

  /*
   * Current character position inside current chunk.
   *
   * speechSynthesis.pause() par depend nahi karenge.
   * Pause par utterance cancel karke isi position se
   * dobara start karenge.
   */

  const currentCharRef =
    useRef(0);

  /*
   * Current utterance.
   */

  const utteranceRef =
    useRef<
      SpeechSynthesisUtterance | null
    >(null);

  /*
   * User ne intentionally speech cancel ki ya nahi.
   */

  const cancellingRef =
    useRef(false);

  /*
   * Resume operation already scheduled hai ya nahi.
   */

  const startingRef =
    useRef(false);

  /*
   * Component mounted hai ya nahi.
   */

  const mountedRef =
    useRef(true);

  /*
   * =======================================================
   * BROWSER SUPPORT
   * =======================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance ===
        'undefined'
    ) {
      setIsSupported(false);
    }

    return () => {
      mountedRef.current = false;

      cancellingRef.current = true;

      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        window.speechSynthesis.cancel();
      }

      utteranceRef.current = null;
    };
  }, []);

  /*
   * =======================================================
   * GET VOICE
   * =======================================================
   */

  const getPreferredVoice =
    useCallback(
      (): SpeechSynthesisVoice | null => {
        if (
          typeof window === 'undefined' ||
          !('speechSynthesis' in window)
        ) {
          return null;
        }

        const voices =
          window.speechSynthesis.getVoices();

        if (!voices.length) {
          return null;
        }

        /*
         * English voice ko preference.
         */

        const englishVoice =
          voices.find((voice) =>
            /^en[-_]/i.test(voice.lang)
          );

        if (englishVoice) {
          return englishVoice;
        }

        /*
         * Agar English voice available nahi hai,
         * browser ki default voice.
         */

        return (
          voices.find(
            (voice) => voice.default
          ) ||
          voices[0] ||
          null
        );
      },
      []
    );

  /*
   * =======================================================
   * LOAD ARTICLE
   * =======================================================
   */

  const loadArticleChunks =
    useCallback((): boolean => {
      const article =
        document.getElementById(contentId);

      if (!article) {
        console.warn(
          'Blog TTS article container not found:',
          contentId
        );

        return false;
      }

      const chunks =
        createSpeechChunks(article);

      if (!chunks.length) {
        console.warn(
          'Blog TTS: no readable article text found.'
        );

        return false;
      }

      chunksRef.current = chunks;

      currentChunkRef.current = 0;

      currentCharRef.current = 0;

      return true;
    }, [contentId]);

  /*
   * =======================================================
   * FINISH SPEECH
   * =======================================================
   */

  const finishSpeech =
    useCallback(() => {
      if (!mountedRef.current) {
        return;
      }

      setIsPlaying(false);

      setIsPaused(false);

      currentChunkRef.current = 0;

      currentCharRef.current = 0;

      utteranceRef.current = null;
    }, []);

  /*
   * =======================================================
   * SPEAK CURRENT CHUNK
   * =======================================================
   */

  const speakCurrentChunk =
    useCallback(() => {
      if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window) ||
        typeof SpeechSynthesisUtterance ===
          'undefined'
      ) {
        return;
      }

      if (startingRef.current) {
        return;
      }

      const chunks =
        chunksRef.current;

      const chunkIndex =
        currentChunkRef.current;

      if (
        chunkIndex < 0 ||
        chunkIndex >= chunks.length
      ) {
        finishSpeech();
        return;
      }

      startingRef.current = true;

      /*
       * Previous speech ko completely clear karo.
       */

      window.speechSynthesis.cancel();

      const fullText =
        chunks[chunkIndex].text;

      const startPosition =
        Math.max(
          0,
          Math.min(
            currentCharRef.current,
            fullText.length
          )
        );

      const remainingText =
        fullText
          .slice(startPosition)
          .trim();

      /*
       * Agar current chunk ka text finish ho chuka hai,
       * next chunk par chale jao.
       */

      if (!remainingText) {
        currentChunkRef.current += 1;

        currentCharRef.current = 0;

        startingRef.current = false;

        window.setTimeout(() => {
          speakCurrentChunk();
        }, 30);

        return;
      }

      const utterance =
        new SpeechSynthesisUtterance(
          remainingText
        );

      utterance.rate =
        SPEECH_RATE;

      utterance.pitch =
        SPEECH_PITCH;

      utterance.volume =
        SPEECH_VOLUME;

      const voice =
        getPreferredVoice();

      if (voice) {
        utterance.voice = voice;
      }

      /*
       * Boundary event se exact reading position
       * track karte hain.
       */

      utterance.onboundary =
        (event) => {
          if (
            event.name === 'word' ||
            event.name === 'sentence'
          ) {
            currentCharRef.current =
              startPosition +
              Math.max(
                0,
                event.charIndex || 0
              );
          }
        };

      utterance.onstart = () => {
        startingRef.current = false;

        if (!mountedRef.current) {
          return;
        }

        setIsPlaying(true);

        setIsPaused(false);
      };

      utterance.onend = () => {
        startingRef.current = false;

        /*
         * Agar ye intentional cancel tha,
         * to next chunk automatically mat chalao.
         */

        if (cancellingRef.current) {
          cancellingRef.current = false;
          return;
        }

        /*
         * Current chunk complete.
         */

        currentChunkRef.current += 1;

        currentCharRef.current = 0;

        if (
          currentChunkRef.current >=
          chunksRef.current.length
        ) {
          finishSpeech();
          return;
        }

        /*
         * Next chunk.
         */

        window.setTimeout(() => {
          speakCurrentChunk();
        }, 30);
      };

      utterance.onerror = (
        event
      ) => {
        startingRef.current = false;

        /*
         * Intentional cancel ko error mat samjho.
         */

        if (
          cancellingRef.current &&
          event.error === 'canceled'
        ) {
          cancellingRef.current = false;
          return;
        }

        console.warn(
          'Blog TTS speech error:',
          event.error
        );

        if (mountedRef.current) {
          setIsPlaying(false);
          setIsPaused(false);
        }
      };

      utteranceRef.current =
        utterance;

      /*
       * New speech start.
       */

      window.speechSynthesis.speak(
        utterance
      );
    }, [
      finishSpeech,
      getPreferredVoice,
    ]);

  /*
   * =======================================================
   * PLAY / RESUME
   * =======================================================
   */

  const handlePlay =
    useCallback(() => {
      if (!isSupported) {
        return;
      }

      /*
       * First play.
       */

      if (
        !chunksRef.current.length
      ) {
        const loaded =
          loadArticleChunks();

        if (!loaded) {
          return;
        }
      }

      /*
       * Resume.
       *
       * Browser pause/resume use nahi kar rahe.
       * Current character position se fresh utterance
       * create hoti hai.
       */

      cancellingRef.current = false;

      setIsPaused(false);

      setIsPlaying(true);

      speakCurrentChunk();
    }, [
      isSupported,
      loadArticleChunks,
      speakCurrentChunk,
    ]);

  /*
   * =======================================================
   * PAUSE
   * =======================================================
   */

  const handlePause =
    useCallback(() => {
      if (
        typeof window === 'undefined' ||
        !(
          'speechSynthesis' in window
        )
      ) {
        return;
      }

      /*
       * Current utterance ko cancel karenge.
       *
       * speechSynthesis.pause() ki jagah cancel use
       * karne se Android ke stuck-resume issue se bachenge.
       *
       * Current character position already onboundary
       * se save ho chuki hai.
       */

      cancellingRef.current = true;

      window.speechSynthesis.cancel();

      startingRef.current = false;

      setIsPlaying(false);

      setIsPaused(true);
    }, []);

  /*
   * =======================================================
   * STOP
   * =======================================================
   */

  const handleStop =
    useCallback(() => {
      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        cancellingRef.current = true;

        window.speechSynthesis.cancel();
      }

      startingRef.current = false;

      currentChunkRef.current = 0;

      currentCharRef.current = 0;

      setIsPlaying(false);

      setIsPaused(false);

      utteranceRef.current = null;
    }, []);

  /*
   * =======================================================
   * RESET WHEN BLOG CHANGES
   * =======================================================
   */

  useEffect(() => {
    /*
     * Blog slug change hone par old speech
     * ko completely stop.
     */

    handleStop();
  }, [
    contentId,
    handleStop,
  ]);

  /*
   * =======================================================
   * UI
   * =======================================================
   */

  if (!isSupported) {
    return null;
  }

  return (
    
<div
  className="
    blog-tts
    inline-flex
    w-fit
    max-w-full
    items-center
    gap-2
    rounded-2xl
    bg-gradient-to-r
    from-rose-500
    to-pink-500
    px-3
    py-2
    text-white
    shadow-lg
    shadow-rose-200/70
  "
  aria-label="Listen to this article"
>

      {/* SOUND ICON */}

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white/20
        "
        aria-hidden="true"
      >
        <Volume2 className="h-4 w-4" />
      </div>

      {/* TITLE / STATUS */}

      <div className="min-w-0 pr-1">
        <p
          className="
            whitespace-nowrap
            text-xs
            font-semibold
            leading-4
            text-white
          "
        >
          Listen to this article
        </p>

        <p
          className="
            text-[10px]
            leading-3
            text-white/80
          "
        >
          {isPlaying
            ? 'Playing'
            : isPaused
            ? 'Paused'
            : 'Ready'}
        </p>
      </div>

      {/* PLAY / PAUSE */}

      {isPlaying ? (
        <button
          type="button"
          onClick={handlePause}
          aria-label="Pause article"
          title="Pause"
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            text-rose-600
            shadow-sm
            transition-all
            duration-200
            hover:scale-105
            hover:bg-rose-50
            active:scale-95
          "
        >
          <Pause
            className="h-4 w-4"
            fill="currentColor"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={
            isPaused
              ? 'Resume article'
              : 'Play article'
          }
          title={
            isPaused
              ? 'Resume'
              : 'Play'
          }
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-white
            text-rose-600
            shadow-sm
            transition-all
            duration-200
            hover:scale-105
            hover:bg-rose-50
            active:scale-95
          "
        >
          <Play
            className="
              ml-0.5
              h-4
              w-4
            "
            fill="currentColor"
          />
        </button>
      )}

      {/* STOP */}

      {(isPlaying || isPaused) && (
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop article"
          title="Stop"
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-white/15
            text-white
            transition-all
            duration-200
            hover:bg-white/25
            active:scale-95
          "
        >
          <Square
            className="h-3.5 w-3.5"
            fill="currentColor"
          />
        </button>
      )}
    </div>
  );
    }
        
