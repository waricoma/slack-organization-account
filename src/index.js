'use strict';

/**
 * @fileOverview index.js
 *
 * @author Motone Adachi (@waritocomatta)
 * @version 1.0.0
 */

require('dotenv').config();

/**
 * slack token
 * @type {string}
 */
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

/**
 * slack bot icon emoji
 */
const SLACK_BOT_ICON_EMOJI = process.env.SLACK_BOT_ICON_EMOJI;

/**
 * slack bot name
 */
const SLACK_BOT_NAME = process.env.SLACK_BOT_NAME;

const { RTMClient, WebClient } = require('@slack/client');
const nedb = require('./lib/model/_nedb')(
  './main.db',
  process.env.SYSTEM_MODE.toLowerCase()
);
const userModel = require('./lib/model/user');
const organizationModel = require('./lib/model/organization');
const http = require('http');
const generateSlackBotIntroduction = require('./lib/generate-slack-bot-introduction');

const slackRtmClient = new RTMClient(SLACK_BOT_TOKEN);
const slackWebClient = new WebClient(SLACK_BOT_TOKEN);

/**
 * @type {{string: RegExp}}
 */
const regexOfCmd = {
  connect: new RegExp(`^${SLACK_BOT_ICON_EMOJI}(| )connect .+`, 'i'),
  disconnect: new RegExp(`^${SLACK_BOT_ICON_EMOJI}(| )disconnect`, 'i'),
  add: new RegExp(`^${SLACK_BOT_ICON_EMOJI}(| )add`, 'i'),
  remove: new RegExp(`^${SLACK_BOT_ICON_EMOJI}(| )remove`, 'i')
};

slackRtmClient.on('message', async (event) => {
  // is there text?, is it bot?
  if (!('text' in event) || ('bot_id' in event)) {
    return;
  }

  if (event.text === SLACK_BOT_ICON_EMOJI) {
    /**
     * introduction message
     * @type {string}
     */
    const introductionMsg = await generateSlackBotIntroduction(nedb, SLACK_BOT_ICON_EMOJI);

    postSlackTextMsg(event.channel, introductionMsg, SLACK_BOT_NAME);
  } else if (event.text.match(regexOfCmd.connect)) {
    const targetSlackChOrGroupId = event.text.split('connect ')[1].trim().toUpperCase();

    if (targetSlackChOrGroupId === '') {
      return;
    }

    const addedOrganizationSlackChOrGroupInfo = await organizationModel.slackChOrGroupInfoById(
      nedb,
      targetSlackChOrGroupId
    );

    if (addedOrganizationSlackChOrGroupInfo) {
      await userModel.linkSlackChOrGroupAndTargetChOrGroup(
        nedb,
        event.channel,
        addedOrganizationSlackChOrGroupInfo.slack_ch_or_group_id
      );

      await organizationModel.addConnectingUser(
        nedb,
        addedOrganizationSlackChOrGroupInfo._id,
        addedOrganizationSlackChOrGroupInfo.connecting_users,
        event.channel
      );

      postSlackTextMsg(
        addedOrganizationSlackChOrGroupInfo.slack_ch_or_group_id,
        `<@${event.user}> connected`,
        SLACK_BOT_NAME
      );
      postSlackTextMsg(event.channel, 'connected', SLACK_BOT_NAME);

      return;
    }

    postSlackTextMsg(event.channel, 'The organization name does not exist.', SLACK_BOT_NAME);
  } else if (event.text.match(regexOfCmd.disconnect)) {
    const userInfoOfWantToDisconnect = await userModel.userInfoBySlackChOrGroupId(nedb, event.channel);

    if (userInfoOfWantToDisconnect) {
      await organizationModel.removeConnectingUser(
        nedb,
        userInfoOfWantToDisconnect.target_slack_ch_or_group_id,
        event.channel
      );

      postSlackTextMsg(
        userInfoOfWantToDisconnect.target_slack_ch_or_group_id,
        `<@${event.user}> disconnect`,
        SLACK_BOT_NAME
      );
    }

    await userModel.unlinkSlackChOrGroupAndTargetChOrGroup(nedb, event.channel);

    postSlackTextMsg(event.channel, 'disconnect', SLACK_BOT_NAME);
  } else if (event.text.match(regexOfCmd.add) && event.channel[0] !== 'D') {
    /**
     * adding channel or group info
     * @type {object}
     */
    const addingChOrGroupInfo = await slackWebClient.conversations.info({ channel: event.channel });

    await organizationModel.addSlackChOrGroup(nedb, event.channel, addingChOrGroupInfo.channel.name);

    postSlackTextMsg(event.channel, 'added', SLACK_BOT_NAME);
  } else if (event.text.match(regexOfCmd.remove) && event.channel[0] !== 'D') {

  } else {
    const userInfo = await userModel.userInfoBySlackChOrGroupId(nedb, event.channel);

    if (userInfo) {
      postSlackTextMsg(userInfo.target_slack_ch_or_group_id, `by <@${event.user}>\n${event.text}`, SLACK_BOT_NAME);
    }

    const slackChOrGroupInfo = await organizationModel.slackChOrGroupInfoById(nedb, event.channel);

    if (slackChOrGroupInfo) {
      for (const connectingUser of slackChOrGroupInfo.connecting_users) {
        postSlackTextMsg(connectingUser, event.text, slackChOrGroupInfo.slack_ch_or_group_name);
      }
    }
  }

  console.log(event);
});
slackRtmClient.start();

const postSlackTextMsg = (ch, msg, botName) => {
  slackWebClient.chat.postMessage({
    channel: ch,
    text: msg,
    username: botName,
    icon_emoji: SLACK_BOT_ICON_EMOJI
  });
};
