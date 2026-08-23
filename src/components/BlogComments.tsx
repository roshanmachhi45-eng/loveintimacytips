
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
      className="
        mt-8
        rounded-2xl
        border
        border-pink-100
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >
      {/* Comments Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-pink-500
              text-white
            "
          >
            <MessageCircle className="h-4 w-4" />
          </div>

          <div>
            <h2
              id="blog-comments-heading"
              className="text-lg font-bold text-pink-600"
            >
              Comments
            </h2>

            <p className="text-xs text-gray-500">
              Share your thoughts about this article.
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="comment-name"
            className="
              mb-1
              block
              text-xs
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
                h-4
                w-4
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
                rounded-lg
                border
                border-pink-100
                bg-white
                py-2.5
                pl-9
                pr-3
                text-sm
                text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-pink-400
                focus:ring-2
                focus:ring-pink-100
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          <div className="mt-0.5 text-right text-[10px] text-gray-400">
            {name.length}/80
          </div>
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment-text"
            className="
              mb-1
              block
              text-xs
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
            rows={4}
            disabled={submitting}
            className="
              w-full
              resize-y
              rounded-lg
              border
              border-pink-100
              bg-white
              px-3
              py-2.5
              text-sm
              leading-5
              text-gray-800
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-pink-400
              focus:ring-2
              focus:ring-pink-100
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <div className="mt-0.5 text-right text-[10px] text-gray-400">
            {comment.length}/2000
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div
            role="alert"
            className="
              flex
              items-start
              gap-2
              rounded-lg
              border
              border-red-100
              bg-red-50
              px-3
              py-2.5
              text-xs
              text-red-700
            "
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div
            role="status"
            className="
              flex
              items-start
              gap-2
              rounded-lg
              border
              border-green-100
              bg-green-50
              px-3
              py-2.5
              text-xs
              text-green-700
            "
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-1.5
            rounded-lg
            bg-pink-500
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-pink-600
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
      <div className="my-5 h-px bg-pink-100" />

      {/* Comments List */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-pink-600">
            {comments.length > 0
              ? `${comments.length} ${
                  comments.length === 1
                    ? "Comment"
                    : "Comments"
                }`
              : "Comments"}
          </h3>
        </div>

        {/* Loading */}
        {loadingComments ? (
          <div
            className="
              flex
              items-center
              justify-center
              py-6
              text-xs
              text-gray-500
            "
          >
            <Loader2
              className="
                mr-2
                h-4
                w-4
                animate-spin
                text-pink-500
              "
            />

            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          /* Empty State */
          <div
            className="
              rounded-lg
              border
              border-dashed
              border-pink-100
              bg-pink-50/30
              px-4
              py-6
              text-center
            "
          >
            <MessageCircle
              className="
                mx-auto
                mb-2
                h-6
                w-6
                text-pink-200
              "
            />

            <p className="text-xs font-medium text-gray-600">
              No comments yet.
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              Be the first to share your thoughts.
            </p>
          </div>
        ) : (
          /* Comments */
          <div className="space-y-2.5">
            {comments.map((item) => (
              <article
                key={item.id}
                className="
                  rounded-lg
                  border
                  border-pink-100
                  bg-white
                  p-3
                "
              >
                <div className="flex items-start gap-2.5">
                  {/* User Initial */}
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-pink-100
                      text-xs
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
                      <h4 className="text-xs font-semibold text-gray-800">
                        {item.name}
                      </h4>

                      <span className="text-[10px] text-gray-400">
                        {formatCommentDate(
                          item.created_at
                        )}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1.5
                        whitespace-pre-wrap
                        break-words
                        text-xs
                        leading-5
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
