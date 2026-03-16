export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API isteklerini paytr worker'a yönlendir
    if (url.pathname.startsWith('/api/paytr')) {
      const newUrl = request.url.replace(
        'https://www.globalcompass.com.tr/api/paytr',
        'https://global-compass-paytr.canmuratsubat.workers.dev'
      );
      return fetch(new Request(newUrl, request));
    }

    // Statik dosyaları serve et
    const response = await env.ASSETS.fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return newResponse;
  }
};

