import 'regenerator-runtime/runtime';

module.exports = async () => {
  process.env.TZ = 'UTC';
  process.env.LC_ALL = 'C';
};
