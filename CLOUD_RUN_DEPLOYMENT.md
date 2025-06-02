# Cloud Run Deployment Guide for The Turkish Shop

This document provides instructions for deploying The Turkish Shop application to Google Cloud Run.

## Prerequisites

- Google Cloud SDK installed and configured
- Docker installed locally
- Git repository access
- Google Cloud project with billing enabled

## Environment Setup

1. **Set environment variables:**

```bash
export PROJECT_ID=the-turkish-shop  # Replace with your Google Cloud project ID
export REGION=us-central1           # Replace with your preferred region
```

2. **Configure Google Cloud SDK:**

```bash
gcloud auth login
gcloud config set project $PROJECT_ID
```

## Manual Deployment Process

### Build and Deploy

1. **Build the Docker image locally:**

```bash
docker build -t gcr.io/$PROJECT_ID/turkishshop:latest .
```

2. **Push the image to Google Container Registry:**

```bash
docker push gcr.io/$PROJECT_ID/turkishshop:latest
```

3. **Deploy to Cloud Run:**

```bash
gcloud run deploy turkishshop \
  --image gcr.io/$PROJECT_ID/turkishshop:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

## Continuous Deployment with Cloud Build

The application uses Cloud Build for continuous deployment. When changes are pushed to the repository, Cloud Build automatically:

1. Builds the Docker image
2. Pushes it to Google Container Registry
3. Deploys it to Cloud Run

### Cloud Build Configuration

The `cloudbuild.yaml` file in the repository root defines the CI/CD pipeline.

## Important Notes

### Port Configuration

- Cloud Run expects the application to listen on the port specified by the `PORT` environment variable (default 8080)
- The application must bind to `0.0.0.0` (all interfaces), not just localhost

### Health Checks

- Cloud Run performs health checks to ensure the container is running properly
- A `/_health` endpoint is provided in the application for this purpose

### Environment Variables

The following environment variables can be set in the Cloud Run service:

- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: Set to `8080` for Cloud Run (this is set automatically)
- `RESEND_API_KEY`: API key for the Resend email service
- `EMAIL_FROM`: Sender email address
- `EMAIL_HOST`: SMTP host for sending emails
- `EMAIL_PORT`: SMTP port for sending emails
- `EMAIL_USER`: SMTP user for sending emails
- `EMAIL_PASSWORD`: SMTP password for sending emails

## Troubleshooting

### Container Startup Issues

If the container fails to start, check the Cloud Run logs for errors:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=turkishshop"
```

Common issues:
1. **Port binding issues**: Make sure the app listens on `0.0.0.0:8080`
2. **Dependency issues**: Ensure all dependencies are properly installed
3. **Permissions issues**: Verify service account permissions

### Memory/CPU Limits

If the application crashes due to memory limits, you can increase resources:

```bash
gcloud run services update turkishshop --memory 1Gi --cpu 2
```

## Monitoring and Logging

1. **View application logs:**

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=turkishshop"
```

2. **Monitor service performance:**
   - Go to the Google Cloud Console
   - Navigate to Cloud Run > turkishshop
   - View the Metrics tab

## Rollback Procedure

To rollback to a previous revision:

```bash
gcloud run services update-traffic turkishshop --to-revisions=REVISION_ID=100
```

Replace `REVISION_ID` with the ID of the revision you want to rollback to. 