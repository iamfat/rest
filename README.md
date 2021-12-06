# @genee/rest

## Usage

```typescript
import REST from '@genee/rest';

type UserData = {
    id: number;
    name: string;
};

class UserService extends REST {
    private token: string;

    construct() {
        super('https://host/base/url/api');
    }

    async init() {
        // you have to use rawRequest
        this.token = await this.rawRequest(this.url('v1/token'));
    }

    // pass inited token to headers in each request
    protected get additionalHeaders() {
        return {
            Authorization: `Bearer ${this.token}`;
        }
    }

    // or pass inited token to queries in each request
    protected get additionalQueries() {
        return {
            token: this.token;
        }
    }
}

(async () => {
    const gateway = new REST('https://host/base/url/api');
    const user = await gateway.post<UserData>('v1/user', {
        name: 'Doe John'
    });
})();
```
