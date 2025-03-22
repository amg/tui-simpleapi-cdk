import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { ApiKey, ApiKeySourceType, Cors, LambdaIntegration, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
  
/**
 * Main stack for the simple API service
 * Uses DynamoDB, APIGateway, and Lambda functions
 * Generate the API key to secure the API
 */
export class TuiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB tables
    const dbUserTable = new Table(this, 'UserTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const dbAddressTable = new Table(this, 'AddressTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // API Gateway
    const api = new RestApi(this, 'RestAPI', {
      restApiName: 'RestAPI',
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    // API Key - for now generating during stack creation but we should be using KMS
    const apiKey = new ApiKey(this, 'ApiKey');

    // We need a usage plan for the key to work
    const usagePlan = new UsagePlan(this, 'UsagePlan', {
      name: 'Usage Plan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    // Declaring out lambda functions
    const addressesLambda = new NodejsFunction(this, 'AddressesLambda', {
      entry: 'resources/endpoints/addresses.ts',
      handler: 'handler',
      environment: {
        USER_TABLE_NAME: dbUserTable.tableName,
        ADDRESS_TABLE_NAME: dbAddressTable.tableName,
      },
    });
    
    const addressLambda = new NodejsFunction(this, 'AddressLambda', {
      entry: 'resources/endpoints/address.ts',
      handler: 'handler',
      environment: {
        USER_TABLE_NAME: dbUserTable.tableName,
        ADDRESS_TABLE_NAME: dbAddressTable.tableName,
      },
    });

    const usersLambda = new NodejsFunction(this, 'UsersLambda', {
      entry: 'resources/endpoints/users.ts',
      handler: 'handler',
      environment: {
        USER_TABLE_NAME: dbUserTable.tableName,
        ADDRESS_TABLE_NAME: dbAddressTable.tableName,
      },
    });
    
    const userLambda = new NodejsFunction(this, 'UserLambda', {
      entry: 'resources/endpoints/user.ts',
      handler: 'handler',
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

    // linking functions to api gateway
    const addressesEndpoint = api.root.addResource('addresses');
    const addressEndpoint = addressesEndpoint.addResource('{id}');
    const usersEndpoint = api.root.addResource('users');
    const userEndpoint = usersEndpoint.addResource('{id}');

    const addressesIntegration = new LambdaIntegration(addressesLambda);
    const addressIntegration = new LambdaIntegration(addressLambda);
    const usersIntegration = new LambdaIntegration(usersLambda);
    const userIntegration = new LambdaIntegration(userLambda);
    
    addressesEndpoint.addMethod('GET', addressesIntegration, {
      apiKeyRequired: true,
    });
    addressesEndpoint.addMethod('POST', addressesIntegration, {
      apiKeyRequired: true,
    });
    
    addressEndpoint.addMethod('GET', addressIntegration, {
      apiKeyRequired: true,
    });
    addressEndpoint.addMethod('DELETE', addressIntegration, {
      apiKeyRequired: true,
    });
    
    usersEndpoint.addMethod('GET', usersIntegration, {
      apiKeyRequired: true,
    });
    usersEndpoint.addMethod('POST', usersIntegration, {
      apiKeyRequired: true,
    });
    
    userEndpoint.addMethod('GET', userIntegration, {
      apiKeyRequired: true,
    });
    userEndpoint.addMethod('DELETE', userIntegration, {
      apiKeyRequired: true,
    });

    // key id to lookup in the console
    new CfnOutput(this, 'API Key ID', {
      value: apiKey.keyId,
    });
  }
}