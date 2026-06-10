"use client";

import { useState } from "react";

import { Drawer } from "@/components/ui/Drawer";

const sizes = [
  ["36", "22.5-23.0 cm"],
  ["37", "23.0-23.5 cm"],
  ["38", "23.5-24.0 cm"],
  ["39", "24.0-24.5 cm"],
  ["40", "24.5-25.0 cm"],
  ["41", "25.0-25.8 cm"],
  ["42", "25.8-26.5 cm"],
  ["43", "26.5-27.2 cm"],
  ["44", "27.2-28.0 cm"],
  ["45", "28.0-28.7 cm"],
];

export function SizeGuideDialog({ note }: { note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="text-sm font-semibold underline decoration-[#c6ff3a]" onClick={() => setOpen(true)} type="button">
        Open size guide
      </button>
      <Drawer onClose={() => setOpen(false)} open={open} title="EU size guide">
        <div className="p-5">
          <p className="leading-7 text-neutral-500">{note}</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#2a2e36]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#181b21]">
                <tr>
                  <th className="px-4 py-3">EU size</th>
                  <th className="px-4 py-3">Heel-to-toe length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e36]">
                {sizes.map(([size, length]) => (
                  <tr key={size}>
                    <td className="px-4 py-3 font-semibold">{size}</td>
                    <td className="px-4 py-3 text-neutral-500">{length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className="mt-6 grid gap-3 text-sm leading-6 text-neutral-500">
            <li>1. Stand on a sheet of paper wearing the socks you normally use.</li>
            <li>2. Mark your heel and longest toe, then measure the distance.</li>
            <li>3. If you fall between sizes, ask Shoesoco before ordering.</li>
          </ol>
        </div>
      </Drawer>
    </>
  );
}
