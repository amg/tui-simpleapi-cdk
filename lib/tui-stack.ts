import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, Table, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import {
  ApiKey,
  ApiKeySourceType,
  Cors,
  LambdaIntegration,
  RestApi,
  UsagePlan,
} from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Env } from "../resources/types/env";

/**
 * Main stack for the simple API service
 * Uses DynamoDB, APIGateway, and Lambda functions
 * Generate the API key to secure the API
 */
export class TuiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environment = Env.Dev;

    // DynamoDB tables
    const dbUserTable = new Table(this, `${environment}-UserTable`, {
      partitionKey: { name: "id", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const dbAddressTable = new Table(this, `${environment}-AddressTable`, {
      partitionKey: { name: "id", type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // API Gateway
    const api = new RestApi(this, `${environment}-RestAPI`, {
      restApiName: "RestAPI",
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    // API Key - for now generating during stack creation but we should be using KMS
    const apiKey = new ApiKey(this, `${environment}-ApiKey`);

    // We need a usage plan for the key to work
    const usagePlan = new UsagePlan(this, `${environment}-UsagePlan`, {
      name: "Usage Plan",
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    // Declaring out lambda functions
    const addressesLambda = new NodejsFunction(
      this,
      `${environment}-AddressesLambda`,
      {
        entry: "resources/endpoints/addresses.ts",
        handler: "handler",
        environment: {
          USER_TABLE_NAME: dbUserTable.tableName,
          ADDRESS_TABLE_NAME: dbAddressTable.tableName,
        },
      }
    );

    const addressLambda = new NodejsFunction(
      this,
      `${environment}-AddressLambda`,
      {
        entry: "resources/endpoints/address.ts",
        handler: "handler",
        environment: {
          USER_TABLE_NAME: dbUserTable.tableName,
          ADDRESS_TABLE_NAME: dbAddressTable.tableName,
        },
      }
    );

    const usersLambda = new NodejsFunction(this, `${environment}-UsersLambda`, {
      entry: "resources/endpoints/users.ts",
      handler: "handler",
      environment: {
        USER_TABLE_NAME: dbUserTable.tableName,
        ADDRESS_TABLE_NAME: dbAddressTable.tableName,
      },
    });

    const userLambda = new NodejsFunction(this, `${environment}-UserLambda`, {
      entry: "resources/endpoints/user.ts",
      handler: "handler",
      environment: {
        USER_TABLE_NAME: dbUserTable.tableName,
        ADDRESS_TABLE_NAME: dbAddressTable.tableName,
      },
    });

    [dbUserTable, dbAddressTable].forEach((table) => {
      table.grantReadWriteData(addressesLambda);
      table.grantReadWriteData(addressLambda);
      table.grantReadWriteData(usersLambda);
      table.grantReadWriteData(userLambda);
    });

    const stagedApiRoot = api.root.addResource(environment);

    // linking functions to api gateway
    const addressesEndpoint = stagedApiRoot.addResource("addresses");
    const addressEndpoint = addressesEndpoint.addResource("{id}");
    const usersEndpoint = stagedApiRoot.addResource("users");
    const userEndpoint = usersEndpoint.addResource("{id}");

    const addressesIntegration = new LambdaIntegration(addressesLambda);
    const addressIntegration = new LambdaIntegration(addressLambda);
    const usersIntegration = new LambdaIntegration(usersLambda);
    const userIntegration = new LambdaIntegration(userLambda);

    addressesEndpoint.addMethod("GET", addressesIntegration, {
      apiKeyRequired: true,
    });
    addressesEndpoint.addMethod("POST", addressesIntegration, {
      apiKeyRequired: true,
    });

    addressEndpoint.addMethod("GET", addressIntegration, {
      apiKeyRequired: true,
    });
    addressEndpoint.addMethod("DELETE", addressIntegration, {
      apiKeyRequired: true,
    });

    usersEndpoint.addMethod("GET", usersIntegration, {
      apiKeyRequired: true,
    });
    usersEndpoint.addMethod("POST", usersIntegration, {
      apiKeyRequired: true,
    });

    userEndpoint.addMethod("GET", userIntegration, {
      apiKeyRequired: true,
    });
    userEndpoint.addMethod("DELETE", userIntegration, {
      apiKeyRequired: true,
    });

    // env
    new CfnOutput(this, "Env", {
      value: environment,
    });

    // key id to lookup in the console
    new CfnOutput(this, "API Key ID", {
      value: apiKey.keyId,
    });
  }
}
