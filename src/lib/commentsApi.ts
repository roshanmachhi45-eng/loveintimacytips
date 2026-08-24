
import { supabase } from "./supabase";

export interface BlogComment {
  id: string;
  article_slug: string;
  name: string;
  comment: string;
  created_at: string;
  approved: boolean;
}

/**
 * Fetch only approved comments for a blog article.
 */
export async function fetchComments(
  articleSlug: string
): Promise<BlogComment[]> {
  const cleanSlug = articleSlug.trim();

  if (!cleanSlug) {
    return [];
  }

  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, article_slug, name, comment, created_at, approved"
    )
    .eq("article_slug", cleanSlug)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading comments:", error);
    throw new Error(
      error.message || "Comments could not be loaded."
    );
  }

  return (data ?? []) as BlogComment[];
}

/**
 * Submit a new comment.
 *
 * Every new comment is saved as approved = false.
 * It will appear publicly only after approval.
 */
export async function submitComment({
  articleSlug,
  name,
  comment,
}: {
  articleSlug: string;
  name: string;
  comment: string;
}): Promise<void> {
  const cleanSlug = articleSlug.trim();
  const cleanName = name.trim();
  const cleanComment = comment.trim();

  if (!cleanSlug) {
    throw new Error("Article information is missing.");
  }

  if (!cleanName) {
    throw new Error("Please enter your name.");
  }

  if (!cleanComment) {
    throw new Error("Please write a comment.");
  }

  if (cleanName.length > 80) {
    throw new Error("Name must be 80 characters or less.");
  }

  if (cleanComment.length > 2000) {
    throw new Error(
      "Comment must be 2000 characters or less."
    );
  }

  const { error } = await supabase
    .from("comments")
    .insert({
      article_slug: cleanSlug,
      name: cleanName,
      comment: cleanComment,
      approved: false,
    });

  if (error) {
    console.error("Error submitting comment:", error);

    throw new Error(
      error.message ||
        "Something went wrong. Please try again."
    );
  }
}
