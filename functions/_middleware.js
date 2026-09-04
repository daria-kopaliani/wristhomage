// The repo root is the Pages deploy artifact, so every root-level .md
// (AGENTS.md, DEPLOY.md, README.md) was publicly readable. _redirects does not
// close this: on Pages a matching static asset is served before redirect rules
// are evaluated. Functions run ahead of static assets, so this does.
// Fails open — any error here falls through to the normal asset response.
export const onRequest = async (context) => {
  try {
    const { pathname } = new URL(context.request.url);
    if (/\.md$/i.test(pathname)) {
      return new Response("Not found\n", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  } catch (e) {
    // fall through
  }
  return context.next();
};
