import fetch, { RequestInit } from '@genee/fetch';
import { URL, URLSearchParams } from 'node:url';

type Path =
    | string
    | {
          path: string;
          query:
              | string
              | Record<string, string | ReadonlyArray<string>>
              | Iterable<[string, string]>
              | ReadonlyArray<[string, string]>;
      };
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

abstract class REST {
    protected baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    protected abstract get additionalHeaders(): Record<string, string>;
    protected abstract get additionalQueries(): Record<string, string>;

    url(path: Path) {
        let u: URL;
        if (typeof path !== 'string') {
            u = new URL(`${this.baseUrl}/${path.path}`);
            new URLSearchParams(path.query).forEach((v, k) => u.searchParams.append(k, v));
        } else {
            u = new URL(`${this.baseUrl}/${path}`);
        }
        if (this.additionalQueries) {
            Object.keys(this.additionalQueries).forEach((k) => u.searchParams.append(k, this.additionalQueries[k]));
        }
        return u.toString();
    }

    protected init() {
        return Promise.resolve(true);
    }

    protected rawRequest<Request, Response>(method: Method, path: Path, body?: Request) {
        const init: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                ...this.additionalHeaders,
            },
        };

        if (method !== 'GET' && body) {
            init.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        return fetch<Response>(this.url(path), init);
    }

    private _initializing = true;
    request<Request, Response>(method: Method, path: Path, body?: Request): Promise<Response> {
        if (this._initializing) {
            throw new Error('you cannot call request inside init function, use rawRequest instead!');
        }
        const init = this.init();
        this._initializing = true;
        init.finally(() => {
            this._initializing = false;
        });
        return init.then(() => this.rawRequest(method, path, body));
    }

    get<Response = object>(path: Path) {
        return this.request<unknown, Response>('GET', path);
    }

    post<Request, Response = object>(path: Path, body?: Request) {
        return this.request<Request, Response>('POST', path, body);
    }

    put<Request, Response = object>(path: Path, body?: Request) {
        return this.request<Request, Response>('PUT', path, body);
    }

    patch<Request, Response = object>(path: Path, body?: Request) {
        return this.request<Request, Response>('PATCH', path, body);
    }

    delete<Response = object>(path: Path) {
        return this.request<unknown, Response>('DELETE', path);
    }
}

export { REST, Method };
export default REST;
