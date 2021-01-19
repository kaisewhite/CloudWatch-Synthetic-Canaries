# CloudWatch Synthetic Canaries

### References

- https://cdkworkshop.com/

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
- `cdk deploy --profile nonprod` deploy to a specific profile

Project Structure

| File/Folder                  | Description                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `env.ts`                     | Stores global variables to be called throughout the project                                 |
| `modules/{Service}/index.ts` | Used to define the individual stacks for each AWS service to be created                     |
| `buildspec.yaml`             | This file is needed if we want to run this project inside of Pipeline using AWS Codebuild   |
| `cdk.json`                   | Tells the CDK Toolkit how to execute your app and defines any additional plugins to be used |

## CloudWatch Synthetic Canaries

The zip files to be deployed will all need to be stored in an S3 bucket

Each zip file should contain the lambda code to hit a specific endpoint URL. There is no way to update the code through this stack because the class `CfnCanary` will only accept a zip file.

To workaround that there are functions in each script used to help deletermine what environment the canary is in so that the right environment variables are passed in.

In the example below we are calling SSM to retrieve the account number and based on the account number provided, that will deletermine which variable to feed into the strings/URL's

Async function to retrieve the AWS accountID by calling STS

```
const getAccountID = async function () {
  var sts = new AWS.STS();
  const data = await sts.getCallerIdentity({}).promise();
  return JSON.stringify(data.Account);
};
```

Calls function above to retrieve the account number and then uses the ternary operator to update the variable

```
var env =
    JSON.parse(awsAccountID) == "699********"
      ? "dev"
      : JSON.parse(awsAccountID) == "407********"
      ? "sandbox4"
      : JSON.parse(awsAccountID) == "318********"
      ? "stage"
      : JSON.parse(awsAccountID) == "305********"
      ? "prod"
      : "UNKNOWN";
  const adminPassword = await getParameter(`/cft/ses/${env}-password`);
  const url = ``;
```

Also note that the module `@aws-cdk/aws-synthetics.Canary` does not have a prop for setting the VPC so we are forced to use `CfnCanary`.

## How to deploy to a different environment

1. Open `env.ts` in the root of the project. You will need to update the environment variable with the proper values for each prop.

```
export let env = {
  environment: "production",
  region: "us-east-1",
  accountID: "*575*********",
  description: "CloudWatch Synthetic Canaries",
};
```

2. Create a `vpcConfig` object for the new environment like the example below.

```
export let vpcConfigNonProd = {
  vpcId: "", //This will only accept a string
  subnetIds: ["", ""], //This will accept a string or an array of strings
  securityGroupIds: [""], //This will accept a string or an array of strings
};
```

3. Switch the value or the default vpcConfig to point to the new config object you created

```
export let vpcConfig = vpcConfigSandbox4
```

4. Run CDK synth & deploy in the terminal

```
cdk synth --profile sandbox4 && cdk deploy --profile sandbox4
```

## Troubleshooting

https://aws.amazon.com/premiumsupport/knowledge-center/cloudwatch-fix-failing-canary/

This article was useful when I ran into error. If deploying canaries from an S3 bucket the folder structure needs to match following before you zip the file:

```
/nodejs/node_modules/MyFunction.js
```

Note: the name of the filename and the handler name need to match:

Ex:
**handler**

```
exports.handler = async () => {
  return await apiCanaryBlueprint();
};
```

**filename**

```
nodejs/node_modules/apiCanaryBlueprint.js

```
