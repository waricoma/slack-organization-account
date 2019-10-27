'use strict';

/**
 * @fileOverview user.js
 *
 * @author Motone Adachi (@waricoma)
 * @version 1.0.0
 */

/**
 * user info by slack channel or group id
 * @param {object} nedb nedb
 * @param {string} userSlackChOrGroupId user slack channel or group id
 * @returns {object}
 */
const userInfoBySlackChOrGroupId = async (nedb, userSlackChOrGroupId) => {
  const result = await nedb.asyncFindOne({ user_channel: userSlackChOrGroupId });
  return result;
};

const linkSlackChOrGroupAndTargetChOrGroup = async (nedb, userSlackChOrGroupId, organizationSlackChOrGroupId) => {
  const userInfo = await userInfoBySlackChOrGroupId(nedb, userSlackChOrGroupId);

  if (userInfo) {
    await nedb.asyncUpdate(
      { _id: userInfo._id },
      { $set: { target_slack_ch_or_group_id: organizationSlackChOrGroupId, using: true } }
    );
    return;
  }

  await nedb.asyncInsert({
    user_channel: userSlackChOrGroupId,
    target_slack_ch_or_group_id: organizationSlackChOrGroupId,
    using: true
  });
};

const unlinkSlackChOrGroupAndTargetChOrGroup = async (nedb, userSlackChOrGroupId) => {
  const userInfo = await userInfoBySlackChOrGroupId(nedb, userSlackChOrGroupId);

  if (userInfo) {
    await nedb.asyncUpdate(
      { _id: userInfo._id },
      { $set: { target_slack_ch_or_group_id: '', using: false } }
    );
    return;
  }

  await nedb.asyncInsert({
    user_channel: userSlackChOrGroupId,
    target_slack_ch_or_group_id: '',
    using: false
  });
};

module.exports = {
  linkSlackChOrGroupAndTargetChOrGroup: linkSlackChOrGroupAndTargetChOrGroup,
  unlinkSlackChOrGroupAndTargetChOrGroup: unlinkSlackChOrGroupAndTargetChOrGroup,
  userInfoBySlackChOrGroupId: userInfoBySlackChOrGroupId
};
