/*
    exam.js
    Example JavaScript with common mistakes (logic bugs & runtime errors).
    Intentional issues are commented inline for teaching/debugging.
*/

'use strict';

// 1) Assignment instead of comparison -> logic bug
function checkStatus(status) {
    if (status = ok') { // BUG: uses assignment (=) instead of == or ===
        return true;
    }
    return false;
}

// 2) Off-by-one -> undefined access leads to NaN
function sumArrayarr) {
    let sum = 0;
    for (let i = 0; i <= arr.length; i++) { // BUG: should be i < arr.length
        sum += ar[i]; // arr[arr.length] is undefined, causes NaN
    }
    return sum;
}

// 3) Closure + var -> loop variable captured incorrectly
function createTimers() {
    for (var i = 0; i < 3; i++) {
        setTimeout(function () {
            console.log('timer', i); // BUG: prints 3,3,3 instead of 0,1,2
        }, 0);
    }
}

// 4) Wrong comparator for Array.prototype.sort -> unpredictable order
function sortNumbers(list) {
    return list.sort((a, b) => a > b); // BUG: comparator must return negative/zero/positive number
}

// 5) Reassigning a const -> TypeError at runtime
function reassignConst() {
    const obj = { a: 1 ;
    obj = {}; // BUG: cannot reassign a const
}

// 6) Missing await and empty catch -> promise misuse and swallowed errors
async function fetchData( {
    try {
        const p = fetch('https://invalid.example'); // BUG: missing await, p is a Promise
        console.log('fetched', p);
    } catch (e) {
        // BUG: swallowing errors silently makes debugging hard
    }
}

// 7) parseInt without radix -> can be ambiguous in older engines
function parseVersion(v) {
    return parseInt(v); // BUG: always pass radix: parseInt(v, 10)
}

// 8) Using map for side-effects -> misuse (map is for transformation)
function doubleInPlace(arr) {
    arr.map((x, i) => { // BUG: map result is ignored; side-effects preferred with forEach
        arr[i] = x * 2;
    });
    return arr;
}

// 9) delete on array element -> leaves holes
function removeIndex(arr, idx) {
    delete arr[idx]; // BUG: leaves undefined at that index; use splice to remove
    return arr;
}

// 10) JSON.parse without try -> may throw
function safeParse(str) {
    return JSON.parse(str); // BUG: no try/catch, will throw on invalid JSON
}

// 11) Arrow function as method -> wrong 'this'
const user = {
    name: 'Alice',
    greet: () => {
        console.log('Hello', this.name); // BUG: arrow uses outer this, not the object
    }
};

// 12) Loose equality confusion
function equalsNull(x) {
    return x == null; // BUG: true for null and undefined; may be unintended
}

// Demonstration runs (some will produce errors or unexpected output)
console.log('checkStatus("ok") ->', checkStatus('ok')); // expected true? logic bug hides intent
console.log('sumArray([1,2,3]) ->', sumArray([1, 2, 3])); // likely NaN due to off-by-one
createTimers(); // prints incorrect values
console.log('sortNumbers([3,1,2]) ->', sortNumbers([3, 1, 2])); // unpredictable order

try {
    reassignConst(); // will throw TypeError
} catch (e) {
    console.error('reassignConst error:', e.message);
}

fetchData(); // missing await: logs a Promise, may silently fail
console.log('parseVersion("08") ->', parseVersion('08'));
console.log('doubleInPlace([1,2,3]) ->', doubleInPlace([1, 2, 3]));
console.log('removeIndex([1,2,3], 1) ->', removeIndex([1, 2, 3], 1));

try {
    console.log('safeParse("not json") ->', safeParse('not json')); // throws
} catch (e) {
    console.error('safeParse error:', e.message);
}

user.greet(); // wrong this
console.log('equalsNull(undefined) ->', equalsNull(undefined));