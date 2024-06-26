# Dummy data

This directory content makes possible to test custom services cards or create a demo without actually running the service.
The principle is simple: save a sample output of the API used in the service in a static file in this directory. The path must be identical as the service endpoint to be used seamlessly.

## Start the mock server to expose dummy data

```sh
pnpm mock
```

## How to add a new services sample

- create a directory for your service, and any sub-folder existing in the service api path.
- save the api output in a file named after the service endpoint.

Example:

```sh
mkdir pihole
curl http://my-pihole.me/admin/api.php -o pihole/api.php # /admin is omitted because for PiHole, the implementation expect it to be in the base url (`url` or `endpoint` property)
```
