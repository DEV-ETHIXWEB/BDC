// Fails loudly (instead of silently degrading) when a launch-critical variable is missing on the production host.
const endpoint = process.env.PUBLIC_FORM_ENDPOINT?.trim();
// A missing endpoint never breaks the build by default: the forms then say plainly "not sent yet" and open the
// visitor's mail app. Set REQUIRE_FORM_ENDPOINT=1 on the production host to make a missing endpoint fatal.
const require = process.env.REQUIRE_FORM_ENDPOINT === '1';
if (endpoint) {
  try {
    // A same-origin path (our own /api/lead function) is the preferred setup; a full https URL is also fine
    // for a third-party form service.
    if (endpoint.startsWith('/')) {
      console.log(`env ok: form endpoint ${endpoint} (same-origin function)`);
    } else {
      const u = new URL(endpoint);
      if (u.protocol !== 'https:') throw new Error('must be https');
      console.log(`env ok: form endpoint ${u.origin}`);
    }
  } catch (e) {
    console.error(`\nPUBLIC_FORM_ENDPOINT must be a same-origin path like /api/lead, or an https URL (${e.message}).\n`);
    process.exit(1);
  }
} else if (require) {
  console.error('\nBUILD FAILED: PUBLIC_FORM_ENDPOINT is not set for a production build.\nThe booking form would only open a mail app and could not confirm delivery.\nFix: set PUBLIC_FORM_ENDPOINT (https URL of your form service) in the host dashboard, or remove REQUIRE_FORM_ENDPOINT.\n');
  process.exit(1);
} else {
  console.warn('\n\x1b[33m!! WARNING: PUBLIC_FORM_ENDPOINT is not set. The booking form will fall back to the visitor\'s mail app and cannot confirm delivery.\n!! Not launch-ready until it is set. Set REQUIRE_FORM_ENDPOINT=1 on the production host to make this fatal.\x1b[0m\n');
}

// --- Cloudflare Turnstile -----------------------------------------------------------------
// The site key is public and belongs in PUBLIC_TURNSTILE_SITE_KEY. The SECRET key must never be set here:
// it belongs on the endpoint that calls siteverify, and a PUBLIC_ name would compile it into the bundle.
const siteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY?.trim();
const TEST_KEYS = ['1x00000000000000000000AA', '2x00000000000000000000AB', '3x00000000000000000000FF'];
if (Object.keys(process.env).some((k) => k.startsWith('PUBLIC_') && /turnstile/i.test(k) && /secret/i.test(k))) {
  console.error('\nBUILD FAILED: a Turnstile SECRET key is exposed through a PUBLIC_ variable.\nPUBLIC_* values are compiled into the browser bundle. Move it to a server-side variable.\n');
  process.exit(1);
}
if (siteKey) {
  if (TEST_KEYS.includes(siteKey)) {
    if (require) {
      console.error(`\nBUILD FAILED: PUBLIC_TURNSTILE_SITE_KEY is a Cloudflare TEST key (${siteKey}).\nIt always passes and protects nothing. Use the real site key for production.\n`);
      process.exit(1);
    }
    console.warn(`\n\x1b[33m!! WARNING: PUBLIC_TURNSTILE_SITE_KEY is a Cloudflare test key (${siteKey}). It always passes.\x1b[0m\n`);
  } else {
    console.log('env ok: Turnstile site key set (verify the token server-side with the secret key)');
  }
} else {
  console.warn('\n\x1b[33m!! NOTE: PUBLIC_TURNSTILE_SITE_KEY is not set, so the forms ship without a captcha (honeypot only).\x1b[0m\n');
}

// --- SMTP2GO (used by api/lead.js) ---------------------------------------------------------
// The key is read at request time on the server, so it is NOT needed at build time and is not checked for
// presence here. What is checked is that nobody exposed it through a PUBLIC_ name.
if (Object.keys(process.env).some((k) => k.startsWith('PUBLIC_') && /smtp2go|mail_?api|sendgrid|postmark/i.test(k))) {
  console.error('\nBUILD FAILED: a mail provider key is exposed through a PUBLIC_ variable.\nPUBLIC_* values are compiled into the browser bundle. Rename it without the PUBLIC_ prefix.\n');
  process.exit(1);
}
if (endpoint && endpoint.startsWith('/api/') && !process.env.SMTP2GO_API_KEY) {
  console.warn('\n\x1b[33m!! NOTE: the form posts to ' + endpoint + ' but SMTP2GO_API_KEY is not set in this environment.\n!! That is normal for a local build; on the production host it must be set or every lead returns a 500.\x1b[0m\n');
}
