'use strict';

/**
 * @fileOverview target-organization-setting-ui.js
 *
 * @author Motone Adachi (@waricoma)
 * @version 1.0.0
 */

const organizationModel = require('./model/organization');

/**
 * main
 * @param {object} nedb nedb
 * @param {string} slackBotIconEmoji slack bot icon emoji
 * @returns {string} introduction message
 */
const main = async (nedb, slackBotIconEmoji) => {
  /**
   * channel
   * @type {object}
   */
  const slackChsOrGroupsList = await organizationModel.slackChsOrGroupsList(nedb);

  /**
   * introduction message
   * @type {string}
   */
  let introductionMsg = '';

  introductionMsg += 'Which organization do you want to connect to?\n\n```\n';
  introductionMsg += `organization list (${slackChsOrGroupsList.length})\n\n`;

  console.log(slackChsOrGroupsList);

  introductionMsg += slackChsOrGroupsList.map((channelOrGroup) => {
    return `${channelOrGroup.slack_ch_or_group_name}\n:performing_arts: connect ${channelOrGroup.slack_ch_or_group_id}`;
  }).join('\n');

  introductionMsg += '\n```\n\nBelow is the connection command.\n';
  introductionMsg += `> ${slackBotIconEmoji} connect {organization-id}`;

  return introductionMsg;
};

module.exports = main;
