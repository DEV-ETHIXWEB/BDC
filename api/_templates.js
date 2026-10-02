// The two transactional emails, rendered server-side. This module is the source of truth for what actually
// gets sent; email/*.html are the same markup kept for pasting into the SMTP2GO dashboard.
// Table layout, inline styles, 600px, bulletproof VML buttons, and a text part for multipart/alternative.

const esc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nl2br = (v) => esc(v).replace(/\r?\n/g, '<br />');

const SITE = 'https://www.bdcguideservices.com';
const LOGO = `${SITE}/icon-512.png`;
const PHONE = '(503) 826-7294';
const PHONE_HREF = 'tel:+15038267294';

const head = (title, preheader) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light dark" /><meta name="supported-color-schemes" content="light dark" />
<title>${esc(title)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}
  @media only screen and (max-width:620px){
    .w{width:100% !important;} .px{padding-left:22px !important;padding-right:22px !important;}
    .stack{display:block !important;width:100% !important;padding:0 0 10px 0 !important;}
    .h1{font-size:27px !important;line-height:33px !important;} .btn a{display:block !important;}
  }
</style></head>
<body style="margin:0;padding:0;background-color:#f3f7fb;">
<div style="display:none;font-size:1px;color:#f3f7fb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f7fb;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">`;

const foot = `  </table>
</td></tr></table></body></html>`;

const row = (label, value, strong) => `
        <tr>
          <td width="38%" style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#55657a;font-weight:bold;border-bottom:1px solid #e7eef5;">${esc(label)}</td>
          <td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;color:#071b33;${strong ? 'font-weight:bold;' : ''}border-bottom:1px solid #e7eef5;">${value}</td>
        </tr>`;

/** Internal notification: everything the captain needs to call the lead back. */
export function leadEmail(d) {
  const subject = `New trip request: ${d.name}${d.trip ? ` - ${d.trip}` : ''}`;
  const rows = [
    d.trip && row('Trip', esc(d.trip), true),
    row('Name', esc(d.name), true),
    row('Phone', `<a href="tel:${esc(d.phone)}" style="color:#0e6f90;text-decoration:none;font-weight:bold;">${esc(d.phone)}</a>`),
    d.email && row('Email', `<a href="mailto:${esc(d.email)}" style="color:#0e6f90;text-decoration:none;">${esc(d.email)}</a>`),
    d.topics && row('Asking about', esc(d.topics)),
    d.guests && row('Guests', esc(d.guests)),
    row('Preferred date', esc(d.date || 'Flexible'), true),
    d.page && row('Sent from', esc(d.page)),
  ].filter(Boolean).join('');

  const html = `${head(subject, `${d.name} wants ${d.trip || 'a trip'}. Call ${d.phone}.`)}
    <tr><td align="center" class="px" style="background-color:#071b33;border-radius:10px 10px 0 0;padding:28px 36px 24px;">
      <img src="${LOGO}" width="76" height="76" alt="BDC Guide Service" style="display:block;border:0;width:76px;height:76px;" />
      <div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#bfe6f2;font-weight:bold;">New trip request</div>
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;padding:32px 36px 8px;">
      <h1 class="h1" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:36px;color:#071b33;font-weight:bold;">${esc(d.name)} wants to book</h1>
      <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#55657a;">Sent from the website. The fastest reply wins the booking, and the phone number is live below.</p>
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;padding:24px 36px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d3e0ea;border-radius:8px;background-color:#f8fbfd;">${rows}</table>
    </td></tr>
    ${d.message ? `<tr><td class="px" style="background-color:#ffffff;padding:18px 36px 0;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#55657a;font-weight:bold;">Their message</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;"><tr>
        <td style="padding:16px 18px;background-color:#f8fbfd;border-left:4px solid #0e6f90;border-radius:0 8px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2c3a4a;">${nl2br(d.message)}</td>
      </tr></table></td></tr>` : ''}
    <tr><td class="px btn" style="background-color:#ffffff;padding:28px 36px 36px;">
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="tel:${esc(d.phone)}" style="height:50px;v-text-anchor:middle;width:258px;" arcsize="50%" stroke="f" fillcolor="#0e6f90"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Call ${esc(d.name)}</center></v:roundrect><![endif]-->
      <!--[if !mso]><!-- -->
      <a href="tel:${esc(d.phone)}" style="display:inline-block;background-color:#0e6f90;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:50px;text-align:center;text-decoration:none;border-radius:25px;padding:0 34px;">Call ${esc(d.name)}</a>
      <!--<![endif]-->
    </td></tr>
    <tr><td class="px" style="background-color:#071b33;border-radius:0 0 10px 10px;padding:24px 36px;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#9fb3c8;">Sent by the booking form on <a href="${SITE}" style="color:#bfe6f2;text-decoration:none;">bdcguideservices.com</a>.<br />Internal notification: reply straight to the guest, not to this message.</p>
    </td></tr>${foot}`;

  const text = `NEW TRIP REQUEST - BDC Guide Service

