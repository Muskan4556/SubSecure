/**
 * Validates AI-related env vars at startup.
 * Throws a descriptive error (which will crash the server) if config is unsafe.
 */
export function validateAiConfig(): void {
  const allowPaid = process.env.AI_ALLOW_PAID_FALLBACK;
  if (allowPaid !== undefined && allowPaid !== "false") {
    throw new Error(
      `[AI Config] AI_ALLOW_PAID_FALLBACK must be "false" or unset. ` +
        `Got: "${allowPaid}". Refusing to start to prevent accidental paid usage.`,
    );
  }

  const model = process.env.AI_MODEL;
  const allowedRaw = process.env.AI_ALLOWED_MODELS ?? "gemini-3.8-flash";
  const allowed = allowedRaw.split(",").map((m) => m.trim());

  if (model && !allowed.includes(model)) {
    throw new Error(
      `[AI Config] AI_MODEL "${model}" is not in AI_ALLOWED_MODELS "${allowedRaw}". ` +
        `Refusing to start to prevent use of an unexpected model.`,
    );
  }
}

