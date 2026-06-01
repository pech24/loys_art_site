import { apiRequest } from '../../_shared/apiRouter';

export const onRequest: PagesFunction<Env> = async (context) => {
    const id = context.params?.id;
    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    return apiRequest(context.request, context.env, ['gallery', id]);
};
