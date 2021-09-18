# HTTP Caching

## What is cache?

A harware or software component that stores data so that future requests for that data can be served faster. The data stored in a cache might be the result of an earlier computation or a copy of data stored elsewhere.

## Why do we need a cache?

The performance of web sites and applications can be significantly improved by reusing previously fetched resources. Web caches reduce latency and network traffic and thus lessen the time needed to display a representation of a resource.

Let's look at a typical server-client setup.

<p align="center">
  <img width="300" height="150" src="./assets/typical_server.png" />
</p>

The clent request some data from the server, the server works on it and returns a response to the client. But, this is not optimal for performance and we can do better. Let's see how.

## How can we control caching?

We can do that by using the `Cache-Control` header field. We can use this header to define the caching policies with the variety of directives it provides. Let's look at some of them.

### No cache

This directive disables all the caching of client request or server response. Every request will hit the server and the full response is downloaded each and every time.

```js
Cache-Control: no-store
```

### Cache but revalidate

This directive is interesting, the cache store will validate the staleness of the cache with the origin server and if unchanged the cached version is returned to the client.

```js
Cache-Control: no-cache
```

<p align="center">
  <img width="300" height="150" src="./assets/revalidate.png" />
</p>

### Public and Private

Public directive indicates that the response may be cached by any cache. Usefull for caching assets like web fonts, images, style sheet

```js
Cache-Control: public
```

Private directive indicates that the response is intended for a single user only and must not be stored by a shared cache.

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

So what is the deference with `no-cache` directive? The important distinction is, when `no-cache` directive is used the cache store will return the cached resource even if the origin server fails to validate the staleness of the cache, where as if `must-revalidate` directive is used, and if the origin server fails to validate the staleness of a cached resource, a `504` error is thrown and the stale resource is not used by the client.

Thus `must-revalidate` should be used only for critical transactions only.
_(there is a better way to handle this cache and we'll see later)_

Okay, that's a lot of theory let's see how this all work.

![MDN Cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching/http_cache_type.png)

## Reference Links

- [Remix Run - Introduction to HTTP Caching by Ryan Florence](https://www.youtube.com/watch?v=3XkU_DXcgl0&t=1s)
- [MDN HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Difference between `no-cache` and `must-revalidate`](https://stackoverflow.com/questions/18148884/difference-between-no-cache-and-must-revalidate)
