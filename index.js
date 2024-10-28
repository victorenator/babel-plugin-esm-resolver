import {createRequire} from 'node:module';
import {dirname, relative} from 'node:path';

const TYPES = Symbol();

function resolve(sourceModule, importModule) {
    const require = createRequire(sourceModule);
    const path = relative(dirname(sourceModule), require.resolve(importModule));
    return path[0] === '.'? path: `./${path}`;
}

/**
 * @param {import('@babel/core').NodePath} nodePath 
 * @param {*} state 
 */
function transformImportExport(nodePath, state) {
    /** @type {import('@babel/core').NodePath<import('@babel/core').types.ImportOrExportDeclaration>} */
    const source = nodePath.get('source');
    if (source.node && isAlias(source.node.value)) {
        try {
            source.replaceWith(state[TYPES].stringLiteral(resolve(state.filename, source.node.value)))

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
