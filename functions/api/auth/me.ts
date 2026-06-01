import { apiRequest } from '../../_shared/apiRouter';

export const onRequest: PagesFunction<Env> = async (context) => {
    return apiRequest(context.request, context.env, ['auth', 'me']);
};
