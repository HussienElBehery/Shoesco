"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUSES } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/product";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function productValues(formData: FormData) {
  const category = text(formData, "category");
  const fit = text(formData, "fit");
  const width = text(formData, "width");
  if (!["Sneakers", "Running", "Shoe Care"].includes(category)) {
    throw new Error("Select a valid category.");
  }
  if (!["Narrow", "True to size", "Roomy"].includes(fit)) {
    throw new Error("Select a valid fit.");
  }
  if (!["Narrow", "Standard", "Wide"].includes(width)) {
    throw new Error("Select a valid width.");
  }
  return {
    slug: text(formData, "slug").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: text(formData, "name"),
    price_egp: Math.max(0, Number(text(formData, "price")) || 0),
    category,
    gender: text(formData, "gender"),
    colors: text(formData, "colors").split(",").map((value) => value.trim()).filter(Boolean),
    short_description: text(formData, "shortDescription"),
    description: text(formData, "description"),
    fit_note: text(formData, "fitNote"),
    fit,
    width,
    materials: text(formData, "materials"),
    care: text(formData, "care"),
    merchandising_label: text(formData, "merchandisingLabel"),
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
  let rows: { size: string; available: boolean }[] = [];
  try {
    rows = JSON.parse(text(formData, "sizeRows")) as typeof rows;
  } catch {
    throw new Error("Sizes could not be read.");
  }
  const sizes = rows
    .map((row) => ({ size: String(row.size).trim(), available: Boolean(row.available) }))
    .filter((row) => row.size);
  if (!sizes.length) throw new Error("Add at least one size.");
  if (new Set(sizes.map((row) => row.size)).size !== sizes.length) {
    throw new Error("Duplicate sizes are not allowed.");
  }

  const { error } = await supabase.rpc("replace_product_sizes", {
    p_product_id: productId,
    p_sizes: sizes,
  });
  if (error) throw error;
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

  const uploadedPaths: string[] = [];
  try {
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
      uploadedPaths.push(path);

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
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from("product-images").remove(uploadedPaths);
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId)
        .in("storage_path", uploadedPaths);
    }
    throw error;
  }
}

export async function saveProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const { supabase } = admin;
  const id = text(formData, "id");
  const values = productValues(formData);

  if (!values.name || !values.slug || !values.description || !values.short_description) {
    throw new Error("Name, slug, short description, and description are required.");
  }
  if (values.price_egp < 1) {
    throw new Error("Price must be greater than zero.");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    throw new Error("Slug must use lowercase letters, numbers, and hyphens.");
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
        .eq("id", key.replace("imagePosition:", ""))
        .eq("product_id", data.id);
    }
    if (key.startsWith("imageAlt:")) {
      await supabase
        .from("product_images")
        .update({ alt_text: String(value).trim() || values.name })
        .eq("id", key.replace("imageAlt:", ""))
        .eq("product_id", data.id);
    }
  }

  for (const imageId of formData.getAll("removeImages").map(String)) {
    const { data: image } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("id", imageId)
      .eq("product_id", data.id)
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
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin/products");
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
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteArchivedProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const id = text(formData, "id");

  const { data: product, error: productError } = await admin.supabase
    .from("products")
    .select("id, archived, product_images(storage_path)")
    .eq("id", id)
    .single();
  if (productError) throw productError;
  if (!product.archived) {
    redirect("/admin/products");
  }

  const storagePaths = product.product_images
    .map((image) => image.storage_path)
    .filter((path) => path && !path.startsWith("/images/"));
  if (storagePaths.length) {
    const { error: removeError } = await admin.supabase.storage
      .from("product-images")
      .remove(storagePaths);
    if (removeError) throw removeError;
  }

  const { error: deleteError } = await admin.supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("archived", true);
  if (deleteError) throw deleteError;

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function saveSettings(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const replyTemplate = text(formData, "orderReplyTemplate");
  if (!replyTemplate || replyTemplate.length > 1000) {
    throw new Error("The WhatsApp reply template must be between 1 and 1000 characters.");
  }
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
      delivery_note: text(formData, "deliveryNote"),
      returns_note: text(formData, "returnsNote"),
      size_guide_note: text(formData, "sizeGuideNote"),
      order_reply_enabled: formData.get("orderReplyEnabled") === "on",
      order_reply_template: replyTemplate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function updateOrder(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const id = text(formData, "id");
  const status = text(formData, "status") as OrderStatus;
  const internalNotes = text(formData, "internalNotes");
  if (!ORDER_STATUSES.includes(status) || internalNotes.length > 1000) {
    throw new Error("Invalid order update.");
  }

  const { data: current, error: readError } = await admin.supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();
  if (readError) throw readError;

  const { error } = await admin.supabase
    .from("orders")
    .update({
      status,
      internal_notes: internalNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;

  if (current.status !== status) {
    const { error: eventError } = await admin.supabase
      .from("order_events")
      .insert({
        order_id: id,
        event_type: "status_changed",
        description: `Status changed from ${current.status} to ${status}.`,
      });
    if (eventError) throw eventError;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?saved=1`);
}

export async function deleteOrder(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin?setup=required");
  const id = text(formData, "id");
  const { error } = await admin.supabase.from("orders").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect("/admin/orders?deleted=1");
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
  if (error) redirect("/admin/login?error=invalid-credentials");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
