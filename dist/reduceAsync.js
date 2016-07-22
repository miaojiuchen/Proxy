'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = reduceAsync;
function reduceAsync(arr, memo, iter, exit) {
	var index = 0;

	function next() {
		index++;
		if (arr[index]) {
			return run(arr[index]);
		}

		if (exit && typeof exit === 'function') exit(null, memo);
		return memo;
	}

	function run(item) {
		var nextCall = function nextCall(err, result) {
			memo = result;
			next();
		};
		iter(memo, item, nextCall);
	}

	run(arr[index]);
}
module.exports = exports['default'];