${d.name} wants to book.

Trip:           ${d.trip || '-'}
Name:           ${d.name}
Phone:          ${d.phone}
${d.email ? `Email:          ${d.email}\n` : ''}${d.topics ? `Asking about:   ${d.topics}\n` : ''}${d.guests ? `Guests:         ${d.guests}\n` : ''}Preferred date: ${d.date || 'Flexible'}
${d.page ? `Sent from:      ${d.page}\n` : ''}${d.message ? `\nTHEIR MESSAGE\n-------------\n${d.message}\n` : ''}
Call them: ${d.phone}
${d.email ? `Email them: ${d.email}\n` : ''}
---
Sent by the booking form on bdcguideservices.com.`;

  return { subject, html, text };
}

/** Auto-reply to the visitor. Only sent when the form collected an email address. */
export function confirmEmail(d) {
  const subject = `We have your request, ${d.name}`;
  const season = [
    ['Winter steelhead', 'Jan to Apr'], ['Spring &amp; early Chinook', 'Mar to Jul'],
    ['Fall salmon', 'Aug to Nov'], ['American shad', 'Early summer'],
    ['Sturgeon', 'Catch &amp; release, all year'], ['Dungeness crab', 'Oct to Dec'],
  ].map(([n, w], i) => `<tr>
      <td style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#ffffff;font-weight:bold;${i ? 'border-top:1px solid #16304d;' : ''}">${n}</td>
      <td align="right" style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#bfe6f2;${i ? 'border-top:1px solid #16304d;' : ''}">${w}</td>
    </tr>`).join('');

  const html = `${head(subject, `Captain Clinton has your request and will call you on ${d.phone || 'the number you gave'} to confirm.`)}
    <tr><td align="center" class="px" style="background-color:#071b33;border-radius:10px 10px 0 0;padding:36px 36px 32px;">
      <img src="${LOGO}" width="104" height="104" alt="BDC Guide Service" style="display:block;border:0;width:104px;height:104px;" />
      <div style="height:16px;line-height:16px;font-size:16px;">&nbsp;</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:30px;color:#ffffff;font-weight:bold;letter-spacing:1px;">BDC GUIDE SERVICE</div>
      <div style="height:6px;line-height:6px;font-size:6px;">&nbsp;</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#bfe6f2;font-weight:bold;">Oregon &middot; Salmon &middot; Steelhead &middot; Crab</div>
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;padding:36px 36px 0;">
      <h1 class="h1" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:32px;line-height:38px;color:#071b33;font-weight:bold;">Thanks, ${esc(d.name)}.</h1>
      <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:27px;color:#2c3a4a;">Your request is in. Captain Clinton reads every one himself and will get back to you to confirm the date, the launch spot and the start time.</p>
      <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:27px;color:#2c3a4a;">He is often out on the water, so if you need an answer quickly the phone is always fastest.</p>
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;padding:28px 36px 0;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#55657a;font-weight:bold;">What you asked for</div>
      <div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d3e0ea;border-radius:8px;background-color:#f8fbfd;">
        ${d.trip ? row('Trip', esc(d.trip), true) : ''}
        ${d.guests ? row('Guests', esc(d.guests)) : ''}
        ${row('Preferred date', esc(d.date || 'Flexible, he will suggest the best window'))}
        ${row('We will reach you on', esc(d.phone || d.email))}
      </table>
    </td></tr>
    ${d.message ? `<tr><td class="px" style="background-color:#ffffff;padding:18px 36px 0;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#55657a;font-weight:bold;">What you told us</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;"><tr>
        <td style="padding:16px 18px;background-color:#f8fbfd;border-left:4px solid #0e6f90;border-radius:0 8px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2c3a4a;">${nl2br(d.message)}</td>
      </tr></table></td></tr>` : ''}
    <tr><td align="center" class="px btn" style="background-color:#ffffff;padding:30px 36px 6px;">
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${PHONE_HREF}" style="height:52px;v-text-anchor:middle;width:290px;" arcsize="50%" stroke="f" fillcolor="#0e6f90"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">Call ${PHONE}</center></v:roundrect><![endif]-->
      <!--[if !mso]><!-- -->
      <a href="${PHONE_HREF}" style="display:inline-block;background-color:#0e6f90;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;line-height:52px;text-align:center;text-decoration:none;border-radius:26px;padding:0 40px;">Call ${PHONE}</a>
      <!--<![endif]-->
      <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#55657a;">Captain Clinton McCulloch &middot; 45+ years on Oregon water</p>
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;padding:28px 36px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#071b33;border-radius:10px;"><tr><td class="px" style="padding:26px 28px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#bfe6f2;font-weight:bold;">The fishing year</div>
        <div style="height:14px;line-height:14px;font-size:14px;">&nbsp;</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${season}</table>
        <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#9fb3c8;">The season opens August 1. Runs shift with the river and the year, so Captain Clinton will tell you what is really happening the week you fish.</p>
      </td></tr></table>
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;padding:28px 36px 0;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#55657a;font-weight:bold;">Before you come out</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
        <tr><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2c3a4a;"><strong style="color:#0e6f90;">&bull;</strong>&nbsp; Everyone 12 and older needs an Oregon fishing licence. <a href="${SITE}/article/get-your-valid-oregon-fishing-license" style="color:#0e6f90;">How to get one</a>.</td></tr>
        <tr><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2c3a4a;"><strong style="color:#0e6f90;">&bull;</strong>&nbsp; Rods, reels, bait and tackle are included. Bring your own gear only if you want to.</td></tr>
        <tr><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2c3a4a;"><strong style="color:#0e6f90;">&bull;</strong>&nbsp; Pack a hat, sunscreen, polarised sunglasses, layers, and food and drinks.</td></tr>
        <tr><td style="padding:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#2c3a4a;"><strong style="color:#0e6f90;">&bull;</strong>&nbsp; Salmon trips can start as early as 4:00 AM. He will confirm your meeting spot and time when you book.</td></tr>
      </table>
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;padding:28px 36px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td class="stack" width="50%" style="padding-right:6px;"><a href="${SITE}/oregon-fishing-charter-rates" style="display:block;background-color:#f8fbfd;border:1px solid #d3e0ea;border-radius:8px;padding:16px 18px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;"><span style="display:block;font-size:16px;line-height:22px;color:#071b33;font-weight:bold;">Trips &amp; rates</span><span style="display:block;font-size:14px;line-height:20px;color:#55657a;">$150 to $250 per person</span></a></td>
        <td class="stack" width="50%" style="padding-left:6px;"><a href="${SITE}/oregon-fishing-species" style="display:block;background-color:#f8fbfd;border:1px solid #d3e0ea;border-radius:8px;padding:16px 18px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;"><span style="display:block;font-size:16px;line-height:22px;color:#071b33;font-weight:bold;">Target species</span><span style="display:block;font-size:14px;line-height:20px;color:#55657a;">What is biting, and when</span></a></td>
      </tr></table>
    </td></tr>
    <tr><td align="center" class="px" style="background-color:#071b33;border-radius:0 0 10px 10px;padding:30px 36px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;color:#ffffff;font-weight:bold;letter-spacing:1px;">BDC GUIDE SERVICE</div>
      <div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#9fb3c8;"><a href="${PHONE_HREF}" style="color:#bfe6f2;text-decoration:none;">${PHONE}</a><br /><a href="${SITE}" style="color:#bfe6f2;text-decoration:none;">bdcguideservices.com</a></p>
      <div style="height:14px;line-height:14px;font-size:14px;">&nbsp;</div>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#8da2b8;">You are getting this because you sent a request on bdcguideservices.com.<br />Nothing is booked until Captain Clinton confirms it with you.</p>
    </td></tr>${foot}`;

  const text = `BDC GUIDE SERVICE

