
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
    } catch (error) {
      console.error("Comment submission error:", error);

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
      className="mt-10 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm sm:p-6 dark:border-pink-900/40 dark:bg-gray-950"
    >
      {/* Heading */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div>
            <h2
              id="blog-comments-heading"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Comments
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share your thoughts about this article.
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="comment-name"
            className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Your Name
          </label>

          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

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
                border-gray-200
                bg-gray-50
                py-3
                pl-10
                pr-4
                text-sm
                text-gray-900
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-pink-400
                focus:bg-white
                focus:ring-2
                focus:ring-pink-100
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border-gray-800
                dark:bg-gray-900
                dark:text-white
                dark:focus:border-pink-600
                dark:focus:bg-gray-900
                dark:focus:ring-pink-900/30
              "
            />
          </div>

          <div className="mt-1 text-right text-[11px] text-gray-400">
            {name.length}/80
          </div>
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment-text"
            className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300"
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
            rows={5}
            disabled={submitting}
            className="
              w-full
              resize-y
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-3
              text-sm
              leading-6
              text-gray-900
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-pink-400
              focus:bg-white
              focus:ring-2
              focus:ring-pink-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-gray-800
              dark:bg-gray-900
              dark:text-white
              dark:focus:border-pink-600
              dark:focus:ring-pink-900/30
            "
          />

          <div className="mt-1 text-right text-[11px] text-gray-400">
            {comment.length}/2000
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 px-3.5 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-pink-600
            to-purple-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:from-pink-700
            hover:to-purple-700
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:w-auto
          "
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Post Comment</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 h-px bg-gray-100 dark:bg-gray-800" />

      {/* Comments List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {comments.length > 0
              ? `${comments.length} ${
                  comments.length === 1
                    ? "Comment"
                    : "Comments"
                }`
              : "Comments"}
          </h3>
        </div>

        {loadingComments ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
            <MessageCircle className="mx-auto mb-2 h-7 w-7 text-gray-300 dark:text-gray-600" />

            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No comments yet.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Be the first to share your thoughts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-sm font-bold text-pink-700 dark:from-pink-950/50 dark:to-purple-950/50 dark:text-pink-300">
                    {item.name
                      .trim()
                      .charAt(0)
                      .toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h4>

                      <span className="text-xs text-gray-400">
                        {formatCommentDate(
                          item.created_at
                        )}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600 dark:text-gray-300">
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
