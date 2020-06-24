/**
 * Route: GET/note
 */
const util = require('./util');
const AWS = require('aws-sdk');
const _ = require('underscore');
AWS.config.update({ region: 'us-west-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    let note_id = decodeURIComponent(event.pathParameters.note_id);
    let params = {
      TableName: tableName,
      IndexName: 'note_id-index',
      KeyConditionExpression: 'note_id = :note_id',
      ExpressionAttributeValues: {
        ':note_id': note_id,
      },
      Limit: 1,
    };
    let data = await dynamodb.query(params).promise();
    if (!_.isEmpty(data.Items)) {
      return {
        statusCode: 201,
        headers: util.getResponseHeaders(),
        body: JSON.stringify(data.Items[0]),
      };
    } else {
      return {
        statusCode: 404,
        headers: util.getResponseHeaders(),
      };
    }
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
