/**
 * Pull Explorer v2 (https://github.com/DominicBlais/pull-explorer-v2)
 *
 * Copyright (c) 2017 Dominic Blais. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import PullExplorer from '../src/PullExplorer';

const chai = require('chai');
const chaiStats = require('chai-stats');
const testData = require('./test-data.json');

const expect = chai.expect;
chai.use(chaiStats);

const MS_IN_DAY = 86400000;
const MS_IN_WEEK = 604800000;
const now = new Date();
const oneWeekAgo = new Date(now.getTime() - (MS_IN_WEEK + 1000));
const twoWeeksAgo = new Date(now.getTime() - ((MS_IN_WEEK * 2) + 1000));
const threeWeeksAgo = new Date(now.getTime() - ((MS_IN_WEEK * 3) + 1000));
const tenDaysAgo = new Date(now.getTime() - ((MS_IN_DAY * 10) + 1000));
const elevenDaysAgo = new Date(now.getTime() - ((MS_IN_DAY * 11) + 1000));
const twelveDaysAgo = new Date(now.getTime() - ((MS_IN_DAY * 12) + 1000));
const twentyDaysAgo = new Date(now.getTime() - ((MS_IN_DAY * 20) + 1000));


describe('PullExplorer', () => {

  describe('PullExplorer(json)', () => {
    it('should parse a sample of actual GitHub pull requests', () => {
      const pe = new PullExplorer(testData);
      expect(pe.pullRequestCount).to.be.equal(testData.length);
      expect(pe.pullRequests[0].createdAt.getTime()).to.be.equal(new Date('2017-06-20T21:45:10Z').getTime());
    });
  });

  const fakeData = [
    { created_at: threeWeeksAgo.toISOString() },
    { created_at: threeWeeksAgo.toISOString(), merged_at: twentyDaysAgo.toISOString() },

    { created_at: twentyDaysAgo.toISOString(), merged_at: oneWeekAgo.toISOString() },
    { created_at: twoWeeksAgo.toISOString(), merged_at: oneWeekAgo.toISOString() },

    { created_at: twelveDaysAgo.toISOString(), merged_at: oneWeekAgo.toISOString() },
    { created_at: elevenDaysAgo.toISOString(), merged_at: oneWeekAgo.toISOString() },
    { created_at: tenDaysAgo.toISOString(), merged_at: oneWeekAgo.toISOString() },
    { created_at: tenDaysAgo.toISOString() },
    { created_at: tenDaysAgo.toISOString(), merged_at: now.toISOString() },
    { created_at: oneWeekAgo.toISOString() }
  ];


  describe('pullExplorer.pullRequestCount', () => {
    it('should return the correct number of pull requests', () => {
      const pe = new PullExplorer(fakeData);
      expect(pe.pullRequestCount).to.be.equal(fakeData.length);
    });
  });

  describe('pullExplorer.getOldestCreationWeek()', () => {
    it('should return the correct number of weeks since the oldest pull request was created', () => {
      const pe1 = new PullExplorer(fakeData);
      expect(pe1.getOldestCreationWeek()).to.almost.equal(3, 4);
      const pe2 = new PullExplorer(fakeData);
      expect(pe2.getOldestCreationWeek(oneWeekAgo)).to.almost.equal(2, 4);
    });
  });

  describe('pullExplorer.getNewestCreationWeek()', () => {
    it('should return the correct number of weeks since the newest pull request was created', () => {
      const pe1 = new PullExplorer(fakeData);
      expect(pe1.getNewestCreationWeek()).to.almost.equal(1, 4);
      const pe2 = new PullExplorer([{ created_at: now.toISOString() }]);
      expect(pe2.getNewestCreationWeek()).to.almost.equal(0, 4);
      const pe3 = new PullExplorer(fakeData);
      expect(pe3.getNewestCreationWeek(oneWeekAgo)).to.almost.equal(0, 4);
    });
  });

  describe('pullExplorer.getCreatedRequestsForPrevWeek()', () => {
    it('should return the correct requests for a given week', () => {
      const pe = new PullExplorer(fakeData);
      expect(pe.getCreatedRequestsForPrevWeek(1)[0].createdAt.getTime())
        .to.be.equal(twelveDaysAgo.getTime());
      expect(pe.getCreatedRequestsForPrevWeek().length).to.be.equal(0);
      expect(pe.getCreatedRequestsForPrevWeek(0).length).to.be.equal(0);
      expect(pe.getCreatedRequestsForPrevWeek(1).length).to.be.equal(6);
      expect(pe.getCreatedRequestsForPrevWeek(2).length).to.be.equal(2);
      expect(pe.getCreatedRequestsForPrevWeek(3).length).to.be.equal(2);
      expect(pe.getCreatedRequestsForPrevWeek(10).length).to.be.equal(0);
      expect(pe.getCreatedRequestsForPrevWeek(0, oneWeekAgo).length).to.be.equal(6);
    });
  });

  describe('pullExplorer.getMergedRequestsForPrevWeek()', () => {
    it('should return the correct merged requests for a given week', () => {
      const pe = new PullExplorer(fakeData);
      expect(pe.getMergedRequestsForPrevWeek(1)[0].mergedAt.getTime())
        .to.be.equal(oneWeekAgo.getTime());
      expect(pe.getMergedRequestsForPrevWeek().length).to.be.equal(1);
      expect(pe.getMergedRequestsForPrevWeek(0).length).to.be.equal(1);
      expect(pe.getMergedRequestsForPrevWeek(1).length).to.be.equal(5);
      expect(pe.getMergedRequestsForPrevWeek(2).length).to.be.equal(1);
      expect(pe.getMergedRequestsForPrevWeek(3).length).to.be.equal(0);
      expect(pe.getMergedRequestsForPrevWeek(10).length).to.be.equal(0);
      expect(pe.getMergedRequestsForPrevWeek(0, oneWeekAgo).length).to.be.equal(5);
    });
  });

  describe('pullExplorer.getMeanCreationToMergeDaysForMergedPrevWeek()', () => {
    it('should return the correct arithmetic mean days from creation to merge '
        + 'for the merged requests of a given week', () => {
      const pe = new PullExplorer(fakeData);
      expect(pe.getMeanCreationToMergeDaysForMergedPrevWeek()).to.almost.equal(10 - 0, 4);
      expect(pe.getMeanCreationToMergeDaysForMergedPrevWeek(0)).to.almost.equal(10 - 0, 4);
      expect(pe.getMeanCreationToMergeDaysForMergedPrevWeek(1)).to.almost
        .equal(((10 - 7) + (11 - 7) + (12 - 7) + (14 - 7) + (20 - 7)) / 5, 4);
      expect(pe.getMeanCreationToMergeDaysForMergedPrevWeek(2)).to.almost.equal(21 - 20, 4);
      expect(pe.getMeanCreationToMergeDaysForMergedPrevWeek(3)).to.be.equal(0);
      expect(pe.getMeanCreationToMergeDaysForMergedPrevWeek(10)).to.be.equal(0);
      expect(pe.getMeanCreationToMergeDaysForMergedPrevWeek(1, oneWeekAgo))
        .to.almost.equal(21 - 20, 4);
    });
  });

});

