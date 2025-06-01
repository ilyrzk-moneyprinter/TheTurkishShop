# Cloud Run Deployment Guide for The Turkish Shop

## Overview
This guide explains how to deploy the API server to Google Cloud Run so it can serve traffic on port 8080 as required.

## Prerequisites
- Google Cloud Platform account
- Google Cloud SDK (gcloud) installed and configured
- Docker installed locally

## Environment Variables
Set the following environment variables in the Cloud Run service:

```
# Server Configuration
NODE_ENV=production
PORT=8080

# Email Configuration
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASSWORD=your_resend_api_key
EMAIL_FROM=orders@theturkishshop.com

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Manual Deployment Steps

### 1. Build the Docker image
```bash
docker build -t gcr.io/[PROJECT_ID]/turkishshop .
```

### 2. Push the image to Google Container Registry
```bash
docker push gcr.io/[PROJECT_ID]/turkishshop
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy turkishshop \
  --image=gcr.io/[PROJECT_ID]/turkishshop \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1
```

## Continuous Deployment

For automated deployments, set up a Cloud Build trigger using the included `cloudbuild.yaml` file, which will:

1. Build the Docker image
2. Push it to Container Registry
3. Deploy to Cloud Run

## Troubleshooting

### Container fails to start
Check the logs for specific errors:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=turkishshop" --limit=10
```

### Common issues:
- **Port issues**: Make sure the server listens on `process.env.PORT` (8080 by default)
- **Missing dependencies**: Verify all required modules are listed in package.json
- **Environment variables**: Confirm all required env vars are set in Cloud Run

## Health Checks
Cloud Run performs health checks on the root endpoint (`/`). Ensure that your application responds to GET requests at the root path with a 200 status code. 