'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (pluginName, resolveDir) {
	if (!Array.isArray(resolveDir)) {
		resolveDir = [resolveDir];
	}

	var result = void 0;
	resolveDir.some(function (dir) {
		result = tryResolve('plugin-' + pluginName, dir) || tryResolve(pluginName, dir);
		return result;
	});

	return result;
};

var _resolve = require('resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function tryResolve(name, dir) {
	var result = void 0;
	try {
		result = _resolve2.default.sync(name, {
			baseDir: dir
		});
	} catch (e) {} // eslint-disable-line no-empty

	return result;
}

module.exports = exports['default'];