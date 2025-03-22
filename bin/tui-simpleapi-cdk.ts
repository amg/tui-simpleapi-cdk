#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TuiStack } from '../lib/tui-stack';

const app = new cdk.App();
new TuiStack(app, 'TuiStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});