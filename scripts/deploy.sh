#!/bin/bash

#!! Note !!
# Make sure your shell enviornment has the following configured
#   AWS_DEFAULT_PROFILE - The CLI profile to use
#   AWS_ACCOUNT_ID - The (numeric) account ID to use
if [ -z "${AWS_ACCOUNT_ID}" -o -z "${AWS_DEFAULT_PROFILE}" ]; then
  echo "Both AWS_ACCOUNT_ID and AWS_DEFAULT_PROFILE must be defined in your shell."
  echo -e "Aborting.\n"
  exit 1
fi

# Configuration
#AWS_PROFILE="delichty"
BUCKET="ourpts-common-ohio-${AWS_ACCOUNT_ID}"
S3PATH="lambda"
PACKAGE="aws-cloudformation-cloudfront-identity.zip"
LAMBDA="ourpts-cfn-cloudfront-identity"

echo "Building the package"
node_modules/.bin/cfn-lambda zip --output deploy/archive.zip

echo "Deploying version to S3"
aws s3 cp deploy/archive.zip s3://${BUCKET}/${S3PATH}/${PACKAGE}

echo "Updating Lambda function"
LAMBDA=$(aws lambda list-functions \
  | jq '.Functions[] | select(.FunctionName == "ourpts-cfn-cloudfront-identity") | .FunctionName' \
  | sed -e 's/^"//' -e 's/"$//')
if [ -n "${LAMBDA}" ]; then
  aws lambda update-function-code --function-name ${LAMBDA} \
    --s3-bucket ${BUCKET} --s3-key ${S3PATH}/${PACKAGE}
fi

#
# End