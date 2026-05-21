import { Camera } from "lucide-react";

export function PhotoUploader() {
  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm font-medium text-zinc-600">
      <Camera size={24} />
      Fotos hinzufügen
      <input className="sr-only" type="file" name="photos" accept="image/*" multiple />
    </label>
  );
}
