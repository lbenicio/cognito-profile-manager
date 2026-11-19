# Cloudflare R2 uploads

Profile pictures and banners are uploaded to Cloudflare R2 using short-lived S3-compatible presigned URLs. The current implementation builds the endpoint from `R2_ACCOUNT_ID` and is configured for R2.

## Configure a bucket

1. Create an R2 bucket and an access key with the permissions needed to write objects to that bucket.
2. Configure the bucket or a custom domain so uploaded assets can be read from the browser.
3. Set the following variables on the server:

   ```dotenv
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_BUCKET_NAME=your-bucket
   NEXT_PUBLIC_R2_PUBLIC_URL=https://assets.example.com
   ```

4. If the browser uploads directly to R2 from a different origin, configure bucket CORS to allow that app origin and the required signed `PUT` requests.

The app accepts JPEG, PNG, and WebP images up to 2 MiB. Upload URLs expire after 60 seconds. Keep R2 credentials server-side; `NEXT_PUBLIC_R2_PUBLIC_URL` is intentionally public.

See the [environment reference](../getting-started/configuration.md) for other optional services.
