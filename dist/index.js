'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = createServer;

var _plugin = require('./plugin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import series from 'async/series';

var _cwd = process.cwd();
var defaultArgs = {
	port: '8000',
	cwd: _cwd,
	resolveDir: [_cwd]
};

function createServer(_args, callback) {
	var args = (0, _extends3.default)({}, defaultArgs, _args);
	var resolveDir = args.resolveDir;
	var cwd = args.cwd;
	var port = args.port;

	var pluginNames = args.plugins;
	var ctx = {
		port: port,
		cwd: cwd,
		set: function set(key, val) {
			return data[key] = val;
		},
		get: function get(key) {
			return data[key];
		}
	};

	var plugins = (0, _plugin.resolvePluginBatch)(pluginNames, resolveDir, cwd);
	console.log(plugins);

	function exit(error, result) {
		console.log(result);
	}
	(0, _plugin.applyPluginBatch)(plugins, "middleware-before", ctx, null, exit);
}
module.exports = exports['default'];