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
	const pluginNames = args.plugins;
	const ctx = {
		ports: args.port,
		cwd: args.cwd,
		set: (key, val) => data[key] = val,
		get: key => data[key]
	};

	const plugins = resolvePluginBatch(pluginNames, args.resolveDir, args.cwd);
	console.log(plugins);
}