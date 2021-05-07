#!/bin/bash
set -e

npm install -g aws-cdk
npm install -g cdk-assets
npm install
npm run test
npm run build
cdk synth > /dev/null

# change assets' locations to the staging bucket
python3 build/transform.py \
    cdk.out/AwsUsageQueriesStack.assets.json \
    cdk.out/AwsUsageQueriesStack.template.json \
    $ARTIFACT_BUCKET_NAME \
    $VERSION \
    $CODEBUILD_BUILD_NUMBER \
    $CODEBUILD_RESOLVED_SOURCE_VERSION

# publish assets to the bucket written to the assets.json template
cdk-assets publish -p cdk.out/assets.json

# publish the SAM application
sam publish --template-file cdk.out/template.yaml --region $AWS_DEFAULT_REGION
