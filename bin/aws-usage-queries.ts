#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib'
import { AwsUsageQueriesStack } from '../lib/aws-usage-queries';

const app = new App();
new AwsUsageQueriesStack(app, 'AwsUsageQueriesStack');
