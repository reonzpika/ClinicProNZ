# Clinical Images Feature Setup

## Overview
The clinical images feature allows GPs to upload clinical photos via mobile devices, with automatic AI analysis and secure storage in AWS S3.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# AWS Configuration (NZ Region for Privacy Act 2020 compliance)
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=your-clinical-images-bucket
```

## AWS Setup Checklist

### 1. Create S3 Bucket
```bash
# Create bucket in NZ region
aws s3 mb s3://your-clinical-images-bucket --region ap-southeast-2

# Enable server-side encryption
aws s3api put-bucket-encryption \
  --bucket your-clinical-images-bucket \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'
```

### 2. Configure CORS Policy
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Set Lifecycle Policy (Auto-expire after 1 hour)
```json
{
  "Rules": [
    {
      "ID": "clinical-images-expiry",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "consultations/"
      },
      "Expiration": {
        "Days": 1
      }
    }
  ]
}
```

### 4. Create IAM User with Minimal Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::your-clinical-images-bucket/consultations/*"
    }
  ]
}
```

## Development Testing

1. **Test Upload Endpoint:**
```bash
curl "http://localhost:3000/api/uploads/presign?filename=test.jpg&mimeType=image/jpeg&patientSessionId=test-123"
```

2. **Test Download Endpoint:**
```bash
curl "http://localhost:3000/api/uploads/download?key=consultations/test-123/image.jpg"
```

## Features Implemented

✅ **Database Schema**: Added `clinical_images` field to `patient_sessions` table
✅ **Context Integration**: Extended ConsultationContext with image management
✅ **API Endpoints**: Presigned URLs for upload/download
✅ **Desktop UI**: Integrated with AdditionalNotes component
✅ **Client-side Resizing**: Images resized to max 1024px before upload
✅ **Privacy Compliance**: NZ region, auto-expiry, encryption

## Next Steps (Optional)

### Mobile Integration
- Extend `/mobile` page with camera capture
- Real-time sync with desktop via Ably

### AI Analysis
- AWS Lambda function for image analysis
- OpenAI GPT-4V integration for clinical descriptions
- Auto-update descriptions in database

### Enhanced Features
- Image annotations/drawings
- Multiple image selection
- Progress indicators for uploads
- Thumbnail generation

## Troubleshooting

**Upload fails with CORS error:**
- Check CORS policy includes your domain
- Verify bucket region matches environment variable

**Authentication errors:**
- Ensure IAM user has correct permissions
- Check AWS credentials in environment variables

**Images not expiring:**
- Verify lifecycle policy is applied
- Check object prefix matches "consultations/"
