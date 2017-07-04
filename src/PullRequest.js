/**
 * Pull Explorer v2 (https://github.com/DominicBlais/pull-explorer-v2)
 *
 * Copyright (c) 2017 Dominic Blais. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/** @ignore */
const _MS_IN_DAY = 86400000;

/** @ignore */
const _MS_IN_WEEK = 604800000;

/** @ignore */
function _weeksSince(t, start = Date.now()) {
  return (start - t) / _MS_IN_WEEK;
}

/**
 * PullRequest is a class representing each GitHub pull request and is generated by
 * {@link PullExplorer}. It contains properties and methods to access and analyze data associated
 * with the pull request, including a number of convenience methods for the time since a particular
 * pull request event has occurred.
 */
class PullRequest {
  /**
   * PullRequest is a class representing each GitHub pull request and is generate by
   * {@link PullExplorer}.
   * @param {Object} rawJsonData - The raw JSON object for a pull request returned by https://api.github.org
   * per the GitHub v3 API specification
   * @see https://developer.github.com/v3/
   */
  constructor(rawJsonData) {
    /**
     * the moment at which this pull request was created.
     * @type {Date}
     */
    this.createdAt = new Date(rawJsonData.created_at);
    /**
     * whether this pull request has been merged.
     * @type {boolean}
     */
    this.wasMerged = rawJsonData.merged_at != null;
    if (this.wasMerged) {
      /**
       * mergedAt the moment at which this pull request was merged. This property is undefined
       * if the pull request has not been merged.
       * @type {Date}
       */
      this.mergedAt = new Date(rawJsonData.merged_at);
    }
    // todo: parse additional fields, e.g. request(rawJsonData.commits_url,
    //  (err,resp,body) => {this.commitedAt = Date.parse(JSON.parse(body)[0].commit.author.date)})
  }

  /**
   * Returns the number of days from the time of the PR's creation to its merge,
   * if a merge occurred. If a merge has not happened, an exception is thrown.
   * @return {number} the days between mergedAt and createdAt.
   * @throws {Error} if the pull request has not been merged
   */
  get creationToMergeDays() {
    if (this.wasMerged) {
      return Math.abs(this.mergedAt - this.createdAt) / _MS_IN_DAY;
    }
    throw new Error('Pull Request has not been merged');
  }

  /**
   * Returns the number of weeks since this pull request was created
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {number} the number of weeks since `start` that this pull request was created
   */
  getWeeksPastCreation(start = Date.now()) {
    return _weeksSince(this.createdAt, start);
  }

  /**
   * Returns the number of weeks since this pull request was merged
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {number} the number of weeks since `start` that this pull request was merged
   * @throw {Error} if the pull request has not been merged
   */
  getWeeksPastMerge(start = Date.now()) {
    if (this.wasMerged) {
      return _weeksSince(this.mergedAt, start);
    }
    throw new Error('Pull Request has not been merged');
  }

  /**
   * Returns whether another pull request is after this one.
   * @param {PullRequest} other - another pull request
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {boolean} true if this pull request was created before `other`
   */
  isCreationBefore(other, start = Date.now()) {
    return this.getWeeksPastCreation(start) > other.getWeeksPastCreation(start);
  }
}

export default PullRequest;
