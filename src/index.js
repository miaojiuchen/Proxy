import { resolvePluginBatch, applyPluginBatch } from './plugin';
// import series from 'async/series';

const _cwd = process.cwd();
const defaultArgs = {
	port: '8000',
	cwd: _cwd,
	resolveDir: [_cwd]
};

export default function createServer(_args, callback) {
	const args = {...defaultArgs, ..._args };
	const {resolveDir, cwd, port} = args;
	const pluginNames = args.plugins;
	const ctx = {
		port,
		cwd,
		set: (key, val) => data[key] = val,
		get: key => data[key]
	};

	const plugins = resolvePluginBatch(pluginNames, resolveDir, cwd);
	console.log(plugins);

	function exit(error, result) {
		console.log(result);
	}
	applyPluginBatch(plugins, "middleware-before", ctx, null, exit);
}

