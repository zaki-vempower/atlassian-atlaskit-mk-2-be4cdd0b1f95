// @flow
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');

function formatSizeDiff(diff, colors = ['red', 'green']) {
  // $FlowFixMe - Indexer is wrong for Chalk
  return chalk[diff > 0 ? colors[0] : colors[1]](
    `${diff > 0 ? '+' : ''}${prettyBytes(diff)}`,
  );
}

function formatFileStats(fileStats) {
  return [
    chalk.green(prettyBytes(fileStats.size)),
    `(${chalk.red(prettyBytes(fileStats.gzipSize))})`,
  ].join(' ');
}

function printReport(stats /*: Array<Object>*/, level /*: number*/ = 1) {
  stats.forEach(group => {
    if (!group.stats.length) return;

    const title = `${group.name}:`;
    console.log(chalk.yellow(title.padStart(title.length + level * 2, ' ')));

    // eslint-disable-next-line consistent-return
    group.stats.forEach(stat => {
      if (stat.group) return printReport([stat], level + 1);

      const subTitle = `– ${stat.name}:`;
      console.log(
        [
          chalk.yellow.dim(subTitle.padStart(subTitle.length + level * 2 + 2)),
          formatFileStats(stat.stats),
          `${stat.new ? ` ${chalk.bgRed.black(' added ')}` : ''}`,
          `${stat.deleted ? ` ${chalk.bgGreen.black(' deleted ')}` : ''}`,
          stat.isTooBig
            ? ` ${chalk.bgRed.black(` >${stat.threshold * 100}% `)}`
            : '',
          stat.stats.sizeDiff || stat.stats.gzipSizeDiff
            ? ` ${formatSizeDiff(stat.stats.sizeDiff)} (${formatSizeDiff(
                stat.stats.gzipSizeDiff,
              )})`
            : '',
        ]
          .filter(Boolean)
          .join(' '),
      );
    });

    if (level === 1) {
      console.log();
    }
  });
}

module.exports = { printReport };
