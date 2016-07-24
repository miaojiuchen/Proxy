import resolve from 'resolve';

function tryResolve(name, dir) {
	let result;
	try {
		result = resolve.sync(name, {
			baseDir: dir
		});
	} catch (e) {} // eslint-disable-line no-empty
	return result;
}

export default function(pluginName, resolveDir) {
	if (!Array.isArray(resolveDir)) {
		resolveDir = [resolveDir];
	}

	let result;
	resolveDir.some(dir => {
		result = tryResolve(`plugin-${pluginName}`, dir) || tryResolve(pluginName, dir);
		return result;
	});

	return result;
}