import { supabase } from "@/lib/supabase";

export async function getCourses(signal) {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      institution,
      description,
      status,
      workload_hours,
      completed_at,
      certificate_image_url,
      sort_order
    `,
    )
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .abortSignal(signal);

  if (error) throw error;

  return data ?? [];
}
