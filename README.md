# HTTP Caching

## What is cache?

A hardware or software component that stores data so that future requests for that data can be served faster. The data stored in a cache might be the result of an earlier computation or a copy of data stored elsewhere.

## Why do we need a cache?

The performance of websites and applications can be significantly improved by reusing previously fetched resources. Web caches reduce latency and network traffic and thus lessen the time needed to display a representation of a resource.

Let's look at a typical server-client setup.

<p align="center">
  <img width="300" height="150" src="https://res.cloudinary.com/dhtwxe58j/image/upload/v1632165999/HTTP-Caching/typical_server_prjcxk.png" />
</p>

The client request some data from the server, the server works on it and returns a response to the client. But, this is not optimal for performance and we can do better. Let's see how.

## How can we control caching?

We can do that by using the `Cache-Control` header field. We can use this header to define the caching policies with the variety of directives it provides. Let's look at some of them.

### No cache

This directive disables all the caching of client requests or server responses. Every request will hit the server and the full response is downloaded every time.

```js
Cache-Control: no-store
```

### Cache but revalidate

This directive is interesting, the cache-store will validate the staleness of the cache with the origin server and if unchanged the cached version is returned to the client.

```js
Cache-Control: no-cache
```

<p align="center">
  <img width="300" height="170" src="https://res.cloudinary.com/dhtwxe58j/image/upload/v1632166015/HTTP-Caching/revalidate_xs8afh.png" />
</p>

### Public and Private

The `Public` directive indicates that the response may be cached by any cache. Useful for caching assets like web fonts, images, style sheet

```js
Cache-Control: public
```

The `Private` directive indicates that the response is intended for a single user only and must not be stored by a shared cache.

```js
Cache-Control: private
```

### Expiration

We can also specifically control the maximum amount of time a resource is considered **_"fresh"_**. This directive is relative to the time of the request.

```js
Cache-Control: max-age=<seconds>
```

### Validation

The cache store must verify the status stale with the origin server before using the cached resource.

So what is the difference with `no-cache directive? The important distinction is when the`no-cache`directive is used the cache-store will return the cached resource even if the origin server fails to validate the staleness of the cache, whereas if`must-revalidate directive is used, and if the origin server fails to validate the staleness of a cached resource, a `504` error is thrown and the stale resource is not used by the client.

Thus `must-revalidate` should be used only for critical transactions.
_(there is a better way to handle this cache and we'll see later)_

Okay, that's a lot of theory let's see how this all works.

## Playing around with caching headers

We have a simple web server that returns some HTML content. It has two pages, _Home_ and _Team_. Currently, there is no caching setup.

When we check the networks tab and try switching between the two pages, we can see around 180KB of data being transferred between the client and the server.

Let's try adding some different caching headers.

### Don't cache anything

Let's try disabling the cache of the `teams` page,

```js
Cache-Control: no-store
```

Nothing much changed, or is it? Let's try clicking on the back and forward navigation buttons in the browser and check the networks tab. Surprised?. We control our cache now!

### Cache for some time

Let's try caching the `teams` page for 10 seconds,

```js
Cache-Control: max-age=10
```

## Freshness

Caching keeps the performance of the website fast and makes the website responsive. But, as the famous saying, caching is hard if not done right.

As we want the website to be fast and responsive, we also want our users to consume fresh data and not consume stale data. So how do we make sure the cache stays fresh and is not stale?

There are multiple ways, we are going to look at **ETag**.

### ETag

ETag, which is part of the HTTP response header, is an identifier for a specific version of a resource.

If an ETag is set the client will send a special request header `If-None-Match` on the next request. The value of this is the ETag the client received on the previous request.

Let's look at how this works.

We can quickly generate an ETag using MD-5 hash. And we'll add it to the team's route.

```js
const cryto = require("crypto");

const etag = crypto.createHash("md5").update(content).digest("hex");
```

If we check the networks tab, we can see that the server response has an `ETag` in the response headers. And if we refresh the page again the client sends the `If-None-Match` header in the request headers. Let's see how we can use that and cache resources and as well as keep the cached resources fresh.

The browser sends the `ETag` back to the server. The server can use this to compare with the `ETag` generated at the server and validate that the cached resource is valid or stale. If it's valid, let the client serve the cached resource else send the new response and with the newly generated `Etag` for the fresh resource.

```js
const etagFromClient = req.headers["if-none-match"]; // get the header from the request

if (etag === etagFromClient) {
  return res.writeHead(304).end(); // if the content is fresh and not stale, send a 304 status to the client stating the content is fresh and serve from the cache
}
```

If the cached resource is not stale, the server asks the client to use the cached resource and does not send the full response payload.

Checking the network tab confirms that the whole payload is not sent over the network, and the payload size has gone from **_180KB_** to **_113B_** 🤯.

(there is a package to generate ETag, so no need to memorize this above syntax to generate ETags. And if we use `express` as our server, it generates `ETag` by default for all the endpoints, and also validates the version of cached resource if the request has `If-None-Match` header in the request)

## Stale While Revalidate

### Problem with ETag

The problem with ETag is to validate the staleness of a cached resource the client/cache store has to reach the origin server to verify the ETag, but if the server is another "Global" region, or the server is just slow we are not gaining much performance by just relying on the ETag, sure we're transferring fewer data over the wire, but we don't gain much performance and the website will not feel "snappy".

This is where CDN comes in. What CDN does is take the resources from the origin server and keep the resources close to the users across the "global" regions, so the latency will be low and with proper cache configurations, the CDN will not even check the origin server before delivering content to the client. Let's see how.

I have not disclosed another `Cache-Control` directive yet.

### s-maxage

`max-age` directive is used by `private` cache stores (the client), but we can also cache the resources in a CDN. We can get a question if the resources can be cased at the client, why do we need a CDN? One of the obvious reasons is we can purge a CDNs cache, but we have no control over the user's client cache. If a bad resource is cached indefinitely at the client, there is no way to purge it unless it is done by the user. So how do we cache it at the CDN?

CDNs come under the cache-store category of `shared` caches (shared between multiple users), and `s-maxage` controls the "freshness" of a source in a shared cache-store.

### How does it help?

<p align="center">
  <img width="470" height="270" src="https://res.cloudinary.com/dhtwxe58j/image/upload/v1632166026/HTTP-Caching/stale_while_revalidate_xggbwa.png" />
</p>

When the server is busy working to generate a new document with updated information, the CDN marks the resource as `STALE` and sends back the stale response to the user so that the user has something to look at till the CDNs cache is updated with the "Fresh" resource. The next user visiting will get the updated resources from the CDN.

This type of caching is great when the content of the resources won't change frequently, but we're giving an option that even though it changes it'll not be stale for a long time!

![MDN Cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching/http_cache_type.png)

## Reference Links

- [Remix Run - Introduction to HTTP Caching by Ryan Florence](https://www.youtube.com/watch?v=3XkU_DXcgl0&t=1s)
- [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Difference between `no-cache` and `must-revalidate`](https://stackoverflow.com/questions/18148884/difference-between-no-cache-and-must-revalidate)
- [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
- [Stale While Revalidate](https://web.dev/stale-while-revalidate/)
