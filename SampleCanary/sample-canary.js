var synthetics = require("Synthetics");
const log = require("SyntheticsLogger");
const https = require("https");
const http = require("http");
const AWS = require("aws-sdk");

// Async function to retrieve the AWS accountID by calling STS
const getAccountID = async function () {
  var sts = new AWS.STS();
  const data = await sts.getCallerIdentity({}).promise();
  return JSON.stringify(data.Account);
};

const verifyRequest = async function (requestOption, failCondition) {
  return new Promise((resolve, reject) => {
    let req = requestOption.port === 443 ? https.request(requestOption) : http.request(requestOption);
    req.on("response", (res) => {
      log.info(`${res.statusCode}: ${JSON.stringify(res.headers)}`);
      if (res.statusCode !== 200) {
        reject(`Failed: ${requestOption.path}`);
      }
      log.info(res);
      res.on("data", (data) => {
        log.info(`Response: ${data}`);
      });
      res.on("end", () => {
        resolve();
      });
    });
    req.on("error", (error) => {
      reject(error);
    });
    if (requestOption["data"]) {
      req.write(requestOption["data"]);
    }
    req.end();
  });
};

const apiCanaryBlueprint = async function () {
  //Get Account ID
  const awsAccountID = await getAccountID();
  var env =
    JSON.parse(awsAccountID) == "***************"
      ? "dev"
      : JSON.parse(awsAccountID) == "***************"
      ? "sandbox4"
      : JSON.parse(awsAccountID) == "***************"
      ? "stage"
      : JSON.parse(awsAccountID) == "***************"
      ? "prod"
      : "UNKNOWN";

  port = 443;
  method = "GET";
  service = "ses";
  //env = "dev";
  path = "/alfresco/api/-default-/public/alfresco/versions/1/probes/-ready-";

  await verifyRequest({
    hostname: `alfresco-${service}-${env}-internal.srrcsbs.org`,
    method: method,
    path: path,
    port: port,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": synthetics.getCanaryUserAgentString(),
    },
  });
};

exports.handler = async () => {
  return await apiCanaryBlueprint();
};
