# Clinical Images Setup Instructions

**Date**: 2025-12-15  
**For**: Phase 1A Infrastructure Setup  
**Estimated Time**: 30 minutes

---

## Overview

You'll set up 3 infrastructure components:
1. ✅ **Redis (Upstash)** - Already done
2. **S3 Bucket (AWS)** - Follow instructions below
3. ✅ **Ably** - Already done

---

## Part 1: S3 Bucket Setup

### What is S3?

Amazon S3 (Simple Storage Service) is cloud storage for files. Think of it like a "cloud folder" where we'll temporarily store uploaded images for 1 hour before they're committed to Medtech.

**Why we need it:**
- Images are too large to store in Redis (Redis is for metadata only)
- Automatically delete old files (lifecycle policy)
- Very cheap (~$0.01/month for your use case)
- Industry standard for temporary file storage

---

### Step-by-Step: Create S3 Bucket

#### **Step 1: Log in to AWS Console**

1. Go to [https://console.aws.amazon.com/](https://console.aws.amazon.com/)
2. Log in with your AWS account credentials
3. In the top search bar, type **"S3"** and click on **S3** (Scalable Storage in the Cloud)

---

#### **Step 2: Create Bucket**

1. Click the orange **"Create bucket"** button (top right)

2. **Bucket name**: Enter exactly this:
   ```
   clinicpro-images-temp
   ```
   ⚠️ **Important**: Bucket names must be globally unique. If this name is taken, try:
   - `clinicpro-images-temp-nz`
   - `clinicpro-images-temp-2025`
   - Or add your initials: `clinicpro-images-temp-abc`

3. **AWS Region**: Select **Asia Pacific (Sydney) ap-southeast-2**
   - This is closest to New Zealand (lower latency)
   - Make note of the region code: `ap-southeast-2`

4. **Object Ownership**: Leave as **"ACLs disabled (recommended)"**

5. **Block Public Access settings**: 
   - ✅ **KEEP ALL CHECKBOXES TICKED** (block all public access)
   - We'll use presigned URLs for secure access (no public access needed)

6. **Bucket Versioning**: Leave **disabled**

7. **Default encryption**: 
   - Select **"Server-side encryption with Amazon S3 managed keys (SSE-S3)"**
   - This encrypts images at rest automatically

8. **Advanced settings**: Leave all defaults

9. Click **"Create bucket"** button at the bottom

✅ **Bucket created!**

---

#### **Step 3: Configure CORS (Cross-Origin Resource Sharing)**

This allows mobile/desktop pages to upload directly to S3.

1. Click on your newly created bucket name (`clinicpro-images-temp`)

2. Go to the **"Permissions"** tab

3. Scroll down to **"Cross-origin resource sharing (CORS)"**

4. Click **"Edit"**

5. **Paste this CORS configuration**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "https://app.clinicpro.co.nz",
      "https://*.clinicpro.co.nz",
      "https://*.vercel.app",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

6. Click **"Save changes"**

✅ **CORS configured!**

---

#### **Step 4: Configure Lifecycle Policy (Auto-Delete Old Files)**

This automatically deletes images older than 1 day (saves storage costs).

1. Still in your bucket, go to the **"Management"** tab

2. Scroll down to **"Lifecycle rules"**

3. Click **"Create lifecycle rule"**

4. **Lifecycle rule name**: Enter:
   ```
   delete-temp-images-after-1-day
   ```

5. **Choose a rule scope**:
   - Select **"Limit the scope of this rule using one or more filters"**
   - In **"Prefix"**, enter: `temp/`
   - This means only files in the `temp/` folder will be auto-deleted

6. **Lifecycle rule actions**:
   - ✅ Check **"Expire current versions of objects"**
   - Enter **1** day

7. Review the summary (should say: "Objects in temp/ expire after 1 day")

8. Click **"Create rule"**

✅ **Lifecycle policy configured!** Old images will auto-delete after 1 day.

---

#### **Step 5: Get AWS Credentials**

The application needs credentials to access S3.

1. In AWS Console search bar, type **"IAM"** → Click **IAM** (Identity and Access Management)

2. In left sidebar, click **"Users"**

3. **Option A: Use existing user** (recommended if you have one)
   - Click on your existing user
   - Go to **"Security credentials"** tab
   - Scroll to **"Access keys"**
   - If you have an existing key, use that
   - If not, continue to Option B

4. **Option B: Create new user** (if no existing user)
   - Click **"Create user"** button
   - **User name**: `clinicpro-s3-uploader`
   - ✅ Check **"Provide user access to the AWS Management Console"** (optional)
   - Click **"Next"**
   - **Permissions**: Select **"Attach policies directly"**
   - Search for **"AmazonS3FullAccess"** and check it
   - Click **"Next"** → **"Create user"**

5. **Create Access Key**:
   - Click on the user (clinicpro-s3-uploader or your existing user)
   - Go to **"Security credentials"** tab
   - Click **"Create access key"**
   - **Use case**: Select **"Application running outside AWS"**
   - Click **"Next"** → **"Create access key"**

6. **⚠️ SAVE THESE CREDENTIALS** (you can't see them again):
   - **Access key ID**: Looks like `AKIAIOSFODNN7EXAMPLE`
   - **Secret access key**: Looks like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
   - Download the CSV file OR copy both values somewhere safe

7. Click **"Done"**

✅ **AWS credentials created!**

---

### Step 6: Add Environment Variables to Vercel

Now we'll add S3 credentials to Vercel so your app can access S3.

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. Click on your **ClinicPro project**

3. Go to **Settings** → **Environment Variables**

4. **Add these 4 variables** (click "Add" for each):

   **Variable 1:**
   - **Key**: `AWS_REGION`
   - **Value**: `ap-southeast-2` (or whatever region you chose)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 2:**
   - **Key**: `AWS_ACCESS_KEY_ID`
   - **Value**: (paste the Access Key ID from Step 5)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 3:**
   - **Key**: `AWS_SECRET_ACCESS_KEY`
   - **Value**: (paste the Secret Access Key from Step 5)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 4:**
   - **Key**: `S3_BUCKET_NAME`
   - **Value**: `clinicpro-images-temp` (or your bucket name)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

5. **Redeploy** (required for env vars to take effect):
   - Go to **Deployments** tab
   - Click **"..."** menu on latest deployment
   - Click **"Redeploy"**
   - Wait for deployment to complete (~2 minutes)

✅ **Environment variables configured!**

---

## Part 2: Install Dependencies

### Install Image Compression Library

1. Open terminal in your project directory

2. Run:
   ```bash
   npm install browser-image-compression
   ```

3. This installs the library for client-side image compression (<1MB target)

4. Commit the change:
   ```bash
   git add package.json package-lock.json
   git commit -m "feat: add browser-image-compression for mobile image upload"
   ```

✅ **Dependencies installed!**

---

## Part 3: Verify Redis Connection

You mentioned you have Redis at `UPSTASH_REDIS_REST_URL=https://unique-stallion-12716.upstash.io`

### Add Redis Environment Variables to Vercel

1. Go to [https://console.upstash.com/](https://console.upstash.com/)

2. Click on your Redis instance (`unique-stallion-12716`)

3. Go to **"REST API"** tab

4. Copy these values:
   - **UPSTASH_REDIS_REST_URL**: `https://unique-stallion-12716.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: (copy the token - looks like `AX12345...`)

5. Add to Vercel:
   - Go to Vercel → Project → Settings → Environment Variables
   - Add variable:
     - **Key**: `UPSTASH_REDIS_REST_URL`
     - **Value**: (paste URL)
     - Save
   - Add variable:
     - **Key**: `UPSTASH_REDIS_REST_TOKEN`
     - **Value**: (paste token)
     - Save

6. **Redeploy** Vercel project (same as Step 6 in S3 setup)

✅ **Redis configured!**

---

## Part 4: Test S3 Setup (Optional but Recommended)

Let's verify S3 is working before writing backend code.

### Create Test Script

Create file: `/scripts/test-s3-connection.ts`

```typescript
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function testS3() {
  const s3Client = new S3Client({ 
    region: process.env.AWS_REGION || 'ap-southeast-2' 
  });

  const bucketName = process.env.S3_BUCKET_NAME || 'clinicpro-images-temp';

  console.log('Testing S3 connection...');
  console.log('Bucket:', bucketName);
  console.log('Region:', process.env.AWS_REGION);

  try {
    // Test 1: List objects (should work even if bucket is empty)
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });
    
    const listResult = await s3Client.send(listCommand);
    console.log('✅ S3 connection successful!');
    console.log('Bucket contains', listResult.KeyCount || 0, 'objects');

    // Test 2: Upload a test file
    const testContent = 'Hello from ClinicPro test script';
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test/connection-test.txt',
      Body: testContent,
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(uploadCommand);
    console.log('✅ Test file uploaded successfully!');
    console.log(`File location: s3://${bucketName}/test/connection-test.txt`);
    
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error);
    return false;
  }
}

