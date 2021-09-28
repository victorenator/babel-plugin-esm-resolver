import {createRequire} from 'node:module';
import {dirname, relative} from 'node:path';

const TYPES = Symbol();

function transformImportExport(nodePath, state) {
    const source = nodePath.get('source');
    if (source.node && isAlias(source.node.value)) {
        try {
            const require = createRequire(state.filename);
            const path = relative(dirname(state.filename), require.resolve(source.node.value));
            source.replaceWith(state[TYPES].stringLiteral(path))

        } catch {
            // ignore
        }
    }
}

/** @param {string} path */
function isAlias(path) {
    if (path[0] === '/' || path[0] === '.' && (path[1] === '/' || path[1] === '.' && path[2] === '/')) {
        return false;
    }
    if (path.match(/^a-z[a-z0-9+\-.]*:/i)) { // check URI scheme
        return false;
    }
    return true;
}

export default ({types}) => ({
    name: 'esm-resolver',

    pre() {
        this[TYPES] = types;
    },

    visitor: {
        Program(programPath, state) {
            programPath.traverse({
                ExportDeclaration: transformImportExport,
                ImportDeclaration: transformImportExport
            }, state);
        }
    }
});
