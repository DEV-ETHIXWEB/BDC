// Fails loudly (instead of silently degrading) when a launch-critical variable is missing on the production host.
const endpoint = process.env.PUBLIC_FORM_ENDPOINT?.trim();
const onVercelProduction = process.env.VERCEL_ENV === 'production';
const allowMailto = process.env.ALLOW_MAILTO_FORM === '1';
// Required when asked explicitly, and automatically for Vercel production deploys (unless knowingly overridden).
const require = process.env.REQUIRE_FORM_ENDPOINT === '1' || (onVercelProduction && !allowMailto);
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
  console.error('\nBUILD FAILED: PUBLIC_FORM_ENDPOINT is not set for a production build.\nThe booking form would only open a mail app and could not confirm delivery.\nFix: set PUBLIC_FORM_ENDPOINT (https URL of your form service) in the host dashboard.\nTo deploy WITHOUT a form service on purpose, set ALLOW_MAILTO_FORM=1 (not launch-ready).\n');
  process.exit(1);
} else {
  console.warn('\n\x1b[33m!! WARNING: PUBLIC_FORM_ENDPOINT is not set. The booking form will fall back to the visitor\'s mail app and cannot confirm delivery.\n!! Not launch-ready. Set REQUIRE_FORM_ENDPOINT=1 on the production host to make this fatal.\x1b[0m\n');
}
