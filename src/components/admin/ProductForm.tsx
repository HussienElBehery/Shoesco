"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { saveProduct } from "@/app/admin/actions";
import { PRODUCT_GENDER_OPTIONS } from "@/lib/product-labels";
import type { Product } from "@/types/product";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm outline-none transition focus:border-[#c6ff3a]";
const textAreaClass =
  "mt-2 min-h-28 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] p-4 text-sm outline-none transition focus:border-[#c6ff3a]";

type SizeRow = { size: string; available: boolean };

export function ProductForm({ product }: { product?: Product }) {
  const initialSizes = useMemo<SizeRow[]>(
    () =>
      product?.sizes.map((entry) => ({
        size: entry.size,
        available: entry.available,
      })) ?? [
        { size: "36", available: true },
        { size: "37", available: true },
        { size: "38", available: true },
        { size: "39", available: true },
        { size: "40", available: true },
        { size: "41", available: true },
      ],
    [product],
  );
  const [sizes, setSizes] = useState(initialSizes);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  return (
    <form
      action={saveProduct}
      className="grid gap-8 lg:grid-cols-[1fr_360px]"
      onChange={() => setDirty(true)}
      onSubmit={() => setDirty(false)}
    >
      <input name="id" type="hidden" value={product?.id ?? ""} />
      <input name="sizeRows" type="hidden" value={JSON.stringify(sizes)} />
      <div className="rounded-[1.75rem] border border-[#2a2e36] bg-[#181b21] p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">Product name<input className={inputClass} defaultValue={product?.name} name="name" required /></label>
          <label className="text-sm font-semibold">URL slug<input className={inputClass} defaultValue={product?.slug} name="slug" placeholder="urban-runner-white" required /></label>
          <label className="text-sm font-semibold">Price in EGP<input className={inputClass} defaultValue={product?.price} min="1" name="price" required type="number" /></label>
          <label className="text-sm font-semibold">Category<select className={inputClass} defaultValue={product?.category ?? "Sneakers"} name="category"><option>Sneakers</option><option>Running</option><option>Shoe Care</option></select></label>
          <label className="text-sm font-semibold">Gender<select className={inputClass} defaultValue={product?.gender ?? "Unisex"} name="gender">{PRODUCT_GENDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-sm font-semibold">Colors, separated by commas<input className={inputClass} defaultValue={product?.colors.join(", ")} name="colors" required /></label>
          <label className="text-sm font-semibold">Fit<select aria-label="Fit" className={inputClass} defaultValue={product?.fit ?? "True to size"} name="fit"><option>Narrow</option><option>True to size</option><option>Roomy</option></select></label>
          <label className="text-sm font-semibold">Width<select aria-label="Width" className={inputClass} defaultValue={product?.width ?? "Standard"} name="width"><option>Narrow</option><option>Standard</option><option>Wide</option></select></label>
          <label className="text-sm font-semibold sm:col-span-2">Merchandising label<input className={inputClass} defaultValue={product?.merchandisingLabel} maxLength={40} name="merchandisingLabel" placeholder="New rotation" /></label>
        </div>
        <label className="mt-5 block text-sm font-semibold">Short description<input className={inputClass} defaultValue={product?.shortDescription} maxLength={180} name="shortDescription" required /></label>
        <label className="mt-5 block text-sm font-semibold">Full description<textarea className={textAreaClass} defaultValue={product?.description} name="description" required /></label>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">Fit note<textarea className={textAreaClass} defaultValue={product?.fitNote} name="fitNote" required /></label>
          <label className="text-sm font-semibold">Materials<textarea className={textAreaClass} defaultValue={product?.materials} name="materials" required /></label>
          <label className="text-sm font-semibold sm:col-span-2">Care instructions<textarea className={textAreaClass} defaultValue={product?.care} name="care" required /></label>
        </div>

        <div className="mt-8 border-t border-[#2a2e36] pt-7">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="font-semibold">Sizes and availability</h2><p className="mt-1 text-sm text-neutral-500">Manage each size independently.</p></div>
            <button className="rounded-full border border-[#2a2e36] px-4 py-2 text-xs font-semibold" onClick={() => setSizes((current) => [...current, { size: "", available: true }])} type="button">Add size</button>
          </div>
          <div className="mt-4 grid gap-3">
            {sizes.map((entry, index) => (
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-[#2a2e36] bg-[#0f1115] p-3" key={`${entry.size}-${index}`}>
                <input aria-label={`Size row ${index + 1}`} className="h-10 rounded-lg border border-[#2a2e36] bg-[#181b21] px-3" onChange={(event) => setSizes((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, size: event.target.value } : row))} placeholder="EU size" value={entry.size} />
                <label className="flex items-center gap-2 text-xs"><input checked={entry.available} onChange={(event) => setSizes((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, available: event.target.checked } : row))} type="checkbox" /> Available</label>
                <button aria-label={`Remove size ${entry.size || index + 1}`} className="text-xs text-neutral-500 underline" onClick={() => setSizes((current) => current.filter((_, rowIndex) => rowIndex !== index))} type="button">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-[#2a2e36] pt-7">
          <h2 className="font-semibold">Product images</h2>
          <p className="mt-1 text-sm text-neutral-500">JPG, PNG, or WebP. Maximum 5MB each. Position 0 is the primary image.</p>
          <input accept="image/jpeg,image/png,image/webp" className="mt-4 block w-full text-sm" multiple name="images" type="file" />
          {product && product.images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {product.images.map((image) => (
                <div className="relative overflow-hidden rounded-xl border border-[#2a2e36] bg-[#0f1115] p-2" key={image.id}>
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f2efe7]"><Image alt={image.alt} className="object-contain p-2 mix-blend-multiply" fill sizes="180px" src={image.url} /></div>
                  <label className="mt-2 block text-xs">Alt text<input className="mt-1 w-full rounded border border-[#2a2e36] bg-[#181b21] px-2 py-1" defaultValue={image.alt} name={`imageAlt:${image.id}`} /></label>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <label>Position <input className="ml-1 w-12 rounded border border-[#2a2e36] bg-[#181b21] px-1 py-0.5" defaultValue={image.position} min="0" name={`imagePosition:${image.id}`} type="number" /></label>
                    <label className="flex items-center gap-1"><input name="removeImages" type="checkbox" value={image.id} /> Remove</label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-[1.75rem] border border-[#2a2e36] bg-[#181b21] p-6 text-[#f4f1ea] lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold">Publishing</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Product title, price, images, sizes, published, and featured status update the customer catalog after saving.
        </p>
        <label className="mt-6 flex items-center justify-between gap-4"><span><strong className="block text-sm">Published</strong><small className="text-neutral-400">Visible to customers</small></span><input defaultChecked={product?.published ?? true} name="published" type="checkbox" /></label>
        <label className="mt-5 flex items-center justify-between gap-4"><span><strong className="block text-sm">Featured</strong><small className="text-neutral-400">Show on homepage</small></span><input defaultChecked={product?.featured ?? false} name="featured" type="checkbox" /></label>
        <div className="mt-6 rounded-xl border border-[#2a2e36] bg-[#0f1115] p-3 text-xs leading-5 text-neutral-400">
          Homepage hero and category mockups are fixed local assets. Removing product images will not remove those mockups.
        </div>
        {product && product.published && !product.archived && (
          <Link className="mt-5 block text-sm font-semibold underline" href={`/products/${product.id}`} target="_blank">
            View public product page
          </Link>
        )}
        {dirty && <p className="mt-6 rounded-xl border border-[#c6ff3a]/30 bg-[#c6ff3a]/10 p-3 text-xs text-[#c6ff3a]">You have unsaved changes.</p>}
        <button className="mt-8 w-full rounded-full bg-[#c6ff3a] px-5 py-3.5 text-sm font-semibold text-[#0f1115]" type="submit">{product ? "Save changes" : "Create product"}</button>
      </aside>
    </form>
  );
}
