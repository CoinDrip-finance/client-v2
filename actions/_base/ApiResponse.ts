export default class ApiResponse<T> {
  private _body: T | null;
  private _status: number;
  private _headers: [];
  private _cacheHeader: string | null;

  constructor({
    body,
    status,
    headers,
  }: {
    body?: T;
    status?: number;
    headers?: [];
  } = {}) {
    this._body = body ?? null;
    this._status = status ?? 200;
    this._headers = headers ?? [];
    this._cacheHeader = null;
  }

  body(value: T) {
    this._body = value;

    return this;
  }

  status(value: number) {
    this._status = value;

    return this;
  }

  headers(value: []) {
    this._headers.push(...value);

    return this;
  }

  cache(maxAge: number, staleWhileRevalidate: number) {
    this._cacheHeader = `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;

    return this;
  }

  getBody() {
    return this._body;
  }

  getStatus(): number {
    return this._status;
  }

  getHeaders(): [] {
    return this._headers;
  }

  getCache() {
    return this._cacheHeader;
  }
}
