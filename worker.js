export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      const newUrl = request.url.replace(
        'https://www.globalcompass.com.tr/api/',
        'https://global-compass-paytr.canmuratsubat.workers.dev/'
      );
      return fetch(new Request(newUrl, request));
    }
    
    return env.ASSETS.fetch(request);
  }
};

