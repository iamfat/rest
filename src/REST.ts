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

    protected timeout = 5000;
    protected hashsum?: (url: string, body: any) => string;

    private _cookie?: string;

    get cookie() {
        return this._cookie;
    }

    protected rawRequest<Response = any, Payload = any>(
        method: Method,
        path: Path,
        body?: Payload,
        init_?: RequestInit,
    ) {
        const url = this.url(path);
        const init: RequestInit = {
            ...init_,
            method,
            headers: {
                ...init_?.headers,
                ...this.additionalHeaders,
            },
            body,
            timeout: this.timeout,
            beforeRequest: (url, init) => {
                init_?.beforeRequest?.(url, init);
                if (this._cookie) {
                    init.headers = { ...init.headers, cookie: this._cookie };
                    init.credentials = 'include';
                }
            },
            customParser: (r: any, defaultParser: (r: any) => Promise<any>) => {
                const setCookie = r.headers.get('set-cookie');
                if (setCookie) {
                    this._cookie = setCookie
                        .replace(/expires=(.+?);\s/gi, '')
                        .replace(/path=\/(,?)(\s?)/gi, '')
                        .trim();
                }
                return defaultParser(r);
            },
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

    request<Response = any, Payload = any>(
        method: Method,
        path: Path,
        body?: Payload,
        init?: RequestInit,
    ): Promise<Response> {
        if (this._initializing) {
            throw new Error('you cannot call request inside init function, use rawRequest instead!');
        }
        return this.initOnlyOnce().then(() => this.rawRequest(method, path, body, init));
    }

    get<Response = any>(path: Path, init?: RequestInit) {
        return this.request<Response>('GET', path, undefined, init);
    }

    post<Response = any, Payload = any>(path: Path, body?: Payload, init?: RequestInit) {
        return this.request<Response, Payload>('POST', path, body, init);
    }

    put<Response = any, Payload = any>(path: Path, body?: Payload, init?: RequestInit) {
        return this.request<Response, Payload>('PUT', path, body, init);
    }

    patch<Response = any, Payload = any>(path: Path, body?: Payload, init?: RequestInit) {
        return this.request<Response, Payload>('PATCH', path, body, init);
    }

    delete<Response = any>(path: Path, init?: RequestInit) {
        return this.request<Response>('DELETE', path, init);
    }
}

export { AbstractREST, Method, Path };
