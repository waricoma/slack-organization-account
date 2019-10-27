'use strict';

/**
 * @fileOverview organization.js
 *
 * @author Motone Adachi (@waricoma)
 * @version 1.0.0
 */

/**
 * channels or groups list
 * @param {object} nedb nedb
 * @returns {object[]}
 */
const slackChsOrGroupsList = async (nedb) => {
  const result = await nedb.asyncFind({
    slack_ch_or_group_id: { $exists: true },
    using: true
  });
  return result;
};

const addSlackChOrGroup = async (nedb, slackChOrGroupId, slackChOrGroupName) => {
  /**
   * channel or group info
   * @type {object}
   */
  const chOrGroupInfo = await nedb.asyncFindOne({ slack_ch_or_group_id: slackChOrGroupId });

  if (chOrGroupInfo) {
    await nedb.asyncUpdate(
      { _id: chOrGroupInfo._id },
      { $set: { slack_ch_or_group_name: slackChOrGroupName, using: true } }
    );
    return;
  }

  await nedb.asyncInsert({
    slack_ch_or_group_id: slackChOrGroupId,
    slack_ch_or_group_name: slackChOrGroupName,
    connecting_users: [],
    using: true
  });
};

const removeSlackChOrGroup = async (nedb, slackChOrGroupId) => {

};

const slackChOrGroupInfoById = async (nedb, slackChOrGroupId) => {
  const result = await nedb.asyncFindOne({ slack_ch_or_group_id: slackChOrGroupId, using: true });
  return result;
};

const addConnectingUser = async (nedb, organizationId, currentConnectingUsersId, userSlackChOrGroupId) => {
  const connectingUsers = currentConnectingUsersId.concat();

  connectingUsers.push(userSlackChOrGroupId);

  nedb.asyncUpdate(
    { _id: organizationId },
    { $set: { connecting_users: connectingUsers } }
  );
};

const removeConnectingUser = async (nedb, organizationSlackChOrGroupId, userSlackChOrGroupId) => {
  const organizationInfo = await nedb.asyncFindOne({ slack_ch_or_group_id: organizationSlackChOrGroupId });

  await nedb.asyncUpdate(
    { _id: organizationInfo._id },
    {
      $set: {
        connecting_users: organizationInfo.connecting_users.filter((userChId) => {
          return (userChId !== userSlackChOrGroupId);
        })
      }
    }
  );
};

module.exports = {
  slackChsOrGroupsList: slackChsOrGroupsList,
  addSlackChOrGroup: addSlackChOrGroup,
  removeSlackChOrGroup: removeSlackChOrGroup,
  slackChOrGroupInfoById: slackChOrGroupInfoById,
  addConnectingUser: addConnectingUser,
  removeConnectingUser: removeConnectingUser
};
