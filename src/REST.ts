import fetch, { RequestInit } from '@genee/fetch';

type Path = string | { path: string; query: string | Record<string, string | string[]> };
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

abstract class AbstractREST {
    protected baseUrl: string;
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    }

    protected abstract get additionalHeaders(): Record<string, string>;
    protected abstract get additionalQueries(): Record<string, string>;

    abstract url(path: Path): string;

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
            body,
        };

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

export { AbstractREST, Method, Path };
