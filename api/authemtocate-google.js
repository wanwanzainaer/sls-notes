/**
 * Route: Get /auth
 */
const util = require('./util');

const AWS = require('aws-sdk');
const jwtDecode = require('jwt-decode');
AWS.config.update({ region: 'us-west-1' });

const cognitoidentity = new AWS.CognitoIdentity();
const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;

exports.handler = async (event) => {
  try {
    let id_token = util.getIdToken(event.headers);
    let params = {
      IdentityPoolId: identityPoolId,
      Logins: {
        'accounts.google.com': id_token,
      },
    };
    let data = await cognitoidentity.getId(params).promise();
    params = {
      IdentityId: data.IdentityId,
      Logins: {
        'accounts.google.com': id_token,
      },
    };
    data = await cognitoidentity.getCredentialsForIdentity(params).promise();
    let decoded = jwtDecode(id_token);
    data.user_name = decoded.name;
    return {
      statusCode: 201,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(data),
    };
  } catch (e) {
    console.log(('Error ', e));
    return {
      statusCode: e.statusCode ? e.statusCode : 500,
      headers: util.getResponseHeaders(),
      body: JSON.stringify({
        error: e.name ? e.name : 'Exception',
        message: e.message ? e.message : 'Unknow error',
      }),
    };
  }
};
