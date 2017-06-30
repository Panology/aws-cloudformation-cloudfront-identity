var AWS = require('aws-sdk');
var uuid = require('uuid');
var CfnLambda = require('cfn-lambda');

var cloudfront = new AWS.CloudFront({apiVersion: '2016-08-20'});

var Create = function(params, reply) {
  console.log("Creating new OAI.");
  console.log("Params: " + JSON.stringify(params));
  params.CallerReference = uuid.v4();
  var p = {
    CloudFrontOriginAccessIdentityConfig: params
  };
  cloudfront.createCloudFrontOriginAccessIdentity(p, function(err, data) {
    if (err) {
      reply(err);
    } else  {
      console.log("Create completed.");
      console.log("OAI ID:" + data.CloudFrontOriginAccessIdentity.Id);
      console.log("S3 Canonical User ID: " + data.CloudFrontOriginAccessIdentity.S3CanonicalUserId);
      reply(null, data.CloudFrontOriginAccessIdentity.Id, { S3CanonicalUserId: data.CloudFrontOriginAccessIdentity.S3CanonicalUserId });
    }
  });
};

var Update = function(physicalId, params, oldParams, reply) {
  console.log("Updating existing OAI.");
  console.log("Physical ID: " + physicalId);
  console.log("New Params: " + JSON.stringify(params));
  console.log("Old Params: " + JSON.stringify(oldParams));
  cloudfront.getCloudFrontOriginAccessIdentity({ Id: physicalId }, function(err, data) {
    if (err) {
      console.error(err);
      return reply(err);
    }
    console.log("Found OAI: " + JSON.stringify(data));
    // We must specify the existing CallerReference
    params.CallerReference =   data.CloudFrontOriginAccessIdentity.CloudFrontOriginAccessIdentityConfig.CallerReference;
    var p = {
      Id: physicalId,
      CloudFrontOriginAccessIdentityConfig: params,
      IfMatch: data.ETag
    }
    console.log("Updating with params: " + JSON.stringify(p));
    cloudfront.updateCloudFrontOriginAccessIdentity(p, function(err, data) {
      if (err) {
        console.error(err);
        reply(err);
      } else {
        console.log("Update completed.");
        console.log("OAI ID:" + data.CloudFrontOriginAccessIdentity.Id);
        console.log("S3 Canonical User ID: " + data.CloudFrontOriginAccessIdentity.S3CanonicalUserId);
        reply(null, data.CloudFrontOriginAccessIdentity.Id, { S3CanonicalUserId: data.CloudFrontOriginAccessIdentity.S3CanonicalUserId });
      }
    });
  });
};

var Delete = function(physicalId, params, reply) {
  console.log("Removing existing OAI.");
  console.log("Physical ID: " + physicalId);
  console.log("Params: " + JSON.stringify(params));
  cloudfront.getCloudFrontOriginAccessIdentity({ Id: physicalId }, function(err, data) {
    if (err) {
      console.error(err);
      return reply(err);
    }
    console.log("Found OAI: " + JSON.stringify(data));
    var p = {
      Id: physicalId,
      IfMatch: data.ETag
    };
    cloudfront.deleteCloudFrontOriginAccessIdentity(p, function(err, data) {
      if (err) console.error(err);
      console.log("Removal complete.");
      reply(err, physicalId);
    });
  });
};

exports.Create = Create;
exports.Update = Update;
exports.Delete = Delete;
