/**
 * Please define all environment varaibles in this file.
 * The export statement is used when creating JavaScript modules to export live bindings to functions, objects,
 * or primitive values from the module so they can be used by other programs with the import statement
 */

export let env = {
  environment: "sandbox4",
  region: "us-east-1",
  accountID: "574*******",
  description: "CloudWatch Synthetic Canaries for adventureworks Endpoints",
};

export let vpcConfigNonProd = {
  vpcId: "", //This will only accept a string
  subnetIds: ["", ""], //This will accept a string or an array of strings
  securityGroupIds: [""], //This will accept a string or an array of strings
};

export let vpcConfigSandbox4 = {
  vpcId: "", //This will only accept a string
  subnetIds: ["", ""], //This will accept a string or an array of strings
  securityGroupIds: [""], //This will accept a string or an array of strings
};

export let vpcConfig = vpcConfigSandbox4; //Had to statically set this because for some reason conditional statements won't set the value
