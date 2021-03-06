import { tick, multiline, installClock, uninstallClock } from '../../utils';
import mockTransport from '../../mocks/transport';

const TransportBatch = saxo.openapi.TransportBatch;

describe('openapi TransportBatch', () => {

    const validBaseUrl = 'localhost/openapi/';
    let transport;
    let transportBatch;
    let auth;
    const currentToken = 'TOKEN';

    beforeEach(() => {
        transport = mockTransport();
        auth = jasmine.createSpyObj('auth', ['getToken']);
        auth.getToken.and.callFake(() => currentToken);
        installClock();

        spyOn(Math, 'random').and.returnValue(0.1);
        if (typeof crypto !== undefined && crypto.getRandomValues) {
            spyOn(crypto, 'getRandomValues');
        }
    });
    afterEach(() => uninstallClock());

    it('requires baseUrl', () => {
        expect(function() {
            transportBatch = new TransportBatch(transport, null, auth, { timeoutMs: 0 });
        }).toThrow();
        expect(function() {
            transportBatch = new TransportBatch(null, validBaseUrl, auth, {});
        }).toThrow();
        expect(function() {
            transportBatch = new TransportBatch(transport, validBaseUrl, null, {});
        }).not.toThrow();
        expect(function() {
            transportBatch = new TransportBatch(transport, validBaseUrl, auth, null);
        }).not.toThrow();
        expect(function() {
            transportBatch = new TransportBatch(transport, validBaseUrl);
        }).not.toThrow();
    });

    it('handles different base url\'s', function() {
        // for this to be valid, open api would have to be hosted at the same level or above on the current server
        expect(() => {
            transportBatch = new TransportBatch(transport, '/', auth);
            expect(transportBatch.timeoutMs).toEqual(0);
        }).toThrow();

        transportBatch = new TransportBatch(transport, 'localhost', auth);
        expect(transportBatch.basePath).toEqual('/');

        transportBatch = new TransportBatch(transport, 'localhost/openapi', auth);
        expect(transportBatch.basePath).toEqual('/openapi/');

        transportBatch = new TransportBatch(transport, 'localhost/openapi/', auth);
        expect(transportBatch.basePath).toEqual('/openapi/');

        transportBatch = new TransportBatch(transport, 'http://localhost/openapi/', auth);
        expect(transportBatch.basePath).toEqual('/openapi/');
    });

    it('defaults to timeout 0', function() {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth);
        expect(transportBatch.timeoutMs).toEqual(0);
    });

    it('overrides timeout', function() {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 9999 });
        expect(transportBatch.timeoutMs).toEqual(9999);
    });

    it('does not batch if only a single call is to be made', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });

        expect(transport.get.calls.count()).toEqual(0);
        expect(transport.post.calls.count()).toEqual(0);

        tick(function() {
            expect(transport.get.calls.count()).toEqual(1);
            expect(transport.post.calls.count()).toEqual(0);
            done();
        });
    });

    it('queues up calls immediately if timeout is 0', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        transportBatch.put('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        transportBatch.post('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        transportBatch.delete('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        transportBatch.patch('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });

        expect(transport.get.calls.count()).toEqual(0);
        expect(transport.put.calls.count()).toEqual(0);
        expect(transport.post.calls.count()).toEqual(0);
        expect(transport.delete.calls.count()).toEqual(0);
        expect(transport.patch.calls.count()).toEqual(0);

        tick(function() {

            expect(transport.post.calls.count()).toEqual(1);
            expect(transport.post.calls.argsFor(0)).toEqual(['port', 'batch', null, { headers: { 'Content-Type': 'multipart/mixed; boundary="00000000-0000-0000-0000-000000000000"' },
                body: multiline('--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 0',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'PUT /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 1',
                'Authorization: TOKEN',
                'Content-Type: application/json; charset=utf-8',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'POST /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 2',
                'Authorization: TOKEN',
                'Content-Type: application/json; charset=utf-8',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'DELETE /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 3',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'PATCH /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 4',
                'Authorization: TOKEN',
                'Content-Type: application/json; charset=utf-8',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000--',
                ''),
                cache: false }]);

            expect(transport.get.calls.count()).toEqual(0);
            expect(transport.put.calls.count()).toEqual(0);
            expect(transport.delete.calls.count()).toEqual(0);
            expect(transport.patch.calls.count()).toEqual(0);
            done();
        });
    });

    it('queues up calls and executes after the timeout if the timeout is not 0', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 10 });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        transportBatch.put('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });

        jasmine.clock().tick(5);

        transportBatch.post('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        transportBatch.delete('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });

        jasmine.clock().tick(9);

        expect(transport.get.calls.count()).toEqual(0);
        expect(transport.put.calls.count()).toEqual(0);
        expect(transport.post.calls.count()).toEqual(0);
        expect(transport.delete.calls.count()).toEqual(0);

        tick(function() {

            expect(transport.post.calls.count()).toEqual(1);
            expect(transport.post.calls.argsFor(0)).toEqual(['port', 'batch', null, { headers: { 'Content-Type': 'multipart/mixed; boundary="00000000-0000-0000-0000-000000000000"' },
                body: multiline('--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 0',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'PUT /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 1',
                'Authorization: TOKEN',
                'Content-Type: application/json; charset=utf-8',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'POST /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 2',
                'Authorization: TOKEN',
                'Content-Type: application/json; charset=utf-8',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'DELETE /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 3',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000--',
                ''),
                cache: false }]);

            expect(transport.get.calls.count()).toEqual(0);
            expect(transport.put.calls.count()).toEqual(0);
            expect(transport.delete.calls.count()).toEqual(0);
            done();
        });
    });

    it('accepts an object or a string in the body argument', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        transportBatch.put('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' }, { body: { test: true, str: 'str' } });
        transportBatch.put('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518825, Type: 'CfdOnFutures' }, { body: '{ "test": true, "str": "str" }' });

        expect(transport.put.calls.count()).toEqual(0);
        expect(transport.post.calls.count()).toEqual(0);

        tick(function() {

            expect(transport.post.calls.count()).toEqual(1);
            expect(transport.post.calls.argsFor(0)).toEqual(['port', 'batch', null, { headers: { 'Content-Type': 'multipart/mixed; boundary="00000000-0000-0000-0000-000000000000"' },
                body: multiline('--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'PUT /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 0',
                'Authorization: TOKEN',
                'Content-Type: application/json; charset=utf-8',
                'Host: localhost:8081',
                '',
                '{"test":true,"str":"str"}',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'PUT /openapi/port/ref/v1/instruments/details/1518825/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 1',
                'Authorization: TOKEN',
                'Content-Type: application/json; charset=utf-8',
                'Host: localhost:8081',
                '',
                '{ "test": true, "str": "str" }',
                '--00000000-0000-0000-0000-000000000000--',
                ''),
                cache: false }]);

            expect(transport.put.calls.count()).toEqual(0);
            done();
        });
    });

    it('allows not having any authentication passed in and picks it up off the calls', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, null, { timeoutMs: 0 });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' }, { headers: { Authorization: 'TOKEN1', MyHeader: 'true' } });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518825, Type: 'CfdOnFutures' }, { headers: { Authorization: 'TOKEN2' } });

        expect(transport.put.calls.count()).toEqual(0);
        expect(transport.post.calls.count()).toEqual(0);

        tick(function() {

            expect(transport.post.calls.count()).toEqual(1);
            expect(transport.post.calls.argsFor(0)).toEqual(['port', 'batch', null, { headers: { 'Content-Type': 'multipart/mixed; boundary="00000000-0000-0000-0000-000000000000"' },
                body: multiline('--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518824/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 0',
                'MyHeader: true',
                'Authorization: TOKEN2',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518825/CfdOnFutures HTTP/1.1',
                'X-Request-Id: 1',
                'Authorization: TOKEN2',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000--',
                ''),
                cache: false }]);

            expect(transport.get.calls.count()).toEqual(0);
            done();
        });
    });

    it('processes the batch response', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        const getPromise = transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const putPromise = transportBatch.put('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const postPromise = transportBatch.post('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const deletePromise = transportBatch.delete('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const patchPromise = transportBatch.delete('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });

        tick(function() {
            expect(transport.post.calls.count()).toEqual(1);

            transport.postResolve({ status: 200,
                response: multiline(
                    '--00000000-0000-0000-0000-000000000000',
                    'Content-Type: application/http; msgtype=response',
                    '',
                    'HTTP/1.1 200 OK',
                    'Location: ',
                    'X-Request-Id: 0',
                    'Access-Control-Allow-Origin: http://computor.sys.dom',
                    'Access-Control-Allow-Credentials: true',
                    'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                    'Content-Type: application/json; charset=utf-8',
                    '',
                    '{ "mydata": "get"}',
                    '--00000000-0000-0000-0000-000000000000',
                    'Content-Type: application/http; msgtype=response',
                    '',
                    'HTTP/1.1 200 Okay',
                    'Location: ',
                    'X-Request-Id: 1',
                    'Access-Control-Allow-Origin: http://computor.sys.dom',
                    'Access-Control-Allow-Credentials: true',
                    'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                    'Content-Type: application/json; charset=utf-8',
                    '',
                    '{ "mydata": "put"}',
                    '--00000000-0000-0000-0000-000000000000',
                    'Content-Type: application/http; msgtype=response',
                    '',
                    'HTTP/1.1 201 Created',
                    'Location: ',
                    'X-Request-Id: 2',
                    'Access-Control-Allow-Origin: http://computor.sys.dom',
                    'Access-Control-Allow-Credentials: true',
                    'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                    'Content-Type: application/json; charset=utf-8',
                    '',
                    '{ "mydata": "post"}',
                    '--00000000-0000-0000-0000-000000000000',
                    'Content-Type: application/http; msgtype=response',
                    '',
                    'HTTP/1.1 200 Okay',
                    'Location: ',
                    'X-Request-Id: 3',
                    'Access-Control-Allow-Origin: http://computor.sys.dom',
                    'Access-Control-Allow-Credentials: true',
                    'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                    'Content-Type: application/json; charset=utf-8',
                    '',
                    '{ "mydata": "delete"}',
                    '--00000000-0000-0000-0000-000000000000',
                    'Content-Type: application/http; msgtype=response',
                    '',
                    'HTTP/1.1 200 Okay',
                    'Location: ',
                    'X-Request-Id: 4',
                    'Access-Control-Allow-Origin: http://computor.sys.dom',
                    'Access-Control-Allow-Credentials: true',
                    'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                    'Content-Type: application/json; charset=utf-8',
                    '',
                    '{ "mydata": "patch"}',
                    '--00000000-0000-0000-0000-000000000000--',
                    ''
            ) });

            const getThen = jasmine.createSpy('getThen');
            const putThen = jasmine.createSpy('putThen');
            const postThen = jasmine.createSpy('postThen');
            const deleteThen = jasmine.createSpy('deleteThen');
            const patchThen = jasmine.createSpy('deleteThen');

            getPromise.then(getThen);
            putPromise.then(putThen);
            postPromise.then(postThen);
            deletePromise.then(deleteThen);
            patchPromise.then(patchThen);

            tick(function() {
                expect(getThen.calls.count()).toEqual(1);
                expect(getThen.calls.argsFor(0)).toEqual([{ status: 200, response: { 'mydata': 'get' } }]);

                expect(putThen.calls.count()).toEqual(1);
                expect(putThen.calls.argsFor(0)).toEqual([{ status: 200, response: { 'mydata': 'put' } }]);

                expect(postThen.calls.count()).toEqual(1);
                expect(postThen.calls.argsFor(0)).toEqual([{ status: 201, response: { 'mydata': 'post' } }]);

                expect(deleteThen.calls.count()).toEqual(1);
                expect(deleteThen.calls.argsFor(0)).toEqual([{ status: 200, response: { 'mydata': 'delete' } }]);

                expect(patchThen.calls.count()).toEqual(1);
                expect(patchThen.calls.argsFor(0)).toEqual([{ status: 200, response: { 'mydata': 'patch' } }]);

                done();
            });
        });
    });

    it('passes on failures', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        const getPromise = transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const putPromise = transportBatch.put('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const postPromise = transportBatch.post('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const deletePromise = transportBatch.delete('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const patchPromise = transportBatch.patch('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });

        tick(function() {
            expect(transport.post.calls.count()).toEqual(1);

            transport.postReject({ status: 400 });

            const getCatch = jasmine.createSpy('getCatch');
            const putCatch = jasmine.createSpy('putCatch');
            const postCatch = jasmine.createSpy('postCatch');
            const deleteCatch = jasmine.createSpy('deleteCatch');
            const patchCatch = jasmine.createSpy('patchCatch');

            getPromise.catch(getCatch);
            putPromise.catch(putCatch);
            postPromise.catch(postCatch);
            deletePromise.catch(deleteCatch);
            patchPromise.catch(patchCatch);

            tick(function() {

                // we reject the promise with nothing, which somes through as undefined.
                // put in here in case it changes and we decide to reject with something
                expect(getCatch.calls.count()).toEqual(1);
                expect(getCatch.calls.argsFor(0)).toEqual([{ status: 400 }]);

                expect(putCatch.calls.count()).toEqual(1);
                expect(putCatch.calls.argsFor(0)).toEqual([{ status: 400 }]);

                expect(postCatch.calls.count()).toEqual(1);
                expect(postCatch.calls.argsFor(0)).toEqual([{ status: 400 }]);

                expect(deleteCatch.calls.count()).toEqual(1);
                expect(deleteCatch.calls.argsFor(0)).toEqual([{ status: 400 }]);

                expect(patchCatch.calls.count()).toEqual(1);
                expect(patchCatch.calls.argsFor(0)).toEqual([{ status: 400 }]);

                done();
            });
        });
    });

    it('detects a non 2xx status code as a rejection', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        const getPromise = transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const get304Promise = transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const putPromise = transportBatch.put('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const postPromise = transportBatch.post('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const deletePromise = transportBatch.delete('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });
        const patchPromise = transportBatch.delete('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: 'CfdOnFutures' });

        tick(function() {
            expect(transport.post.calls.count()).toEqual(1);

            transport.postResolve({ status: 200,
                response: multiline(
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=response',
                '',
                'HTTP/1.1 199 Some Error',
                'Location: ',
                'X-Request-Id: 0',
                'Access-Control-Allow-Origin: http://computor.sys.dom',
                'Access-Control-Allow-Credentials: true',
                'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                'Content-Type: application/text; charset=utf-8',
                '',
                'Some error',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=response',
                '',
                'HTTP/1.1 304 Not Modified',
                'Location: ',
                'X-Request-Id: 1',
                'Access-Control-Allow-Origin: http://computor.sys.dom',
                'Access-Control-Allow-Credentials: true',
                'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=response',
                '',
                'HTTP/1.1 300 Multiple Choices',
                'Location: ',
                'X-Request-Id: 2',
                'Access-Control-Allow-Origin: http://computor.sys.dom',
                'Access-Control-Allow-Credentials: true',
                'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                'Content-Type: application/json; charset=utf-8',
                '',
                '{ "mydata": "put"}',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=response',
                '',
                'HTTP/1.1 299 Edge Case',
                'Location: ',
                'X-Request-Id: 3',
                'Access-Control-Allow-Origin: http://computor.sys.dom',
                'Access-Control-Allow-Credentials: true',
                'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                'Content-Type: application/json; charset=utf-8',
                '',
                '{ "mydata": "post"}',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=response',
                '',
                'HTTP/1.1 400 Error',
                'Location: ',
                'X-Request-Id: 4',
                'Access-Control-Allow-Origin: http://computor.sys.dom',
                'Access-Control-Allow-Credentials: true',
                'Access-Control-Expose-Headers: X-Auth-Token,X-Auth-Token-Expiry,X-Auth-Token-Expiry-Minutes,X-Request-Id,WWW-Authenticate,Location,Content-Encoding,ETag,Content-Range',
                'Content-Type: application/json; charset=utf-8',
                '',
                '{ "mydata": "delete"}',
                '--00000000-0000-0000-0000-000000000000--',
                ''
            ) });

            const getCatch = jasmine.createSpy('getCatch');
            const get304Then = jasmine.createSpy('get304Then');
            const putCatch = jasmine.createSpy('putCatch');
            const postThen = jasmine.createSpy('postThen');
            const deleteCatch = jasmine.createSpy('deleteCatch');
            const patchCatch = jasmine.createSpy('patchCatch');

            getPromise.catch(getCatch);
            get304Promise.then(get304Then);
            putPromise.catch(putCatch);
            postPromise.then(postThen);
            deletePromise.catch(deleteCatch);
            patchPromise.catch(patchCatch);

            tick(function() {

                // we reject the promise with nothing, which somes through as undefined.
                // put in here in case it changes and we decide to reject with something
                expect(getCatch.calls.count()).toEqual(1);
                expect(getCatch.calls.argsFor(0)).toEqual([{ status: 199 }]);

                expect(get304Then.calls.count()).toEqual(1);
                expect(get304Then.calls.argsFor(0)).toEqual([{ status: 304 }]);

                expect(putCatch.calls.count()).toEqual(1);
                expect(putCatch.calls.argsFor(0)).toEqual([{ status: 300, response: { mydata: 'put' } }]);

                expect(postThen.calls.count()).toEqual(1);
                expect(postThen.calls.argsFor(0)).toEqual([{ status: 299, response: { mydata: 'post' } }]);

                expect(deleteCatch.calls.count()).toEqual(1);
                expect(deleteCatch.calls.argsFor(0)).toEqual([{ status: 400, response: { mydata: 'delete' } }]);

                // patch is testing what happens when openapi doesn't include the item in the response
                expect(patchCatch.calls.count()).toEqual(1);
                expect(patchCatch.calls.argsFor(0)).toEqual([undefined]);

                done();
            });
        });
    });

    it('uri-encodes arguments', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518824, Type: '&=' });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}/{Type}', { InstrumentId: 1518825, Type: '&=' });

        tick(function() {

            expect(transport.post.calls.count()).toEqual(1);
            expect(transport.post.calls.argsFor(0)).toEqual(['port', 'batch', null, { headers: { 'Content-Type': 'multipart/mixed; boundary="00000000-0000-0000-0000-000000000000"' },
                body: multiline('--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518824/%26%3D HTTP/1.1',
                'X-Request-Id: 0',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518825/%26%3D HTTP/1.1',
                'X-Request-Id: 1',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000--',
                ''),
                cache: false }]);
            done();
        });
    });

    it('supports queryParams', function(done) {
        transportBatch = new TransportBatch(transport, validBaseUrl, auth, { timeoutMs: 0 });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}', { InstrumentId: 1518824 }, { queryParams: { a: 1, b: 2 } });
        transportBatch.get('port', 'ref/v1/instruments/details/{InstrumentId}', { InstrumentId: 1518825 }, { queryParams: { a: '&=' } });

        tick(function() {

            expect(transport.post.calls.count()).toEqual(1);
            expect(transport.post.calls.argsFor(0)).toEqual(['port', 'batch', null, { headers: { 'Content-Type': 'multipart/mixed; boundary="00000000-0000-0000-0000-000000000000"' },
                body: multiline('--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518824?a=1&b=2 HTTP/1.1',
                'X-Request-Id: 0',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000',
                'Content-Type: application/http; msgtype=request',
                '',
                'GET /openapi/port/ref/v1/instruments/details/1518825?a=%26%3D HTTP/1.1',
                'X-Request-Id: 1',
                'Authorization: TOKEN',
                'Host: localhost:8081',
                '',
                '',
                '--00000000-0000-0000-0000-000000000000--',
                ''),
                cache: false }]);
            done();
        });
    });

    it('disposes okay', () => {
        transportBatch = new TransportBatch(transport, validBaseUrl);
        transportBatch.get();
        transportBatch.get();
        transportBatch.dispose();
        expect(transportBatch.queue).toEqual([]);
        expect(transport.dispose.calls.count()).toEqual(1);
        transport.dispose.calls.reset();

        tick(() => {
            expect(transport.post.calls.count()).toEqual(0);
        });
    });
});
