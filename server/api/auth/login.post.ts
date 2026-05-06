import { joinURL } from 'ufo';

interface Response {
  token: string;
  id: number;
  role: string;
  name: string;
}

export default defineEventHandler(async (event) => {
  const apiUrl = useRuntimeConfig().apiUrl;
  const body = await readBody(event);

  const target = joinURL(apiUrl, '/api/auth/login/');

  const response = await $fetch<Response>(target, {
    method: 'POST',
    body: {
      username: body.username,
      password: body.password,
    },
  });

  await setUserSession(event, {
    user: {
      name: body.username,
      id: response.id,
      role: response.role,
    },
    token: response.token,
  });

  return {
    ok: true,
  };
});
