#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CloudWatchSyntheticsStack } from "../lib/cdk-stack";

import { env } from "../env";

const app = new cdk.App();
new CloudWatchSyntheticsStack(app, "ses-cw-synthetics", {
  env: {
    account: env.accountID,
  },
  description: env.description,
});
