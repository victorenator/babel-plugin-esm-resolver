import {strictEqual} from 'node:assert';
import test from 'node:test';
import {transformFileAsync} from '@babel/core';

test('transform returns relative imports', async () => {
    const result = await transformFileAsync(new URL('test/abc.js', import.meta.url).pathname, {
        babelrc: false,
        plugins: [
            './index.js'
        ]
    });
    strictEqual(result.code, `\
import { LitElement } from "./node_modules/lit/index.js";
import { transform } from "../node_modules/@babel/core/lib/index.js";
transform();
export class New extends LitElement {}`);
});
