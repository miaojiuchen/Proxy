import { resolvePluginBatch, applyPluginBatch } from './plugin';
import series from 'async/series';
import http from 'http';
import koa from 'koa';

const _cwd = process.cwd();
const defaultArgs = {
  port: '8000',
  cwd: _cwd,
  resolveDir: [_cwd],
};
const data = {};
export default function createServer(_args, callback) {
  const args = { ...defaultArgs, ..._args };
  const { resolveDir, cwd, port } = args;
  const pluginNames = args.plugins;
  const ctx = {
    port,
    cwd,
    set: (key, val) => { data[key] = val; },
    get: key => data[key],
  };

  const plugins = resolvePluginBatch(pluginNames, resolveDir, cwd);

  function _applyPluginBatch(pluginName, pluginArgs, _exit) {
    return applyPluginBatch(plugins, pluginName, ctx, pluginArgs, _exit);
  }

  const app = ctx.app = koa();
  let server;
  series([
    next => _applyPluginBatch('middleware-before', null, next),
    next => _applyPluginBatch('middleware', null, next),
    next => _applyPluginBatch('middleware.after', null, next),
    next => { server = ctx.server = http.createServer(app.callback()); next(); },
    next => _applyPluginBatch('server.before', null, next),
    next => {
      server.listen(port, () => {
        ctx.set('__ready', true);
        next();
      });
    },
    next => _applyPluginBatch('server.after', null, next),
  ], callback);
}

