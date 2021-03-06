import co from 'co';
import { join } from 'path';
import resolve from './resolve';
import reduceAsync from './reduceAsync';
import { parseQuery } from 'loader-utils';
import isPlainObject from 'is-plain-object';
import isGeneratorFn from 'is-generator-fn';

function isRelative(path) {
  return path.charAt(0) === '.';
}

function isAbsolute(path) {
  return path.charAt(0) === '/';
}

function noop() { }

export function resolvePlugin(_pluginName, resolveDir, cwd = process.cwd()) {
  let queryString;
  let plugin;
  let name;
  let query = {};
  if (typeof _pluginName === 'string') {
    const [pluginName, _query] = _pluginName.split('?');
    if (_query) {
      queryString = `?${_query}`;
      query = parseQuery(queryString);
    }
    name = pluginName;

    if (isRelative(pluginName)) {
      plugin = require(join(cwd, pluginName));
    } else if (isAbsolute(pluginName)) {
      plugin = require(pluginName);
    } else {
      const pluginPath = resolve(pluginName, resolveDir);
      if (!pluginPath) {
        throw new Error(`[Error] ${pluginName} not found in ${resolveDir}`);
      }
      plugin = require(pluginPath);
    }
  } else if (isPlainObject(_pluginName)) {
    plugin = _pluginName;
  }

  return {
    name,
    queryString,
    query,
    ...plugin,
  };
}

export function resolvePluginBatch(pluginNames, resolveDir, cwd) {
  return pluginNames.map(x => resolvePlugin(x, resolveDir, cwd));
}

export function applyPluginBatch(plugins, curStageName, _ctx, pluginArgs, _exit = noop) {
  let result;
  const ctx = _ctx;
  ctx.plugins = plugins;

  function iter(memo, plugin, next) {
    if (!plugin[curStageName]) {
      return next(null, memo);
    }

    ctx.query = plugin.query;
    ctx.next = next;
    ctx.restart = () => {
      process.send('restart');
    };

    const func = plugin[curStageName];
    if (curStageName === 'middleware') {
      ctx.app.use(func.call(ctx));
      next();
    } else if (isGeneratorFn(func)) {
      co.wrap(func)
        .call(ctx)
        .then(val => next(null, val), next);
    } else {
      const funcResult = func.call(ctx, memo);
      if (funcResult && funcResult.then) {
        funcResult.then(res => {
          next(null, res);
        }).catch(next);
      } else {
        next(null, funcResult);
      }
    }
  }

  function exit(err, _result) {
    result = _result;
    if (_exit && typeof _exit === 'function') {
      _exit(err, result);
    }
  }

  reduceAsync(plugins, pluginArgs, iter, exit);

  return result;
}

