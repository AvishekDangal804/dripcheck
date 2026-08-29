import { z } from "zod";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// Live Fit Check sends ~5 frames; a single upload sends 1. Cap the total so a
// bad client can't post an unbounded payload.
export const MAX_FRAMES = 6;
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const dataUrlPattern = /^data:(image\/[a-zA-Z+]+);base64,([A-Za-z0-9+/=]+)$/;

function isValidImageDataUrl(value: string): boolean {
  const match = value.match(dataUrlPattern);
  if (!match) return false;

  const [, mimeType, base64] = match;
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return false;
  }

  const approxBytes = base64.length * 0.75;
  return approxBytes <= MAX_IMAGE_BYTES;
}

export const analyzeFitRequestSchema = z.object({
  participantName: z
    .string()
    .trim()
    .min(1, "Enter your name to start your fit check.")
    .max(40, "Names must be 40 characters or fewer."),
  // One or more base64 image data URLs. Live = the rotation frames (front …
  // back … front), Photo Check = a single uploaded image.
  frames: z
    .array(z.string())
    .min(1, "At least one frame is required.")
    .max(MAX_FRAMES, `No more than ${MAX_FRAMES} frames.`)
    .refine((frames) => frames.every(isValidImageDataUrl), "Each frame must be a JPEG, PNG, or WebP under 8MB."),
  source: z.enum(["live", "upload"]),
  // Optional client-side framing heuristic result (which categories the
  // camera could plausibly see). Used to steer the mock analyzer and given
  // to the real model as a hint; never trusted as ground truth.
  framingHint: z.record(z.string(), z.boolean()).optional(),
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
