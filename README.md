# TUI CDK simple api

Simple API that allows to store addresses per user and retrieve them.

## Documentation

See ./docs folder that contains an openapi spec and postman collection + environment

## Setup

1. install AWS CLI using brew `brew install awscli`
2. run `aws configure` to setup local auth variables used for aws cli
3. local configuration is used as the environment to deploy (account and region)

## Deploy

1. `npm install` to get all dependencies
2. prepare main resources like bucket that stores functions `cdk bootstrap`
3. deploy project specific resources `cdk deploy`

## Testing

Use Postman https://web.postman.co/ and collections in the docs folder


# Productionisation

## Future Stack improvements:

1. DNS reservation for the production endpoint
2. user authentication is not performed, instead using simple API key for all users
 - something premade ideally like Okta
3. deployment
 - stack could be split into logical entities to reduce boilerplate for each lambda
 - currently policy is to destroy everything, in production some resources should be retained like db to ensure data is not lost
 - stack currently doesn't have support for different environments: Dev, Staging, Prod
4. database
 - database backup should be configured
 - ideally db would have a view to allow hiding sensitive data for different levels of troubleshooting
5. logging & monitoring
 - there are almost no logs to help troubleshoot issues
 - dashboard to alert on critical events
   
## Future Code improvements:

1. generic input validation
  - ideally using the openapi spec to ensure input is checked and rejected if not conforming
2. cover main business logic with unit tests
3. abstract dynamo db operations further into "repository" classes to allow reuse 
  - currently address service directly queries user service but ideally they would be independent
  - repository layer can also be more type safe than current approach
4. linting and formatting rules/helpers

This API has basic checks to help prevent database corruption:
 - checking post request body and stripping it of unknown fields
TODO: ideally this would be done centrally and validation based on the openapi spec defined




# Resources

[Blank CDK Typescript template](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html)
