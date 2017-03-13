#!/bin/bash
# deploy.sh

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

echo "Biulding the package"
#node_modules/.bin/cfn-lambda zip --output deploy/archive.zip

echo "Deploy version to S3"
aws s3 cp deploy/archive.zip s3://${BUCKET}/${S3PATH}/${PACKAGE}
