<h3 align="center">Shopify Hydrogen demo with personalization and AB testing</h3>

<p align="center">
  The official <a href="https://github.com/Shopify/hydrogen">Shopify Hydrogen</a> skeleton storefront powered by <a href="https://hydrogen.shopify.dev">Hydrogen</a> for commerce<br/>and <a href="https://croct.com?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs">Croct</a> for real-time personalization and AB testing.
</p>

<p align="center">
  <a href="https://croct-hydrogen-project.vercel.app">Live demo</a>
</p>

---

## Background

[Hydrogen](https://hydrogen.shopify.dev) is Shopify's framework for headless commerce. Its skeleton template, the storefront scaffolded by `npm create @shopify/hydrogen`, ships with collections, products, cart, search, and checkout wired to the Storefront API.

This repository is a fork of [Shopify/hydrogen](https://github.com/Shopify/hydrogen) trimmed down to the skeleton template, with [Croct](https://croct.com?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs) added on top. With Croct, any content in your storefront becomes dynamic and ready for AB testing and personalization, and your Shopify analytics events double as audience segmentation signals.

## What is Croct?

Croct is a headless platform for conversion optimization that pairs nicely with Shopify. Using Croct, you get:

* [Server-side AB testing](https://croct.com/ab-testing?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs) support with real-time [audience segmentation](https://croct.com/segmentation?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs)
* [Server-side content personalization](https://croct.com/personalization?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs) based on location, behavior, or custom rules
* [Visitor profile explorer](https://croct.com/user-profiles?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs) so you can dive deeper and analyze the user journey using out-of-the-box events.
* Built-in analytics and Bayesian analysis for every variant and experience
* Seamless compatibility with your existing Shopify headless commerce stack

With Croct, any content becomes dynamic and ready for AB testing and personalization, without changing how you structure or deliver it.

Croct replaces static content with dynamic content, allowing you to manage everything directly on the UI while using the application content as a [fallback](https://docs.croct.com/reference/sdk/nextjs/content-rendering#fault-tolerance?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs).

Since it comes with built-in audience segmentation and analytics, there's no need to add extra integrations with CDPs to segment visitors or with analytics tools to gather insights.

## What is inside this demo?

- **The Hydrogen skeleton storefront** with collections, products, cart, and search, running against the [mock.shop](https://mock.shop) demo data out of the box
- **Croct integration** wired through the official [Hydrogen SDK](https://docs.croct.com/reference/sdk/hydrogen/integration?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs): server-side content fetching in loaders (no flicker), visitor context middleware, and automatic forwarding of Shopify analytics events to Croct
- **Examples of personalized experiences** you can build on:
  - A site-wide announcement bar delivered through the `site-wide-top-bar` slot
  - A homepage hero delivered through the `home-hero` slot
  - A coupon input in the cart validated per visitor through the `coupons` slot: the same code can be accepted for one visitor and rejected with a reason for another
  - A personalized nudge at the top of the cart through the `checkout-callout` slot
  - Interest tracking on collection views and searches to build visitor profiles
  - Goal tracking on calls to action for conversion measurement

## How to get started?

Follow these steps to run the project locally.

### Prerequisites

- Node.js 22+
- A [Croct](https://app.croct.com?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs) workspace with the `site-wide-top-bar`, `home-hero`, `checkout-callout`, and `coupons` slots

No Shopify store is required: the storefront runs against [mock.shop](https://mock.shop) demo data by default.

### 1. Clone and install

```bash
git clone https://github.com/croct-tech/croct-hydrogen-project.git
cd croct-hydrogen-project
npm install
```

### 2. Set up Croct

Create the `.env` file from the template and run the Croct CLI to configure the application ID and API key automatically:

```bash
cp .env.example .env
npx croct init
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the storefront.

## How does the integration work?

The Croct CLI (`npx croct init`) wires the SDK into the app automatically. These are the touch points, in case you want to apply them to an existing Hydrogen app manually:

**1. Register the Vite plugin**

```ts
// vite.config.ts
import {croct} from '@croct/plug-hydrogen/vite';

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter(), croct()],
});
```

**2. Add the middleware and the `<CroctProvider>`**

The middleware exposes the visitor context to loaders and actions, and the provider makes the SDK available to components while forwarding Shopify analytics events to Croct:

```tsx
// app/root.tsx
import {CroctProvider} from '@croct/plug-hydrogen';
import {createCroctMiddleware} from '@croct/plug-hydrogen/server';

export const middleware = [createCroctMiddleware()];

<Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
  <CroctProvider>
    <PageLayout {...data}>
      <Outlet />
    </PageLayout>
  </CroctProvider>
</Analytics.Provider>
```

**3. Persist visitor cookies**

```ts
// server.ts
import {writeCroctCookies} from '@croct/plug-hydrogen/server';

writeCroctCookies(response, hydrogenContext);
```

**4. Fetch personalized content in loaders**

Content is fetched server-side, so there is no flicker. If the fetch fails, the SDK automatically falls back to the slot's default content bundled at build time:

```ts
// app/routes/_index.tsx
import {fetchContent} from '@croct/plug-hydrogen/server';

const {content} = await fetchContent('home-hero@2', {scope: context});
```

That's it. Once integrated, any content in the storefront becomes personalizable and ready for A/B testing through Croct: edit the slot content, targeting rules, and variants in Croct with no code changes.

### Event tracking

The storefront feeds Croct with behavioral signals that personalization rules can target.

Shopify analytics events are forwarded to Croct automatically by the SDK, including page views, product views, collection views, cart updates, and search. On top of that, the examples track:

| Event           | Trigger                  | Source                  |
|-----------------|--------------------------|-------------------------|
| `interestShown` | Collection page viewed   | `/collections/[handle]` |
| `interestShown` | Search performed         | `/search`               |
| `goalCompleted` | Hero CTA clicked         | `/`                     |
| `goalCompleted` | Announcement bar clicked | Site-wide               |
| `goalCompleted` | Coupon applied           | `/cart`                 |

### Deploying

Hydrogen deploys to [Shopify Oxygen](https://shopify.dev/docs/storefronts/headless/hydrogen/deployments) out of the box with `npx shopify hydrogen deploy`.

The project is also preconfigured to deploy on Vercel: Vercel builds skip the Oxygen runtime and use a Node.js server entrypoint (`server/vercel.ts`) with the Vercel React Router preset, while local development and Oxygen deployments are unaffected. Click the button below to deploy directly to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcroct-tech%2Fcroct-hydrogen-project&env=PUBLIC_CROCT_APP_ID,CROCT_API_KEY,SESSION_SECRET&envDescription=Your%20Croct%20application%20ID%20and%20API%20key%2C%20plus%20a%20random%20string%20to%20sign%20session%20cookies&envLink=https%3A%2F%2Fdocs.croct.com%2Freference%2Fsdk%2Fhydrogen%2Fintegration)

Set the environment variables when prompted: `PUBLIC_CROCT_APP_ID` and `CROCT_API_KEY` from your Croct workspace, and `SESSION_SECRET` as any random string. Without a connected Shopify store, the deployment serves the mock.shop demo data, same as local development.

## Docs

For more details on the tools used in this project, refer to the official documentation:

- [Croct docs](https://docs.croct.com?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs)
- [Croct Next.js SDK](https://docs.croct.com/reference/sdk/nextjs/integration?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs)
- [Croct Hydrogen SDK](https://docs.croct.com/reference/sdk/hydrogen/integration?utm_medium=repo&utm_source=github&utm_campaign=20260000.CO.DE.shopify_nextjs)
- [Hydrogen docs](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [React Router docs](https://reactrouter.com)
