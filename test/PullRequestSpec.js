/**
 * Pull Explorer v2 (https://github.com/DominicBlais/pull-explorer-v2)
 *
 * Copyright (c) 2017 Dominic Blais. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

let chai = require('chai');
let expect = chai.expect;
let chaiStats = require('chai-stats');
chai.use(chaiStats);
import PullRequest from '../src/PullRequest';
const fs = require('fs');

const _MS_IN_DAY = 86400000;
const _MS_IN_WEEK = 604800000;
let now = new Date(); //.now();
let oneWeekAgo = new Date(now.getTime() - (_MS_IN_WEEK + 1000));
let twoWeeksAgo = new Date(now.getTime() - (_MS_IN_WEEK * 2 + 1000));
let threeWeeksAgo = new Date(now.getTime() - (_MS_IN_WEEK * 3 + 1000));
let tenDaysAgo = new Date(now.getTime() - (_MS_IN_DAY * 10 + 1000));
let elevenDaysAgo = new Date(now.getTime() - (_MS_IN_DAY * 11 + 1000));
let twelveDaysAgo = new Date(now.getTime() - (_MS_IN_DAY * 12 + 1000));
let twentyDaysAgo = new Date(now.getTime() - (_MS_IN_DAY * 20 + 1000));


describe('PullRequest', () => {

  describe('pullRequest.getWeeksPastCreation()', () => {
    it('should return the correct number of weeks past creation', () => {
      const pr1 = new PullRequest({
        'created_at':threeWeeksAgo.toISOString()
      });
      expect(pr1.getWeeksPastCreation()).to.almost.equal(3, 4);
      const pr2 = new PullRequest({
        'created_at':now.toISOString()
      });
      expect(pr2.getWeeksPastCreation()).to.almost.equal(0, 4);
    });
    it('should return the correct number of weeks past creation when the start time is not now', () => {
      const pr = new PullRequest({
        'created_at':threeWeeksAgo.toISOString()
      });
      expect(pr.getWeeksPastCreation(oneWeekAgo)).to.almost.equal(2, 4);
    });
  });

  describe('pullRequest.getWeeksPastMerge()', () => {
    it('should return the correct number of weeks past merge', () => {
      const pr1 = new PullRequest({
        'created_at':threeWeeksAgo.toISOString(),
        'merged_at':twoWeeksAgo.toISOString()
      });
      expect(pr1.getWeeksPastMerge()).to.almost.equal(2, 4);
      const pr2 = new PullRequest({
        'created_at':threeWeeksAgo.toISOString(),
        'merged_at':now.toISOString()
      });
      expect(pr2.getWeeksPastMerge()).to.almost.equal(0, 4);
    });
    it('should return the correct number of weeks past merge when the start time is not now', () => {
      const pr = new PullRequest({
        'created_at':threeWeeksAgo.toISOString(),
        'merged_at':twoWeeksAgo.toISOString()
      });
      expect(pr.getWeeksPastMerge(oneWeekAgo)).to.almost.equal(1, 4);
    });
    it('should throw an error when the PR has not been merged', () => {
      const pr = new PullRequest({
        'created_at':threeWeeksAgo.toISOString()
      });
      expect(() => pr.getWeeksPastMerge()).to.throw('Pull Request has not been merged');
    });
  });

  describe('pullRequest.isCreationBefore()', () => {
    it('should determine if older request is before', () => {
      const pr1 = new PullRequest({
        'created_at':threeWeeksAgo.toISOString()
      });
      const pr2 = new PullRequest({
        'created_at':twoWeeksAgo.toISOString()
      });
      expect(pr1.isCreationBefore(pr2)).to.be.equal(true);
      expect(pr2.isCreationBefore(pr1)).to.be.equal(false);
      expect(pr1.isCreationBefore(pr1)).to.be.equal(false);
    });
  });

  describe('pullRequest.creationToMergeDays', () => {
    it('should return the number of days between creation and merge', () => {
      const pr1 = new PullRequest({
        'created_at':oneWeekAgo.toISOString(),
        'merged_at':tenDaysAgo.toISOString()
      });
      expect(pr1.creationToMergeDays).to.almost.equal(3, 4);
      const pr2 = new PullRequest({
        'created_at':threeWeeksAgo.toISOString(),
        'merged_at':threeWeeksAgo.toISOString()
      });
      expect(pr2.creationToMergeDays).to.almost.equal(0, 4);
      const pr3 = new PullRequest({
        'created_at':oneWeekAgo.toISOString(),
        'merged_at':threeWeeksAgo.toISOString()
      });
      expect(pr3.creationToMergeDays).to.almost.equal(14, 4);
    });
    it('should throw an error when the PR has not been merged', () => {
      const pr = new PullRequest({
        'created_at':threeWeeksAgo.toISOString()
      });
      expect(() => pr.creationToMergeDays).to.throw('Pull Request has not been merged');
    });
  });

});