testS3();
```

### Install AWS SDK

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Run Test

```bash
npx tsx scripts/test-s3-connection.ts
```

**Expected output:**
```
Testing S3 connection...
Bucket: clinicpro-images-temp
Region: ap-southeast-2
✅ S3 connection successful!
Bucket contains 0 objects
✅ Test file uploaded successfully!
File location: s3://clinicpro-images-temp/test/connection-test.txt
```

✅ **S3 working!**

---

## Summary Checklist

After completing all steps, verify:

- ✅ S3 bucket created: `clinicpro-images-temp`
- ✅ S3 bucket region: `ap-southeast-2`
- ✅ CORS configured (allows uploads from your domains)
- ✅ Lifecycle policy configured (deletes files after 1 day)
- ✅ AWS credentials created (Access Key ID + Secret Access Key)
- ✅ 4 environment variables added to Vercel:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `S3_BUCKET_NAME`
- ✅ 2 Redis environment variables added to Vercel:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- ✅ Vercel project redeployed
- ✅ `browser-image-compression` npm package installed
- ✅ `@aws-sdk/client-s3` npm package installed
- ✅ S3 connection test passed (optional)

---

## Cost Estimate

### S3 Costs (Sydney region)

**Assumptions:**
- 100 concurrent GPs
- 5 images per session
- 1MB per image (after compression)
- 10 sessions per GP per day
- 1-day retention (lifecycle auto-delete)

**Monthly costs:**
- **Storage**: ~500MB average × $0.025/GB = **$0.01/month**
- **PUT requests**: 50,000 uploads × $0.0055/1000 = **$0.28/month**
- **GET requests**: 50,000 retrievals × $0.00044/1000 = **$0.02/month**
- **Data transfer**: Usually free (within AWS)

**Total: ~$0.31/month** (essentially free)

### Redis (Upstash) Costs

**Your current plan:** (check Upstash dashboard)
- Free tier: 10,000 commands/day (likely sufficient)
- If exceeded: ~$0.20 per 100K commands

**Estimated usage:**
- Session CRUD: ~500 commands/day
- Well within free tier

**Total: $0/month**

### Ably Costs

**Free tier:** 
- 200 concurrent connections (you need 100)
- 100,000 messages/day (you need ~5,000)

**Total: $0/month**

### Grand Total: **~$0.31/month** 🎉

---

## Troubleshooting

### Issue: "Bucket name already taken"

**Solution**: Bucket names are globally unique. Add suffix:
- `clinicpro-images-temp-nz`
- `clinicpro-images-temp-2025`

Remember to update `S3_BUCKET_NAME` env var in Vercel!

---

### Issue: "Access Denied" when uploading

**Possible causes:**
1. AWS credentials not set in Vercel → Check environment variables
2. IAM user missing permissions → Give user `AmazonS3FullAccess` policy
3. Vercel not redeployed after adding env vars → Redeploy

---

### Issue: CORS error in browser

**Possible causes:**
1. CORS policy not set on bucket → Re-check Step 3
2. Origin not in allowed list → Add your domain to `AllowedOrigins` array

---

### Issue: "Bucket not found"

**Possible causes:**
1. Bucket name typo in env var → Double-check `S3_BUCKET_NAME`
2. Wrong region → Bucket must be in `ap-southeast-2` or match `AWS_REGION` env var

---

## Next Steps

Once setup is complete:

1. **Reply to this thread**: "Setup complete! Ready for backend implementation."

2. **I will then implement:**
   - Redis session manager
   - 6 new API endpoints in `/app/api/(integration)/medtech/session/`
   - Mobile page with 4 screens
   - Desktop Ably listener

3. **Estimated implementation time:** 6-8 hours

---

## Questions?

If you run into issues during setup:
- Take a screenshot of the error
- Note which step you're on
- Share in this thread

I'll help troubleshoot!

---

**End of Setup Instructions**
