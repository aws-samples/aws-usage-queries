import { Code, Function, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { IBucket } from '@aws-cdk/aws-s3';
import { Construct, CustomResource, Duration, RemovalPolicy } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';
import { AwsCliLayer } from '@aws-cdk/lambda-layer-awscli';

import path = require('path');

export interface LayerBucketDeploymentProps {

    /**
     * the asset path to the resources to deploy.
     */
    readonly source: string;

    /**
     * the bucket to deploy to.
     */
    readonly destinationBucket: IBucket;

    /**
     * Should the whole bucket be wiped during deployment and custom resource deletion?
     *
     * Be aware that this will wipe everything in this bucket. Thus, never point to a bucket
     * which contains data that must not get lost.
     *
     * @default false
     */
    readonly wipeWholeBucket?: boolean;

}

/**
 * Deploys the source data to an Amazon S3 bucket.
 *
 * In contrast to the @aws-cdk/aws-s3-deployment.BucketDeployment
 * it uses an AWS Lambda layer because this code also needs to be distributed via the
 * AWS Serverless Application Repository which does not support CDK's S3 assets.
 */
export class LayerBucketDeployment extends Construct {

    constructor(scope: Construct, id: string, props: LayerBucketDeploymentProps) {

        super(scope, id);

        const assetLayer = new LayerVersion(this, "AssetCodelayer", {
            code: Code.fromAsset(path.join(__dirname, '..', 'lambda', 'layer-bucket-deployment')),
        })

        const bucketDeplomentFn = new Function(this, "BucketDeplomentFn", {
            code: Code.fromAsset(props.source),
            handler: "deploy.on_event",
            runtime: Runtime.PYTHON_3_7,
            timeout: Duration.minutes(1),
            memorySize: 512,
            layers: [
                assetLayer,
                new AwsCliLayer(this, "CliLayer")
            ],
            currentVersionOptions: { removalPolicy: RemovalPolicy.DESTROY },
            logRetention: RetentionDays.ONE_DAY
        });

        const deploymentProvider = new Provider(this, 'BucketDeploymentProvider', {
            onEventHandler: bucketDeplomentFn,
            logRetention: RetentionDays.ONE_DAY
        });

        new CustomResource(this, "DeploymentCustomResource", {
            serviceToken: deploymentProvider.serviceToken,
            properties: {
                bucketName: props.destinationBucket.bucketName,
                // include version here to have the custom
                // resource updated on a function/ asset change
                dummyVersion: bucketDeplomentFn.currentVersion.version,
                wipeWholeBucket: props.wipeWholeBucket
            }
        })

        props.destinationBucket.grantReadWrite(bucketDeplomentFn);

    }

}
