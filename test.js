import {transformFileAsync} from '@babel/core';

const result = await transformFileAsync(new URL('test/abc.js', import.meta.url).pathname, {
    babelrc: false,
    plugins: [
        ['./index.js']
    ]
});

console.log(result.code);
