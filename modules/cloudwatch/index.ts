import * as cdk from "@aws-cdk/core";
import * as synthetics from "@aws-cdk/aws-synthetics";
import * as cloudwatch from "@aws-cdk/aws-cloudwatch";
import { Alarm, ComparisonOperator } from "@aws-cdk/aws-cloudwatch";
import { env, vpcConfig } from "../../env";

export class CloudWatchSyntheticsCanaryStack extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const canaries = [
      "content-service-live",
      "content-service-ready",
      "content-service-sum",
      "download-service",
      "pdftron-server",
      "share-service",
      "token-service",
    ];

    canaries.forEach((item) => {
      const ContentServiceLive = new synthetics.CfnCanary(this, `${item}`, {
        name: `${item}`,
        code: {
          handler: "apiCanaryBlueprint.handler", // Name of the export handler in the canary script
          s3Bucket: "csbs-mgmt-adventureworks-cw-syn-canaries", // Location of the zipfile (Note the S3 Bucket has to be created before hand)
          s3Key: `csbs-adventureworks-${item}.zip`,
        },
        executionRoleArn: `arn:aws:iam::${env.accountID}:role/CloudWatchSyntheticsRole`,
        schedule: {
          expression: "rate(5 minutes)",
          durationInSeconds: "0",
        },
        runConfig: {
          timeoutInSeconds: 300,
          memoryInMb: 1000,
          activeTracing: false,
        },
        successRetentionPeriod: 31,
        failureRetentionPeriod: 31,
        artifactS3Location: `s3://cw-syn-results-${env.accountID}-${env.region}/canary/${item}`,
        runtimeVersion: "syn-nodejs-2.2",
        vpcConfig: vpcConfig,
        startCanaryAfterCreation: true,
      });
    });
  }
}

export class CloudWatchAlarmsStack extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const Alarms = [
      { alarmName: `${env.environment}-adventureworks-content-service-live`, canaryName: "content-service-live" },
      { alarmName: `${env.environment}-adventureworks-content-service-ready`, canaryName: "content-service-ready" },
      { alarmName: `${env.environment}-adventureworks-content-service-sum`, canaryName: "content-service-sum" },
      { alarmName: `${env.environment}-adventureworks-download-service`, canaryName: "download-service" },
      { alarmName: `${env.environment}-adventureworks-pdftron-server`, canaryName: "pdftron-server" },
      { alarmName: `${env.environment}-adventureworks-share-service`, canaryName: "share-service" },
      { alarmName: `${env.environment}-adventureworks-token-service`, canaryName: "token-service" },
    ];

    Alarms.forEach((item) => {
      const CloudWatchAlarm = new Alarm(this, `${item.canaryName}Alarm`, {
        alarmName: `${item.alarmName}`, //Ex: content-service-live
        metric: new cloudwatch.Metric({
          namespace: "CloudWatchSynthetics",
          metricName: "SuccessPercent",
          dimensions: { CanaryName: item.canaryName },
        }),
        statistic: "Average",
        threshold: 90,
        actionsEnabled: true,
        datapointsToAlarm: 1,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        alarmDescription: `Synthetics alarm metric: SuccessPercent LessThanThreshold 90`,
        comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        period: cdk.Duration.minutes(5),
        evaluationPeriods: 1,
      });
    });
  }
}
