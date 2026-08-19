// Minimal OpenAI Images API client (gpt-image-2) — raw fetch, no SDK dependency, matching the
// style already used in agents/analytics/. GPT Image 1 is deprecating Oct 23 2026, so this
// targets the current flagship model, not the older/cheaper one.
// https://developers.openai.com/api/docs/guides/image-generation

// Recontextualizes a REAL reference photo (e.g. an actual product shot) into a new scene,
// preserving the real product's appearance instead of inventing one. This module intentionally
// exposes only this edit path: actual Autivara products must always begin with a source image.
export async function editImage(apiKey, referenceImageBuffer, referenceFilename, prompt, { size = "1536x1024", quality = "medium" } = {}) {
  const form = new FormData();
  form.append("model", "gpt-image-2");
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("quality", quality);
  // Without this, the edits endpoint doesn't reliably return JPEG — a caller that (reasonably)
  // assumes the returned bytes are
  // JPEG, e.g. to pass to another API with a fixed media_type, gets a silent format mismatch.
  form.append("output_format", "jpeg");
  const ext = referenceFilename.split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  form.append("image", new Blob([referenceImageBuffer], { type: mime }), referenceFilename);

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`OpenAI image edit failed: ${res.status} ${JSON.stringify(json)}`);
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error(`OpenAI response had no image data: ${JSON.stringify(json)}`);
  return Buffer.from(b64, "base64");
}
