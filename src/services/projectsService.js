import { supabase } from "@/lib/supabase";

export async function getProjects(signal) {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      slug,
      title,
      summary,
      description,
      technologies,
      cover_path,
      featured,
      sort_order
    `,
    )
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .abortSignal(signal);

  if (error) {
    throw error;
  }

  return data ?? [];
}
