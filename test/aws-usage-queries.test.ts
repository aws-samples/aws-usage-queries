// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { expect as expectCDK, matchTemplate, MatchStyle, haveResourceLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AwsUsageQueries from '../lib/aws-usage-queries';

test("Has tables", () => {
  const app = new cdk.App();
  const stack = new AwsUsageQueries.AwsUsageQueriesStack(app, 'MyTestStack');
   
  expectCDK(stack).to(haveResourceLike("AWS::Glue::Table"));
});
