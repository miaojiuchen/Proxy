'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.resolvePlugin = resolvePlugin;
exports.resolvePluginBatch = resolvePluginBatch;
exports.applyPluginBatch = applyPluginBatch;

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _path = require('path');

var _resolve = require('./resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _reduceAsync = require('./reduceAsync');

var _reduceAsync2 = _interopRequireDefault(_reduceAsync);

var _isGeneratorFn = require('is-generator-fn');

var _isGeneratorFn2 = _interopRequireDefault(_isGeneratorFn);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isRelative(path) {
	return path.charAt(0) === '.';
}

function isAbsolute(path) {
	return path.charAt(0) === '/';
}

function noop() {}

function resolvePlugin(_pluginName, resolveDir) {
	var cwd = arguments.length <= 2 || arguments[2] === undefined ? process.cwd() : arguments[2];

	var queryString, plugin, name;
	var query = {};
	if (typeof _pluginName === 'string') {
		var _pluginName$split = _pluginName.split('?');

		var _pluginName$split2 = (0, _slicedToArray3.default)(_pluginName$split, 2);

		var pluginName = _pluginName$split2[0];
		var _query = _pluginName$split2[1];

		if (_query) {
			queryString = '?' + _query;
			query = parseQuery(queryString);
		}
		name = pluginName;

		if (isRelative(pluginName)) {
			plugin = require((0, _path.join)(cwd, pluginName));
		} else if (isAbsolute(pluginName)) {
			plugin = require(pluginName);
		} else {
			var pluginPath = (0, _resolve2.default)(pluginName, resolveDir);
			if (!pluginPath) {
				throw new Error('[Error] ' + pluginName + ' not found in ' + resolveDir);
			}
			plugin = require(pluginPath);
		}
	} else if ((0, _isPlainObject2.default)(_pluginName)) {
		plugin = _pluginName;
	}

	return (0, _extends3.default)({
		name: name,
		queryString: queryString,
		query: query
	}, plugin);
}

function resolvePluginBatch(pluginNames, resolveDir, cwd) {
	return pluginNames.map(function (x) {
		return resolvePlugin(x, resolveDir, cwd);
	});
}

function applyPluginBatch(plugins, curStageName, ctx, pluginArgs) {
	var _exit = arguments.length <= 4 || arguments[4] === undefined ? noop : arguments[4];

	var result;
	ctx.plugins = plugins;
	(0, _reduceAsync2.default)(plugins, pluginArgs, iter, exit);

	function iter(memo, plugin, next) {
		if (!plugin[curStageName]) return next(null, memo);

		ctx.query = plugin.query;
		ctx.next = next;
		ctx.restart = function () {
			process.send('restart');
		};

		var func = plugin[curStageName];
		if (curStageName === 'middleware') {
			ctx.app.use(func.call(ctx));
			next();
		} else if ((0, _isGeneratorFn2.default)(func)) {
			_co2.default.wrap(func).call(ctx).then(function (val) {
				return next(null, val);
			}, next);
		} else {
			var funcMountedCtx = func.call(ctx, memo);
		}
	}

	function exit(err, _result) {
		result = _result;
		if (_exit && typeof _exit === 'function') _exit(err, result);
	}

	return result;
}