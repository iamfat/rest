import { AbstractREST, Path } from './REST';

abstract class REST extends AbstractREST {
    url(path: Path) {
        let u: URL;
        if (typeof path !== 'string') {
            u = new URL(path.path.replace(/^[\/.]+/, ''), this.baseUrl);
            new URLSearchParams(path.query).forEach((v, k) => u.searchParams.append(k, v));
        } else {
            u = new URL(path.replace(/^[\/.]+/, ''), this.baseUrl);
        }
        if (this.additionalQueries) {
            Object.keys(this.additionalQueries).forEach((k) => u.searchParams.append(k, this.additionalQueries[k]));
        }
        return u.toString();
    }
}

export { Method, Path } from './REST';
export { REST };
export default REST;
