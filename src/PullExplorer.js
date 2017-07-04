/**
 * Pull Explorer v2 (https://github.com/DominicBlais/pull-explorer-v2)
 *
 * Copyright (c) 2017 Dominic Blais. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 *
 */


import PullRequest from './PullRequest';

/**
 * PullExplorer allows the user to access and analyze GitHub pull request data.
 *
 * @example
 *
 *  let request = require('request');
 *  let pe = require('PullExplorer');
 *
 *  new Promise(function(resolve, reject) {
 *    request({
 *      url: 'https://api.github.com/repos/lodash/lodash/pulls?state=all&per_page=100',
 *      headers: { 'Accept': 'application/vnd.github.v3+json','User-Agent': 'request' }
 *    }, function(error, resp, body) {
 *      if (resp && resp.statusCode == 200) {
 *        resolve(JSON.parse(body));
 *      } else {
 *        reject(resp ? resp.statusCode : error);
 *      }
 *    })
 *  }).then(function(rawJsonData) {
 *    let pullExplorer = new pe.PullExplorer(rawJsonData);
 *    let firstWeek = pullExplorer.getOldestCreationWeek();
 *    for (let i = firstWeek; i >= 0; i--) {
 *      console.log(`Week ${i}: ` +
 *        `${pullExplorer.getMeanCreationToMergeDaysForMergedPrevWeek(i).toFixed(2)}`);
 *    }
 *  }).catch(function(error) {
 *    console.log(error);
 *    // ...
 *  });
 *
 */
class PullExplorer {
  /**
   * PullExplorer is a class for parsing and exploring GitHub pull requests.
   * @param {Object[]} rawPullRequests - The raw JSON object array for a GitHub
   * repository's pull requests as returned by https://api.github.org per the GitHub v3
   * API specification
   * @see https://developer.github.com/v3/
   */
  constructor(rawPullRequests) {
    /**
     * An array of {@link PullRequest} objects created during PullExplorer initialization.
     * @type {PullRequest[]}
     */
    this.pullRequests = rawPullRequests.map(x => new PullRequest(x));
  }

  /**
   * Returns the total number of pull requests.
   * @return {number} the number of pull requests
   */
  get pullRequestCount() {
    return this.pullRequests.length;
  }

  /**
   * Returns how many weeks ago is the oldest date of pull request creation.
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {number} the number of weeks since `start` the oldest pull request
   * was created at as an integer
   * rounded down
   */
  getOldestCreationWeek(start = Date.now()) {
    if (!this.hasOwnProperty('_oldestCreationWeek')) {
      this._oldestCreationWeek = Math.max.apply(null,
        this.pullRequests.map(x => Math.floor(x.getWeeksPastCreation(start))));
    }
    return this._oldestCreationWeek;
  }

  /**
   * Returns how many weeks ago is the newest date of pull request creation.
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {number} the number of weeks since `start` the newest pull request was created at
   * as an integer
   * rounded down
   */
  getNewestCreationWeek(start = Date.now()) {
    if (!this.hasOwnProperty('_newestCreationWeek')) {
      this._newestCreationWeek = Math.min.apply(null,
        this.pullRequests.map(x => Math.floor(x.getWeeksPastCreation(start))));
    }
    return this._newestCreationWeek;
  }

  /**
   * Returns an array of all {@link PullRequest} objects which were created on a given week
   * @param {number} weeksAgo - which week to return PRs for, as an integer count of weeks from
   * `start` rounded down
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {PullRequest[]} pull requests which were created during the given week
   */
  getCreatedRequestsForPrevWeek(weeksAgo = 0, start = Date.now()) {
    return this.pullRequests.filter(x => Math.floor(x.getWeeksPastCreation(start)) === weeksAgo);
  }

  /**
   * Returns an array of all {@link PullRequest} objects which were merged on a given week
   * @param {number} weeksAgo - which week to return PRs for, as an integer count of weeks from
   * `start` rounded down
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {PullRequest[]} pull requests which were merged during the given week
   */
  getMergedRequestsForPrevWeek(weeksAgo = 0, start = Date.now()) {
    return this.pullRequests.filter(x => x.wasMerged
      && (Math.floor(x.getWeeksPastMerge(start)) === weeksAgo));
  }

  /**
   * Returns the arithmetic mean of days from creation to merge for all pull requests which were
   * merged on a given week.
   * @param {number} weeksAgo - which week to analyze, as an integer count of weeks from
   * `start` rounded down
   * @param {Date} start - the date at which to calculate from (now by default)
   * @return {PullRequest[]} pull requests which were merged during the given week
   */
  getMeanCreationToMergeDaysForMergedPrevWeek(weeksAgo = 0, start = Date.now()) {
    const merged = this.getMergedRequestsForPrevWeek(weeksAgo, start);
    if (merged.length === 0) {
      return 0;
    }
    return merged.reduce((a, pr) => a + pr.creationToMergeDays, 0) / merged.length;
  }
}

export default PullExplorer;
