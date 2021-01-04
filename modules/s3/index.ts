import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import { env } from "../../env";

export class s3Bucket extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const cwSynResultsS3Bucket = new s3.CfnBucket(this, `cwSynResultsS3Bucket`, {
      bucketName: `cw-syn-results-${env.accountID}-${env.region}`,
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            serverSideEncryptionByDefault: {
              sseAlgorithm: "AES256",
            },
          },
        ],
      },
    });
  }
}

export class s3BucketPolicies extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    /**
     *
     */

    const cwSynResultsS3BucketPolicy = new s3.CfnBucketPolicy(this, `cwSynResultsS3BucketPolicy`, {
      bucket: `cw-syn-results-${env.accountID}-${env.region}`,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: `arn:aws:iam::${env.accountID}:role/CloudWatchSyntheticsRole`,
            },
            Action: "s3:*",
            Resource: `arn:aws:s3:::cw-syn-results-${env.accountID}-${env.region}/*`,
          },
        ],
      },
    });
  }
}

export class s3BucketImportGrantAccess extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    /**
     * This will grant the iam role being created above access to the s3Bucket named 'csbs-mgmt-alfresco-cw-syn-canaries'
     * which is located in MGMT.
     */
    const bucket = s3.Bucket.fromBucketAttributes(this, "ImportedBucket", {
      bucketArn: "arn:aws:s3:::csbs-mgmt-alfresco-cw-syn-canaries",
    });
    const cwSynCanaryIamRole = iam.Role.fromRoleArn(this, "Role", `arn:aws:iam::${env.accountID}:role/CloudWatchSyntheticsRole`);
    bucket.grantReadWrite(cwSynCanaryIamRole);
  }
}
