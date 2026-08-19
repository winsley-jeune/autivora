# Autonomous Store Integration Requirements

Secrets must be injected through a production secret manager or environment variables and must
never be committed. Each credential should have the minimum scopes listed below.

## Required to complete storefront autonomy

- **Parent storefront repository:** mounted writable with its package manifest, product/category
  page sources, deployment configuration, and test suite. The reviewed `agents` directory refers
  to this repository through `../..`, but it is not present in the current workspace.
- **Shopify Admin API:** products, product media/files, publications, inventory, orders, returns,
  fulfillment, discounts, themes/content where applicable, and webhooks. Payment/billing scopes
  remain excluded until a dedicated policy is approved.
- **Shopify Storefront API:** live read verification of products, collections, price, availability,
  media, and canonical URLs.
- **Deployment provider:** scoped permission to deploy the storefront and query deployment health;
  production rollback permission is required.
- **GA4 and Search Console:** read access plus verified ecommerce events.
- **Google Merchant Center:** product/feed read-write and diagnostics.
- **Supplier APIs:** search, product detail, freight, stock, ordering, tracking, cancellation, and
  refund capabilities, preferably separated into read and fulfillment credentials.
- **OpenAI:** image edit access for source-grounded product transformations.
- **Anthropic:** planning and independent verification. Production should use separate generator
  and verifier identities/configurations so provenance is auditable.

## Required for autonomous distribution

- Pinterest, Instagram/Meta, Facebook, and TikTok publishing and insights APIs.
- Email service provider with consent, suppression, events, sending, and analytics scopes.
- Outreach mailbox/provider with a dedicated sending domain, bounce/complaint events, and opt-out
  suppression.

## Required only after the paid-readiness gate

- Google Ads, Meta Ads, TikTok Ads, or other selected ad APIs.
- Start with campaign read/write and reporting; account billing/profile mutation is unnecessary.
- Platform account daily caps must be configured outside the agent as a second backstop.

## Credential validation

For each integration the control plane must run a non-destructive startup check that records:

- identity/account/store;
- granted scopes;
- token expiration and refresh capability;
- read test;
- sandbox/draft write test where available;
- webhook verification;
- rate-limit metadata;
- revocation and rotation procedure.

The autonomous scheduler must not dispatch a capability until its credential check and the
corresponding lifecycle/policy gate both pass.
