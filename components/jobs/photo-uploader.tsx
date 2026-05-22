"use client";

import { Camera, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";

export function PhotoUploader() {
  const [previews, setPreviews] = useState<Array<{ name: string; url: string }>>([]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  return (
    <div className="grid gap-3">
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-center text-sm font-medium text-zinc-600 hover:border-emerald-500 hover:bg-emerald-50/40">
        <Camera size={24} />
        <span>Fotos auswählen</span>
        <span className="text-xs font-normal text-zinc-500">Upload erfolgt beim Speichern des Jobs.</span>
        <input
          className="sr-only"
          type="file"
          name="photos"
          accept="image/*"
          multiple
          onChange={(event) => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
            const files = Array.from(event.currentTarget.files ?? []);
            setPreviews(files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));
          }}
        />
      </label>
      {previews.length > 0 ? (
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
            <ImagePlus size={17} />
            {previews.length} Foto{previews.length === 1 ? "" : "s"} ausgewählt
          </div>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview) => (
              <figure key={preview.url} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt="" className="aspect-square w-full object-cover" />
                <figcaption className="truncate px-2 py-1 text-xs text-zinc-500">{preview.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
