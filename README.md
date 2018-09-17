# multipart-raw-body

Demo of a simple Express server that uses an Express middleware function to capture a raw `multipart/related` body to a file and uses `formidable` to process the same request body into fields & files.

To run the server:

```
npm i
npm run dev
```

To call the server:
```
node test/test-post
```
