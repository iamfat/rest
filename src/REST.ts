import fetch, { RequestInit } from '@genee/fetch';

type Path = string | { path: string; query: string | Record<string, string | string[]> };
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const fetchingRequests: Record<string, Promise<any>> = {};

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

    private _initPromise: Promise<void> | null;
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

    protected hashsum?: (url: string, body: any) => string;

    protected rawRequest<Response = any, Payload = any>(method: Method, path: Path, body?: Payload) {
        const url = this.url(path);
        const init: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                ...this.additionalHeaders,
            },
            body,
        };

        if (this.hashsum === undefined) {
            return fetch<Response>(url, init);
        }

        const hash = this.hashsum(url, body);
        if (!(hash in fetchingRequests)) {
            fetchingRequests[hash] = fetch<Response>(url, init);
            fetchingRequests[hash].finally(() => {
                delete fetchingRequests[hash];
            });
        }
        return fetchingRequests[hash];
    }

    reset() {
        this._initPromise = null;
        this._initializing = false;
    }

    request<Response = any, Payload = any>(method: Method, path: Path, body?: Payload): Promise<Response> {
        if (this._initializing) {
            throw new Error('you cannot call request inside init function, use rawRequest instead!');
        }
        return this.initOnlyOnce().then(() => this.rawRequest(method, path, body));
    }

    get<Response = any>(path: Path) {
        return this.request<Response>('GET', path);
    }

    post<Response = any, Payload = any>(path: Path, body?: Payload) {
        return this.request<Response, Payload>('POST', path, body);
    }

    put<Response = any, Payload = any>(path: Path, body?: Payload) {
        return this.request<Response, Payload>('PUT', path, body);
    }

    patch<Response = any, Payload = any>(path: Path, body?: Payload) {
        return this.request<Response, Payload>('PATCH', path, body);
    }

    delete<Response = any>(path: Path) {
        return this.request<Response>('DELETE', path);
    }
}

export { AbstractREST, Method, Path };
