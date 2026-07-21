import Axios, { type AxiosRequestConfig } from 'axios';

// Points at the real backend in production. On `client-preview` the requests
// are intercepted by MSW mocks instead (see src/mocks), so the preview never
// touches real store data — PROJECT_BRIEF.md §10.
export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});

// Orval mutator: every generated call goes through this.
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data as T);

  // @ts-expect-error attach cancel for React Query cancellation
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;
