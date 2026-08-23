
import { supabase } from "./supabase";

export interface BlogComment {
  id: string;
  article_slug: string;
  name: string;
  comment: string;
  created_at: string;
  approved: boolean;
}

export interface SubmitCommentInput {
  articleSlug: string;
  name: string;
  comment: string;
}

export async function fetchComments(
  articleSlug: string
): Promise<BlogComment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, article_slug, name, comment, created_at, approved"
    )
    .eq("article_slug", articleSlug)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch comments:", error);
    throw error;
  }

  return data ?? [];
}

export async function submitComment(
  input: SubmitCommentInput
): Promise<BlogComment> {
  const name = input.name.trim();
  const comment = input.comment.trim();
  const articleSlug = input.articleSlug.trim();

  if (!articleSlug) {
    throw new Error("Article slug is required.");
  }

  if (!name) {
    throw new Error("Name is required.");
  }

  if (!comment) {
    throw new Error("Comment is required.");
  }

  if (name.length > 80) {
    throw new Error("Name must be 80 characters or less.");
  }

  if (comment.length > 2000) {
    throw new Error("Comment must be 2000 characters or less.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      article_slug: articleSlug,
      name,
      comment,
      approved: false,
    })
    .select(
      "id, article_slug, name, comment, created_at, approved"
    )
    .single();

  if (error) {
    console.error("Failed to submit comment:", error);
    throw error;
  }

  return data;
}
