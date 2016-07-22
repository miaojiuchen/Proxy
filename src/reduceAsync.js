export default function reduceAsync(arr, memo, iter, exit) {
	var index = 0;

	function next() {
		index++;
		if (arr[index]) {
			return run(arr[index]);
		}

		if (exit && typeof exit === 'function')
			exit(null, memo);
		return memo;
	}

	function run(item) {
		let nextCall = (err, result) => {
			memo = result;
			next();
		};
		iter(memo, item, nextCall);
	}

	run(arr[index]);
}