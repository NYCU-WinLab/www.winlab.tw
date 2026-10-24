/** A same-site path to return to after sign-in; anything else is /directory. */
export function safeNext(raw: string | null): string {
  return raw &&
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.includes("\\")
    ? raw
    : "/directory"
}
