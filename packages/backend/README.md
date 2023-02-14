# How to access developer API portal
To access the generated OpenAPI developer console, simply open your browser to `localhost:<BACKEND_PORT>/api`.
By default, in `env.Sample`, the backend port is `localhost:6000`, so it should be available at:

[http://localhost:6000/api](http://localhost:6000/api)

# Authentication
Most of the endpoints are not accessible to regular HTTP requests without an `Authorization: Bearer <some token here>`. As such,
in order to actually run these endpoints, a client must authenticate first. Typically, this would be done through the UI with
an `email` and `password`, and that would get passed to `/auth/login`. If the user wants to create an account, it would be passed
to `/auth/signup`. These two endpoints return a [JWT](https://jwt.io/introduction) which the client will need to add to the HTTP
headers in `Authorization: Bearer <JWT>` replacing `<JWT>` with the JWT returned by the server. These JWT's also don't last forever,
and have an expiration. As such, the client will need to periodically request a new JWT from the server through `/auth/refresh`.
As long as the current JWT is not expired, this refresh endpoint will return a new JWT and expiration. It is the client's responsibility
to ensure that the JWTs don't expire, and if they do, the user will have to log back in again. Ideally, one would not store an email/password
in plain-text in the browser, so you should attempt to store these JWTs in cookies so that the user does not have to re-login. In the future,
I will probably add a long-term JWT that will last longer than a couple of minutes so that re-logging in is minimized.

In the developer portal, there is a small green button at the top right titled "Authorized" and if you click it, you are able to type
in a bearer token to "authenticate yourself". Ideally, you want to do this as little as possible during development, so in `/.env`
you can increase the time of `JWT_EXPIRE_SEC` to something more suitable. The server will let you know when you make a request with
an expired JWT.

# Generated OpenAPI definitions
When running `make` in the root directory, multiple docker containers will start up. One of the conatiners, `backend`,
will start up the backend server. This server, will restart on save with new changes, and every time that the server
starts/restarts, it will spit out a `proflow_openapi.json` OpenAPI spec, that is located in `/packages/frontend/.generated/proflow_openapi.json`.
This is then used in the `frontend` container which will generate the directory `/packages/frontend/src/proflow`, containing an HTTP client.
Saving changes to the server _should_ update this client every time, and catch errors. Sometimes, the watcher is a bit too aggressive, and so,
you might have to go in manually to re-save a file in frontend to "refresh" it. I don't feel like investing the time to fix this :/
