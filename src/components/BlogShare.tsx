"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Facebook,
  Link as LinkIcon,
  MoreHorizontal,
  Share2,
  X,
} from "lucide-react";

interface BlogShareProps {
  title?: string;
}

interface ShareItem {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  className: string;
}

export default function BlogShare({
  title = "Loveons.com",
}: BlogShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  };

  const getShareTitle = () => {
    if (typeof document !== "undefined" && document.title) {
      return document.title;
    }

    return title;
  };

  const copyLink = async () => {
    const url = getShareUrl();

    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      try {
        const textArea = document.createElement("textarea");

        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand("copy");

        document.body.removeChild(textArea);

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        // Clipboard is unavailable.
      }
    }
  };

  const nativeShare = async () => {
    const url = getShareUrl();
    const shareTitle = getShareTitle();

    if (!url) return;

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: shareTitle,
          text: "Read this article on Loveons.com",
          url,
        });
      } catch {
        // User cancelled the native share sheet.
      }

      return;
    }

    await copyLink();
  };

  const shareWhatsApp = () => {
    const url = getShareUrl();
    const shareTitle = getShareTitle();

    if (!url) return;

    const text = `${shareTitle}\n\n${url}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareFacebook = () => {
    const url = getShareUrl();

    if (!url) return;

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  };

  const shareX = () => {
    const url = getShareUrl();
    const shareTitle = getShareTitle();

    if (!url) return;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareTitle
      )}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  };

  const shareTelegram = () => {
    const url = getShareUrl();
    const shareTitle = getShareTitle();

    if (!url) return;

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareItems: ShareItem[] = [
    {
      name: "WhatsApp",
      icon: (
        <span className="text-[15px] font-bold leading-none">
          WA
        </span>
      ),
      action: shareWhatsApp,
      className:
        "bg-[#25D366] text-white hover:bg-[#20bd5c]",
    },
    {
      name: "Facebook",
      icon: (
        <Facebook
          className="h-5 w-5"
          strokeWidth={2.5}
        />
      ),
      action: shareFacebook,
      className:
        "bg-[#1877F2] text-white hover:bg-[#1265d1]",
    },
    {
      name: "X",
      icon: (
        <X
          className="h-5 w-5"
          strokeWidth={2.5}
        />
      ),
      action: shareX,
      className:
        "bg-black text-white hover:bg-gray-900",
    },
    {
      name: "Telegram",
      icon: (
        <span className="text-[17px] font-bold leading-none">
          ➤
        </span>
      ),
      action: shareTelegram,
      className:
        "bg-[#229ED9] text-white hover:bg-[#1d8fc5]",
    },
  ];

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="relative my-5 flex justify-start"
    >
      {/* Main Share Button */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-transparent
          bg-gradient-to-r
          from-rose-500
          to-pink-500
          px-5
          py-2.5
          text-sm
          font-semibold
          text-white
          shadow-md
          shadow-pink-200/70
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:from-rose-600
          hover:to-pink-600
          hover:shadow-lg
          hover:shadow-pink-300/70
          active:translate-y-0
          active:scale-[0.98]
        "
      >
        <Share2
          className="h-4 w-4"
          strokeWidth={2.3}
        />

        <span>Share Article</span>
      </button>

      {/* Share Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Share this article"
          className="
            absolute
            left-0
            top-full
            z-50
            mt-3
            w-[min(92vw,360px)]
            overflow-hidden
            rounded-2xl
            border
            border-pink-100
            bg-white
            p-4
            shadow-xl
            shadow-pink-100/40
            dark:border-pink-900/40
            dark:bg-gray-950
            dark:shadow-black/30
          "
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-pink-500
                    to-purple-600
                    text-white
                  "
                >
                  <Share2 className="h-4 w-4" />
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Share this article
                </h3>
              </div>

              <p className="mt-1 pl-10 text-xs text-gray-500 dark:text-gray-400">
                Share it with friends or save the link.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close share menu"
              className="
                rounded-full
                p-1.5
                text-gray-400
                transition
                hover:bg-gray-100
                hover:text-gray-700
                dark:hover:bg-gray-800
                dark:hover:text-gray-200
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Social Platforms */}
          <div className="grid grid-cols-2 gap-2.5">
            {shareItems.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  item.action();
                  setOpen(false);
                }}
                className={`
                  flex
                  min-h-[48px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-3
                  text-sm
                  font-semibold
                  transition
                  active:scale-[0.98]
                  ${item.className}
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Native Mobile Share */}
          <button
            type="button"
            onClick={nativeShare}
            className="
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-pink-200
              bg-gradient-to-r
              from-pink-600
              to-purple-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:from-pink-700
              hover:to-purple-700
              active:scale-[0.98]
              dark:border-pink-900/40
            "
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More sharing options</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={copyLink}
            className="
              mt-2
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-pink-50
              hover:text-pink-700
              active:scale-[0.98]
              dark:text-gray-300
              dark:hover:bg-pink-950/30
              dark:hover:text-pink-300
            "
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span>Link copied</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Current URL */}
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <LinkIcon className="h-3 w-3" />

            <span className="max-w-[260px] truncate">
              {typeof window !== "undefined"
                ? window.location.href
                : "Article link"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