Thanks, ${d.name}.

Your request is in. Captain Clinton reads every one himself and will get back
to you to confirm the date, the launch spot and the start time. If you need an
answer quickly the phone is always fastest: ${PHONE}.

WHAT YOU ASKED FOR
------------------
${d.trip ? `Trip:            ${d.trip}\n` : ''}${d.guests ? `Guests:          ${d.guests}\n` : ''}Preferred date:  ${d.date || 'Flexible'}
We will reach you on: ${d.phone || d.email}
${d.message ? `\nWHAT YOU TOLD US\n----------------\n${d.message}\n` : ''}
THE FISHING YEAR
----------------
Winter steelhead         Jan to Apr
Spring & early Chinook   Mar to Jul
Fall salmon              Aug to Nov
American shad            Early summer
Sturgeon                 Catch & release, all year
Dungeness crab           Oct to Dec

The season opens August 1.

BEFORE YOU COME OUT
-------------------
* Everyone 12 and older needs an Oregon fishing licence.
* Rods, reels, bait and tackle are included.
* Pack a hat, sunscreen, polarised sunglasses, layers, food and drinks.
* Salmon trips can start as early as 4:00 AM.

Trips & rates: ${SITE}/oregon-fishing-charter-rates
Target species: ${SITE}/oregon-fishing-species

---
BDC GUIDE SERVICE - Captain Clinton McCulloch
${PHONE} - ${SITE}

You are getting this because you sent a request on bdcguideservices.com.
Nothing is booked until Captain Clinton confirms it with you.`;

  return { subject, html, text };
}
