// Fails loudly (instead of silently degrading) when a launch-critical variable is missing on the production host.
const endpoint = process.env.PUBLIC_FORM_ENDPOINT?.trim();
const require = process.env.REQUIRE_FORM_ENDPOINT === '1';
if (endpoint) {
  try {
    const u = new URL(endpoint);
    if (u.protocol !== 'https:') throw new Error('must be https');
    console.log(`env ok: form endpoint ${u.origin}`);
  } catch (e) {
    console.error(`\nPUBLIC_FORM_ENDPOINT is not a valid https URL (${e.message}).\n`);
    process.exit(1);
  }
} else if (require) {
  console.error('\nBUILD FAILED: REQUIRE_FORM_ENDPOINT=1 but PUBLIC_FORM_ENDPOINT is not set.\nThe booking form would only open a mail app and could not confirm delivery. Set it in the host dashboard.\n');
  process.exit(1);
} else {
  console.warn('\n\x1b[33m!! WARNING: PUBLIC_FORM_ENDPOINT is not set. The booking form will fall back to the visitor\'s mail app and cannot confirm delivery.\n!! Not launch-ready. Set REQUIRE_FORM_ENDPOINT=1 on the production host to make this fatal.\x1b[0m\n');
}
