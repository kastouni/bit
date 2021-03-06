// todo: fix according to the build changes. buildInlineAll no longer exists

import chokidar from 'chokidar';
import R from 'ramda';
import { loadConsumer } from '../../../consumer';
import { buildAll } from '../index';
import ComponentsList from '../../../consumer/component/components-list';

/**
 * Watch all components specified in bit.map.
 * Run buildAll for each change in the watched paths
 *
 * @export
 * @param {boolean} verbose - showing verbose output for inspection
 * @returns
 */
export default (async function watchAll(verbose) {
  // TODO: run build in the begining of process (it's work like this in other envs)
  const consumer = await loadConsumer();
  const consumerPath = consumer.getPath();
  const componentsList = new ComponentsList(consumer);
  const bitMapComponentsValues = await componentsList.idsFromBitMap();
  const addConsumerPath = x => `${consumerPath}/${x.path}`;
  const bitMapComponentsPaths = R.map(addConsumerPath, bitMapComponentsValues);
  const watcher = chokidar.watch(bitMapComponentsPaths, {
    ignoreInitial: true,
    ignored: '**/dist/**'
  });

  console.log('Starting watch for changes'); // eslint-disable-line no-console

  if (verbose) {
    // Print all watched paths
    bitMapComponentsPaths.forEach(path => console.log(`Watching ${path}`)); // eslint-disable-line no-console
  }

  watcher.on('change', (p) => {
    const log = console.log.bind(console); // eslint-disable-line no-console
    log(`File ${p} has been changed, calling build`);
    // TODO: Make sure the log for build is printed to console
    buildAll()
      .then((buildResult) => {
        console.log(buildResult); // eslint-disable-line no-console
      })
      .catch((err) => {
        log(err); // eslint-disable-line
      });
  });

  return new Promise(() => {});
});
