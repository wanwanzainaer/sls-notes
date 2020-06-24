/**
 * Route: GET/notes
 */
const util = require('./util');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    let query = event.queryStringParameters;
    let limit = query && query.limit ? parseInt(query.limit) : 5;
    let user_id = util.getUserId(event.headers);
    let params = {
      TableName: tableName,
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: {
        ':uid': user_id,
      },
      Limit: limit,
      scanIndexForward: false,
    };

    let startTimestamp = query && query.start ? parseInt(query.start) : 0;
    console.log(startTimestamp);
    if (startTimestamp > 0) {
      params.ExclusiveStartKey = {
        user_id: user_id,
        timestamp: startTimestamp,
      };
    }

    let data = await dynamodb.query(params).promise();

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
