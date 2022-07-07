import { URL, URLSearchParams } from 'node:url';
import { AbstractREST, Path } from './REST';

abstract class REST extends AbstractREST {
    url(path: Path) {
        let u: URL;
        if (typeof path !== 'string') {
            u = new URL(path.path.replace(/^[\/.]+/, ''), this.baseUrl);
            if (typeof path.query == 'string') {
                new URLSearchParams(path.query).forEach((v, k) => u.searchParams.append(k, v));
            } else {
                Object.keys(path.query).forEach((k) => {
                    const v = path.query[k];
                    Array.isArray(v) ? v.forEach((vv) => u.searchParams.append(k, vv)) : u.searchParams.append(k, v);
                });
            }
        } else {
            u = new URL(path.replace(/^[\/.]+/, ''), this.baseUrl);
        }
        if (this.additionalQueries) {
            Object.keys(this.additionalQueries).forEach((k) => {
                const v = this.additionalQueries[k];
                Array.isArray(v) ? v.forEach((vv) => u.searchParams.append(k, vv)) : u.searchParams.append(k, v);
            });
        }
        return u.toString();
    }
}

export { Method, Path } from './REST';
export { REST };
export default REST;
