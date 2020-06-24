/**
 * Route: POST/note
 */
const util = require('./util');
const moment = require('moment');
const { uuid } = require('uuidv4');

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
  try {
    let item = JSON.parse(event.body).Item;
    item.user_id = util.getUserId(event.headers);
    item.user_name = util.getUserName(event.headers);
    item.note_id = item.user_id + ':' + uuid();
    item.timestamp = moment().unix();
    item.expires = moment().add(90, 'days').unix();
    let data = await dynamodb
      .put({
        TableName: tableName,
        Item: item,
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
