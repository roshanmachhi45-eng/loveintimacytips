"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
  User,
} from "lucide-react";

import {
  BlogComment,
  fetchComments,
  submitComment,
} from "../lib/commentsApi";

interface BlogCommentsProps {
  articleSlug: string;
}

export default function BlogComments({
  articleSlug,
}: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadComments = async () => {
    if (!articleSlug) {
      setLoadingComments(false);
      return;
    }

    try {
      setLoadingComments(true);
      setErrorMessage("");

      const data = await fetchComments(articleSlug);

      setComments(data);
    } catch (error) {
      console.error("Comments loading error:", error);

      setErrorMessage(
        "Comments could not be loaded right now."
      );
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [articleSlug]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!trimmedComment) {
      setErrorMessage("Please write a comment.");
      return;
    }

    if (trimmedName.length > 80) {
      setErrorMessage(
        "Name must be 80 characters or less."
      );
      return;
    }

    if (trimmedComment.length > 2000) {
      setErrorMessage(
        "Comment must be 2000 characters or less."
      );
      return;
    }

    try {
      setSubmitting(true);

      await submitComment({
        articleSlug,
        name: trimmedName,
        comment: trimmedComment,
      });

      setName("");
      setComment("");

      setSuccessMessage(
        "Your comment has been submitted for review."
      );

      await loadComments();
    } catch (error) {
      console.error(
        "Comment submission error:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="blog-comments-heading"
      className="
        mt-7
        rounded-2xl
        border
        border-pink-100
        bg-white
        p-3
        shadow-sm
        shadow-pink-100/50
        sm:p-4
      "
    >
      {/* COMMENTS HEADER */}

      <div className="mb-3 flex items-center gap-2">
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-pink-500
            text-white
            shadow-sm
          "
        >
          <MessageCircle className="h-4 w-4" />
        </div>

        <div>
          <h2
            id="blog-comments-heading"
            className="
              text-base
              font-bold
              text-pink-600
            "
          >
            Comments
          </h2>

          <p className="text-[11px] text-gray-500">
            Share your thoughts about this article.
          </p>
        </div>
      </div>

      {/* COMMENT FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-2.5"
      >
        {/* NAME */}

        <div>
          <label
            htmlFor="comment-name"
            className="
              mb-1
              block
              text-[11px]
              font-semibold
              text-gray-700
            "
          >
            Your Name
          </label>

          <div className="relative">
            <User
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-3.5
                w-3.5
                -translate-y-1/2
                text-pink-400
              "
            />

            <input
              id="comment-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              maxLength={80}
              disabled={submitting}
              className="
                w-full
                rounded-xl
                border
                border-pink-100
                bg-pink-50/30
                py-2
                pl-9
                pr-3
                text-xs
                text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-pink-400
                focus:bg-white
                focus:ring-2
                focus:ring-pink-100
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          <div className="mt-0.5 text-right text-[9px] text-gray-400">
            {name.length}/80
          </div>
        </div>

        {/* COMMENT */}

        <div>
          <label
            htmlFor="comment-text"
            className="
              mb-1
              block
              text-[11px]
              font-semibold
              text-gray-700
            "
          >
            Your Comment
          </label>

          <textarea
            id="comment-text"
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            placeholder="Write your comment here..."
            maxLength={2000}
            rows={3}
            disabled={submitting}
            className="
              w-full
              resize-y
              rounded-xl
              border
              border-pink-100
              bg-pink-50/30
              px-3
              py-2
              text-xs
              leading-5
              text-gray-800
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-pink-400
              focus:bg-white
              focus:ring-2
              focus:ring-pink-100
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <div className="mt-0.5 text-right text-[9px] text-gray-400">
            {comment.length}/2000
          </div>
        </div>

        {/* ERROR */}

        {errorMessage && (
          <div
            role="alert"
            className="
              flex
              items-start
              gap-2
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-3
              py-2
              text-[11px]
              text-red-700
            "
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div
            role="status"
            className="
              flex
              items-start
              gap-2
              rounded-xl
              border
              border-green-100
              bg-green-50
              px-3
              py-2
              text-[11px]
              text-green-700
            "
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <span>{successMessage}</span>
          </div>
        )}

        {/* SUBMIT BUTTON */}

        <button
          type="submit"
          disabled={submitting}
          className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-pink-500
            px-4
            py-2
            text-xs
            font-semibold
            text-white
            shadow-sm
            shadow-pink-200/70
            transition-all
            duration-200
            hover:bg-pink-600
            hover:shadow-md
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Post Comment</span>
            </>
          )}
        </button>
      </form>

      {/* DIVIDER */}

      <div className="my-4 h-px bg-pink-100" />

      {/* COMMENTS LIST */}

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-xs font-bold text-pink-600">
            {comments.length > 0
              ? `${comments.length} ${
                  comments.length === 1
                    ? "Comment"
                    : "Comments"
                }`
              : "Comments"}
          </h3>
        </div>

        {/* LOADING */}

        {loadingComments ? (
          <div
            className="
              flex
              items-center
              justify-center
              py-5
              text-[11px]
              text-gray-500
            "
          >
            <Loader2
              className="
                mr-2
                h-3.5
                w-3.5
                animate-spin
                text-pink-500
              "
            />

            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          /* EMPTY STATE */

          <div
            className="
              rounded-xl
              border
              border-dashed
              border-pink-100
              bg-pink-50/40
              px-3
              py-5
              text-center
            "
          >
            <MessageCircle
              className="
                mx-auto
                mb-1.5
                h-5
                w-5
                text-pink-300
              "
            />

            <p className="text-xs font-medium text-gray-600">
              No comments yet.
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              Be the first to share your thoughts.
            </p>
          </div>
        ) : (
          /* COMMENTS */

          <div className="space-y-2">
            {comments.map((item) => (
              <article
                key={item.id}
                className="
                  rounded-xl
                  border
                  border-pink-100
                  bg-pink-50/20
                  p-2.5
                  transition
                  hover:border-pink-200
                  hover:bg-pink-50/40
                "
              >
                <div className="flex items-start gap-2">
                  {/* USER INITIAL */}

                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-pink-100
                      text-[10px]
                      font-bold
                      text-pink-600
                    "
                  >
                    {item.name
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-x-2
                        gap-y-0.5
                      "
                    >
                      <h4 className="text-[11px] font-semibold text-gray-800">
                        {item.name}
                      </h4>

                      <span className="text-[9px] text-gray-400">
                        {formatCommentDate(
                          item.created_at
                        )}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1
                        whitespace-pre-wrap
                        break-words
                        text-[11px]
                        leading-4
                        text-gray-600
                      "
                    >
                      {item.comment}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function formatCommentDate(
  dateString: string
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
              }
