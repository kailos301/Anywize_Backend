const CronJob = require('cron').CronJob;
const { DateTime } = require('luxon');
const Sequelize = require('sequelize');
import models from './models';
import RoutesLogic from './logic/routes';

const EVERY_SATURDAY = '0 0 0 * * *';
const EVERY_30_SECONDS = '0 */2 * * * *';

const job = new CronJob(EVERY_SATURDAY, async function() {
  console.log('Running cron job');

  await RoutesLogic.archive();

}, null, true, 'UTC');

job.start();
