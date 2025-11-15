#!/usr/bin/env node
// Prime.js - Node.js port of Prime.java (supports CLI arg and JSON output)
const readline = require('readline');

function checkPrime(number) {
  if (!Number.isInteger(number)) return {isPrime: false, factors: []};
  if (number <= 1) return {isPrime: false, factors: getFactors(number)};

  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) {
      return {isPrime: false, factors: getFactors(number)};
    }
  }
  return {isPrime: true, factors: []};
}

function getFactors(number) {
  const factors = [];
  for (let i = 1; i <= Math.abs(number); i++) {
    if (number % i === 0) factors.push(i);
  }
  return factors;
}

function outputResult(n, jsonMode) {
  const result = checkPrime(n);
  if (jsonMode) {
    console.log(JSON.stringify({ number: n, isPrime: result.isPrime, factors: result.factors }));
  } else {
    if (result.isPrime) {
      console.log(`${n} is a prime number.`);
    } else {
      console.log(`${n} is not a prime number.`);
      process.stdout.write('Factors: ');
      console.log(result.factors.join(' '));
    }
  }
}

// Simple CLI parsing: first non-flag argument is taken as the number.
const argv = process.argv.slice(2);
let jsonMode = false;
let numArg;
for (const a of argv) {
  if (a === '--json' || a === '-j') jsonMode = true;
  else if (!a.startsWith('-') && numArg === undefined) numArg = a;
}

if (numArg !== undefined) {
  const n = parseInt(numArg, 10);
  if (Number.isNaN(n)) {
    if (jsonMode) console.log(JSON.stringify({ error: 'invalid integer', input: numArg }));
    else console.error('Input is not a valid integer.');
    process.exit(1);
  }
  outputResult(n, jsonMode);
} else {
  // interactive (works with piped input as well)
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter a number: ', (input) => {
    const n = parseInt(input, 10);
    if (Number.isNaN(n)) {
      if (jsonMode) console.log(JSON.stringify({ error: 'invalid integer', input }));
      else console.log('Input is not a valid integer.');
      rl.close();
      return;
    }
    outputResult(n, jsonMode);
    rl.close();
  });
}
