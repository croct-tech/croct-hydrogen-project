import {waitUntil} from '@vercel/functions';
import {writeCroctCookies} from '@croct/plug-hydrogen/server';
import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';

/**
 * Server entrypoint for Vercel deployments.
 *
 * Mirrors the Oxygen entrypoint in `server.ts`, adapted to Vercel's Web
 * API-compatible function signature: the environment comes from
 * `process.env` and `waitUntil` from Vercel Functions.
 */
export default async function handler(request: Request): Promise<Response> {
  try {
    const env = {
      ...process.env,
      // Default to the mock.shop demo data when no store is connected,
      // matching the behavior of local development
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN || 'mock.shop',
    } as unknown as Env;

    const executionContext = {
      waitUntil,
      passThroughOnException: () => {},
    } as ExecutionContext;

    const hydrogenContext = await createHydrogenRouterContext(
      request,
      env,
      executionContext,
    );

    const handleRequest = createRequestHandler({
      build: serverBuild,
      mode: process.env.NODE_ENV,
      getLoadContext: () => hydrogenContext,
    });

    const response = await handleRequest(request);

    if (hydrogenContext.session.isPending) {
      response.headers.set(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    writeCroctCookies(response, hydrogenContext);

    if (response.status === 404) {
      return storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return new Response('An unexpected error occurred', {status: 500});
  }
}
