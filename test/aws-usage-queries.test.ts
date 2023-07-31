// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Template } from 'aws-cdk-lib/assertions';
import * as AwsUsageQueries from '../lib/aws-usage-queries';
import { App } from 'aws-cdk-lib';

test("Has tables", () => {
  const app = new App();
  const stack = new AwsUsageQueries.AwsUsageQueriesStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResource("AWS::Glue::Table", {});
});
