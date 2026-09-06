// The dedicated /about page stays dark until the band story is ready to stand
// on its own. Default ON so dev and the AI-editable preview keep exercising it;
// only production sets NEXT_PUBLIC_ABOUT_ENABLED=false.
//
// Deliberately thinner than the shop flag next door: no preview cookie
// override, because nothing needs to show both states of a marketing page
// without a rebuild, and no middleware guard — the page calls notFound().
//
// That guard hides the content but does NOT produce a 404 status: measured on
// Next 16.2.10, notFound() from this server component returns the not-found UI
// with HTTP 200. The shop's middleware rewrite, written specifically to avoid
// that soft 404, no longer avoids it either — /shop, /cart and /checkout also
// answer 200 with the 404 body. So middleware would buy nothing here, and the
// status is a pre-existing problem shared by both flags rather than a reason to
// prefer one. robots.ts disallows /about while this is off, which is what keeps
// crawlers away in the meantime.
export const ABOUT_ENABLED = process.env.NEXT_PUBLIC_ABOUT_ENABLED !== "false";
