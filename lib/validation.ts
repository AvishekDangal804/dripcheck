import { z } from "zod";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const dataUrlPattern = /^data:(image\/[a-zA-Z+]+);base64,([A-Za-z0-9+/=]+)$/;

export const analyzeFitRequestSchema = z.object({
  participantName: z
    .string()
    .trim()
    .min(1, "Enter your name to start your fit check.")
    .max(40, "Names must be 40 characters or fewer."),
  imageDataUrl: z.string().refine((value) => {
    const match = value.match(dataUrlPattern);
    if (!match) return false;

    const [, mimeType, base64] = match;
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      return false;
    }

    const approxBytes = base64.length * 0.75;
    return approxBytes <= MAX_IMAGE_BYTES;
  }, "Image must be a JPEG, PNG, or WebP under 8MB."),
  source: z.enum(["live", "upload"]),
});

export type AnalyzeFitRequest = z.infer<typeof analyzeFitRequestSchema>;

export function extractImageMimeType(imageDataUrl: string): string {
  const match = imageDataUrl.match(dataUrlPattern);
  return match?.[1] ?? "image/jpeg";
}

export function extractImageBase64(imageDataUrl: string): string {
  const match = imageDataUrl.match(dataUrlPattern);
  return match?.[2] ?? "";
}
