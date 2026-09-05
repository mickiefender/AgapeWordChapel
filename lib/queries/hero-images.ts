import { createClient } from "@/lib/supabase/server";

export type HeroImage = {
  id: string;
  image_url: string;
  storage_path: string;
  title: string | null;
  duration_seconds: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export async function getHeroImages(): Promise<HeroImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_images")
    .select("id, image_url, storage_path, title, duration_seconds, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load hero images: ${error.message}`);
  return (data ?? []) as HeroImage[];
}

export async function getActiveHeroImages(): Promise<HeroImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_images")
    .select("id, image_url, storage_path, title, duration_seconds, is_active, sort_order, created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load hero images: ${error.message}`);
  return (data ?? []) as HeroImage[];
}
