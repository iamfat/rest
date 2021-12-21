import fetch, { RequestInit } from '@genee/fetch';

type Path = string | { path: string; query: string | Record<string, string> };
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
        return Promise.resolve();
    }

    private _initPromise: Promise<void>;
    private _initializing = false;
    protected initOnlyOnce() {
        if (!this._initPromise) {
            this._initPromise = this.init().then(() => {
                this._initializing = true;
            });
            this._initPromise.finally(() => {
                this._initializing = false;
            });
        }
        return this._initPromise;
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

    reset() {
        this._initPromise = null;
        this._initializing = false;
    }

    request<Request, Response>(method: Method, path: Path, body?: Request): Promise<Response> {
        if (this._initializing) {
            throw new Error('you cannot call request inside init function, use rawRequest instead!');
        }
        return this.initOnlyOnce().then(() => this.rawRequest(method, path, body));
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
