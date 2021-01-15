import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import { env } from "../../env";

export class IAMPolicyStack extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    /**
     *
     */

    const IAMManagedPolicy = new iam.CfnManagedPolicy(this, "IAMManagedPolicy", {
      managedPolicyName: "STSGetCallerIdentity",
      path: "/",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "VisualEditor0",
            Effect: "Allow",
            Action: "sts:GetCallerIdentity",
            Resource: "*",
          },
        ],
      },
    });

    const AllowSSMIAMManagedPolicy = new iam.CfnManagedPolicy(this, `AllowSSMIAMManagedPolicy`, {
      managedPolicyName: "AllowSSM",
      path: "/",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "VisualEditor0",
            Effect: "Allow",
            Action: ["ssm:DescribeParameters", "ssm:GetParameters", "ssm:GetParameter"],
            Resource: "*",
          },
        ],
      },
    });

    const CloudWatchSyntheticsPolicy = new iam.CfnManagedPolicy(this, `CloudWatchSyntheticsPolicy`, {
      managedPolicyName: "CloudWatchSyntheticsPolicy",
      path: "/",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "cloudwatch:PutMetricData",
            Resource: "*",
            Condition: {
              StringEquals: {
                "cloudwatch:namespace": "CloudWatchSynthetics",
              },
            },
          },
          {
            Effect: "Allow",
            Action: ["s3:PutObject", "logs:CreateLogStream", "logs:CreateLogGroup", "logs:PutLogEvents", "s3:GetBucketLocation"],
            Resource: [
              `arn:aws:logs:${env.region}:${env.accountID}:log-group:/aws/lambda/cwsyn-*`,
              `arn:aws:s3:::cw-syn-results-${env.accountID}-${env.region}/canary/*`,
            ],
          },
          {
            Effect: "Allow",
            Action: ["ec2:CreateNetworkInterface", "s3:ListAllMyBuckets", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface", "xray:*"],
            Resource: "*",
          },
        ],
      },
    });
  }
}

export class IAMRoleStack extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const CloudWatchSyntheticsIAMRole = new iam.CfnRole(this, `CloudWatchSyntheticsIAMRole`, {
      path: "/",
      roleName: "CloudWatchSyntheticsRole",
      assumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [{ Effect: "Allow", Principal: { Service: "lambda.amazonaws.com" }, Action: "sts:AssumeRole" }],
      },
      maxSessionDuration: 3600,
      managedPolicyArns: [
        `arn:aws:iam::${env.accountID}:policy/AllowSSM`,
        `arn:aws:iam::${env.accountID}:policy/CloudWatchSyntheticsPolicy`,
        `arn:aws:iam::${env.accountID}:policy/STSGetCallerIdentity`,
      ],
      description: "Allows Lambda functions to call AWS services on your behalf.",
    });
  }
}
