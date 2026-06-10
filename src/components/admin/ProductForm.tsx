import Image from "next/image";

import { saveProduct } from "@/app/admin/actions";
import type { Product } from "@/types/product";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-950";

export function ProductForm({ product }: { product?: Product }) {
  const sizes = product?.sizes.map((entry) => entry.size).join(", ") ?? "36, 37, 38, 39, 40, 41";

  return (
    <form action={saveProduct} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <input name="id" type="hidden" value={product?.id ?? ""} />
      <div className="rounded-[1.75rem] bg-white p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">Product name<input className={inputClass} defaultValue={product?.name} name="name" required /></label>
          <label className="text-sm font-semibold">URL slug<input className={inputClass} defaultValue={product?.slug} name="slug" placeholder="urban-runner-white" required /></label>
          <label className="text-sm font-semibold">Price in EGP<input className={inputClass} defaultValue={product?.price} min="0" name="price" required type="number" /></label>
          <label className="text-sm font-semibold">Category<select className={inputClass} defaultValue={product?.category ?? "Sneakers"} name="category"><option>Sneakers</option><option>Running</option></select></label>
          <label className="text-sm font-semibold">Gender<select className={inputClass} defaultValue={product?.gender ?? "Unisex"} name="gender"><option>Men</option><option>Women</option><option>Unisex</option></select></label>
          <label className="text-sm font-semibold">Colors, separated by commas<input className={inputClass} defaultValue={product?.colors.join(", ")} name="colors" required /></label>
        </div>
        <label className="mt-5 block text-sm font-semibold">Short description<input className={inputClass} defaultValue={product?.shortDescription} maxLength={180} name="shortDescription" required /></label>
        <label className="mt-5 block text-sm font-semibold">Full description<textarea className="mt-2 min-h-32 w-full rounded-xl border border-neutral-300 p-4 text-sm outline-none focus:border-neutral-950" defaultValue={product?.description} name="description" required /></label>

        <div className="mt-8 border-t pt-7">
          <h2 className="font-semibold">Sizes and availability</h2>
          <label className="mt-4 block text-sm">Sizes, separated by commas<input className={inputClass} defaultValue={sizes} name="sizes" required /></label>
          {product && (
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Mark unavailable sizes</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.sizes.map((entry) => (
                  <label className="flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm" key={entry.id}>
                    <input defaultChecked={!entry.available} name="unavailableSizes" type="checkbox" value={entry.size} />
                    {entry.size}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        <div className="mt-8 border-t pt-7">
          <h2 className="font-semibold">Product images</h2>
          <p className="mt-1 text-sm text-neutral-500">JPG, PNG, or WebP. Maximum 5MB each.</p>
          <input accept="image/jpeg,image/png,image/webp" className="mt-4 block w-full text-sm" multiple name="images" type="file" />
          {product && product.images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {product.images.map((image) => (
                <label className="relative overflow-hidden rounded-xl border bg-[#eeeae1] p-2" key={image.id}>
                  <div className="relative aspect-square"><Image alt={image.alt} className="object-contain" fill sizes="180px" src={image.url} /></div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <label>Order <input className="ml-1 w-12 rounded border px-1 py-0.5" defaultValue={image.position} min="0" name={`imagePosition:${image.id}`} type="number" /></label>
                    <label className="flex items-center gap-1"><input name="removeImages" type="checkbox" value={image.id} /> Remove</label>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-[1.75rem] bg-[#1a1c1b] p-6 text-white">
        <h2 className="text-xl font-semibold">Publishing</h2>
        <label className="mt-6 flex items-center justify-between gap-4"><span><strong className="block text-sm">Published</strong><small className="text-neutral-400">Visible to customers</small></span><input defaultChecked={product?.published ?? true} name="published" type="checkbox" /></label>
        <label className="mt-5 flex items-center justify-between gap-4"><span><strong className="block text-sm">Featured</strong><small className="text-neutral-400">Show on homepage</small></span><input defaultChecked={product?.featured ?? false} name="featured" type="checkbox" /></label>
        <button className="mt-8 w-full rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-neutral-950" type="submit">{product ? "Save changes" : "Create product"}</button>
      </aside>
    </form>
  );
}
