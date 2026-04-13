import { spawnSync } from 'node:child_process';
import { ApiError } from './errors.js';

export type Headers = Record<string, string>;
export type QueryParams = Record<string, string>;

const stealthHeaders: Headers = {
  'rd-is-pickup-station': 'false',
  'rd-is-lsfk': 'false',
  'rd-user-consent': '{"conversionOptimization": 1}'
};

const buildUrl = (base: string, qps: QueryParams = {}) => {
  const usp = new URLSearchParams(qps);
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
};

export class HttpClient {
  private curlBin = process.env.KORB_CURL ?? 'curl';

  private runCurl(args: string[], url: string): string {
    const proc = spawnSync(this.curlBin, args, { encoding: 'utf8' });
    if (proc.status === 22) throw new ApiError(`HTTP error - ${url} - ${proc.stdout}`);
    if (proc.status !== 0) throw new ApiError(`curl failed (exit ${proc.status}): ${proc.stderr}`);
    return proc.stdout;
  }

  private mergedHeaders(h?: Headers) { return { ...stealthHeaders, ...(h ?? {}) }; }

  get<T>(url: string, headers?: Headers, query?: QueryParams): T {
    const fullUrl = buildUrl(url, query);
    const hdrArgs = Object.entries(this.mergedHeaders(headers)).flatMap(([k, v]) => ['-H', `${k}: ${v}`]);
    const stdout = this.runCurl(['-s', '-f', ...hdrArgs, fullUrl], fullUrl);
    return JSON.parse(stdout) as T;
  }

  delete<T>(url: string, headers?: Headers, query?: QueryParams): T {
    const fullUrl = buildUrl(url, query);
    const hdrArgs = Object.entries(this.mergedHeaders(headers)).flatMap(([k, v]) => ['-H', `${k}: ${v}`]);
    const stdout = this.runCurl(['-s', '-f', '-X', 'DELETE', ...hdrArgs, fullUrl], fullUrl);
    return stdout ? JSON.parse(stdout) as T : ({} as T);
  }

  post<T>(body: unknown, url: string, headers?: Headers, query?: QueryParams): T {
    const fullUrl = buildUrl(url, query);
    const hdrArgs = Object.entries(this.mergedHeaders(headers)).flatMap(([k, v]) => ['-H', `${k}: ${v}`]);
    const stdout = this.runCurl(['-s', '-f', '-X', 'POST', '-H', 'Content-Type: application/json', ...hdrArgs, '-d', JSON.stringify(body), fullUrl], fullUrl);
    return JSON.parse(stdout) as T;
  }

  patch<T>(body: unknown, url: string, headers?: Headers, query?: QueryParams): T {
    const fullUrl = buildUrl(url, query);
    const hdrArgs = Object.entries(this.mergedHeaders(headers)).flatMap(([k, v]) => ['-H', `${k}: ${v}`]);
    const stdout = this.runCurl(['-s', '-f', '-X', 'PATCH', '-H', 'Content-Type: application/json', ...hdrArgs, '-d', JSON.stringify(body), fullUrl], fullUrl);
    return JSON.parse(stdout) as T;
  }

  urlFromEncodedPost<T>(form: QueryParams, url: string): T {
    const body = new URLSearchParams(form).toString();
    const stdout = this.runCurl(['-s', '-f', '-X', 'POST', '-H', 'Content-Type: application/x-www-form-urlencoded', '-d', body, url], url);
    return JSON.parse(stdout) as T;
  }
}
