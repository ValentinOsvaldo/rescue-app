import { joinURL } from 'ufo';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const token = session?.token;
  const apiUrl = useRuntimeConfig().apiUrl;

  const target = joinURL(apiUrl, event.path);

  return proxyRequest(event, target, {
    headers: {
      Authorization: `Token ${token}`,
      'Accept-Language': 'es',
    },
  });
});
