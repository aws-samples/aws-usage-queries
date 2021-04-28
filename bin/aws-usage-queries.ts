#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsUsageQueriesStack } from '../lib/aws-usage-queries';

const app = new cdk.App();
new AwsUsageQueriesStack(app, 'AwsUsageQueriesStack');
