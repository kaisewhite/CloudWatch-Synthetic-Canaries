import { env } from "../env";
import * as cdk from "@aws-cdk/core";
import { IAMPolicyStack, IAMRoleStack } from "../modules/iam/index";
import { s3BucketPolicies, s3Bucket, s3BucketImportGrantAccess } from "../modules/s3/index";
import { CloudWatchSyntheticsCanaryStack, CloudWatchAlarmsStack } from "../modules/cloudwatch/index";

export class CloudWatchSyntheticsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * NESTED STACKS
     */

    const stack1 = new IAMPolicyStack(this, "IAM-Policy"); // Creates IAM Policies
    const stack2 = new IAMRoleStack(this, "IAM-Role"); // Creates IAM Roles
    const stack3 = new s3Bucket(this, "s3"); // Creates s3 Buckets
    const stack4 = new s3BucketPolicies(this, "s3-Bucket-Policy"); // Creates S3 Bucket Policies
    //const stack5 = new s3BucketImportGrantAccess(this, "s3BucketImportGrantAccess"); // Imports an existing bucket and grants an IAM role access
    const stack6 = new CloudWatchSyntheticsCanaryStack(this, "Cw-Syn-Canary"); // Creates Canaries
    const stack7 = new CloudWatchAlarmsStack(this, "Cw-Alarm");

    stack2.addDependency(stack1);
    stack3.addDependency(stack2);
    stack4.addDependency(stack3);
    //stack5.addDependency(stack4);
    stack6.addDependency(stack4);
    stack7.addDependency(stack6);

    /**
     * SINGLE STACKS
     */
    //new VPCStack(this, "VPCStack", { env: { region: env.region } }); //non nested
  }
}

const app = new cdk.App();
new CloudWatchSyntheticsStack(app, "ses-cw-synthetics", {
  env: { region: env.region },
  description: env.description,
});
app.synth();
