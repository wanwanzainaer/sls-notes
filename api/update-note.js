/**
 * Route: PATCH/note
 */
const util = require('./util');
const AWS = require('aws-sdk');
const moment = require('moment');

AWS.config.update({ region: 'us-west-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    let item = JSON.parse(event.body).Item;
    item.user_id = util.getUserId(event.headers);
    item.user_name = util.getUserName(event.headers);
    item.expires = moment().add(90, 'days').unix();

    let data = await dynamodb
      .put({
        TableName: tableName,
        Item: item,
        ConditionExpression: '#t = :t',
        ExpressionAttributeNames: {
          '#t': 'timestamp',
        },
        ExpressionAttributeValues: {
          ':t': item.timestamp,
        },
      })
      .promise();

    return {
      statusCode: 201,
      headers: util.getResponseHeaders(),
      body: JSON.stringify(item),
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
