"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function productValues(formData: FormData) {
  return {
    slug: text(formData, "slug").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: text(formData, "name"),
    price_egp: Math.max(0, Number(text(formData, "price")) || 0),
    category: text(formData, "category"),
    gender: text(formData, "gender"),
    colors: text(formData, "colors").split(",").map((value) => value.trim()).filter(Boolean),
    short_description: text(formData, "shortDescription"),
    description: text(formData, "description"),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    archived: false,
    updated_at: new Date().toISOString(),
  };
}

async function replaceSizes(
  productId: string,
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const sizes = text(formData, "sizes")
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
  const unavailable = new Set(formData.getAll("unavailableSizes").map(String));

  await supabase.from("product_sizes").delete().eq("product_id", productId);
  if (sizes.length) {
    const { error } = await supabase.from("product_sizes").insert(
      sizes.map((size) => ({
        product_id: productId,
        size,
        available: !unavailable.has(size),
      })),
    );
    if (error) throw error;
  }
}

async function uploadImages(
  productId: string,
  productName: string,
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!files.length) return;

  const { count } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  for (const [index, file] of files.entries()) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Images must be JPG, PNG, or WebP.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Each image must be 5MB or smaller.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const { error: rowError } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: path,
      public_url: data.publicUrl,
      alt_text: productName,
      position: (count ?? 0) + index,
    });
    if (rowError) throw rowError;
  }
}

export async function saveProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const { supabase } = admin;
  const id = text(formData, "id");
  const values = productValues(formData);

  if (!values.name || !values.slug || !values.description) {
    throw new Error("Name, slug, and description are required.");
  }

  const query = id
    ? supabase.from("products").update(values).eq("id", id).select("id").single()
    : supabase.from("products").insert(values).select("id").single();
  const { data, error } = await query;
  if (error) throw error;

  await replaceSizes(data.id, formData, supabase);
  await uploadImages(data.id, values.name, formData, supabase);

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("imagePosition:")) {
      await supabase
        .from("product_images")
        .update({ position: Math.max(0, Number(value) || 0) })
        .eq("id", key.replace("imagePosition:", ""));
    }
  }

  for (const imageId of formData.getAll("removeImages").map(String)) {
    const { data: image } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("id", imageId)
      .single();
    if (image) {
      await supabase.storage.from("product-images").remove([image.storage_path]);
      await supabase.from("product_images").delete().eq("id", imageId);
    }
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${data.id}`);
  redirect("/admin/products");
}

export async function archiveProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const id = text(formData, "id");
  await admin.supabase
    .from("products")
    .update({ archived: true, published: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function restoreProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const id = text(formData, "id");
  await admin.supabase
    .from("products")
    .update({ archived: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function saveSettings(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const { error } = await admin.supabase
    .from("store_settings")
    .update({
      whatsapp_number: text(formData, "whatsappNumber").replace(/\D/g, ""),
      whatsapp_display_number: text(formData, "whatsappDisplayNumber"),
      instagram_url: text(formData, "instagramUrl"),
      tiktok_url: text(formData, "tiktokUrl"),
      email: text(formData, "email"),
      location: text(formData, "location"),
      support_hours: text(formData, "supportHours"),
      hero_eyebrow: text(formData, "heroEyebrow"),
      hero_title: text(formData, "heroTitle"),
      hero_description: text(formData, "heroDescription"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/contact");
  redirect("/admin/settings?saved=1");
}

export async function changeOwnerPassword(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const password = text(formData, "password");
  const confirmation = text(formData, "passwordConfirmation");

  if (password.length < 8 || password !== confirmation) {
    redirect("/admin/settings?passwordError=1");
  }

  const { error } = await admin.supabase.auth.updateUser({ password });
  if (error) redirect("/admin/settings?passwordError=1");
  redirect("/admin/settings?passwordChanged=1");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (error) redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
