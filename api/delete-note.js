/**
 * Route: DELETE/note
 */
const util = require('./util');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    let timestamp = parseInt(event.pathParameters.timestamp);
    let params = {
      TableName: tableName,
      Key: {
        user_id: util.getUserId(event.headers),
        timestamp: timestamp,
      },
    };
    await dynamodb.delete(params).promise();

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
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
