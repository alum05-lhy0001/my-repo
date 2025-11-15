#!/usr/bin/env node
// Max_List.js - Node.js port of Max_List.java
// Usage: interactive tokens. Enter numbers one per token, 'M' to show full stats and exit, 'N' to show minimum and exit.
const readline = require('readline');

function fmt(d) {
  if (!Number.isFinite(d)) return String(d);
  let s = d.toFixed(6);
  // trim trailing zeros and optional trailing dot
  s = s.replace(/(\.\d*?)0+$/, '$1');
  s = s.replace(/\.$/, '');
  return s;
}

function computeModes(freq) {
  let best = 0;
  const modes = [];
  for (const k of Object.keys(freq)) {
    const v = freq[k];
    if (v > best) { best = v; modes.length = 0; modes.push(Number(k)); }
    else if (v === best) modes.push(Number(k));
  }
  return { best, modes };
}

function processTokens(tokens, state, jsonMode) {
  for (const tokenRaw of tokens) {
    const token = tokenRaw.trim();
    if (token === '') continue;

    if (token.toUpperCase() === 'M') {
      if (!state.haveNumber) {
        if (jsonMode) console.log(JSON.stringify({ error: 'No numbers were entered.' }));
        else console.log('No numbers were entered.');
        return { done: true };
      }
      const average = state.mean;
      const variance = (state.count > 0) ? (state.m2 / state.count) : 0.0;
      const stddev = Math.sqrt(variance);

      if (jsonMode) {
        const { best, modes } = computeModes(state.freq);
        const out = { maximum: state.max, minimum: state.min, sum: state.sum, count: state.count, average, variance, stddev, modes: (best <= 1) ? [] : modes, modeFrequency: (best <= 1) ? 0 : best };
        console.log(JSON.stringify(out));
      } else {
        console.log('Maximum = ' + fmt(state.max));
        console.log('Minimum = ' + fmt(state.min));
        console.log('Sum = ' + fmt(state.sum));
        console.log('Count = ' + state.count);
        console.log('Average = ' + fmt(average));
        console.log('Variance (population) = ' + fmt(variance));
        console.log('Standard deviation (population) = ' + fmt(stddev));

        const { best, modes } = computeModes(state.freq);
        if (best <= 1) console.log('Mode: none (all values are unique)');
        else {
          process.stdout.write('Mode(s) (frequency=' + best + '): ');
          for (let i = 0; i < modes.length; i++) {
            process.stdout.write(fmt(modes[i]));
            if (i < modes.length - 1) process.stdout.write(', ');
          }
          process.stdout.write('\n');
        }
      }
      return { done: true };
    }

    if (token.toUpperCase() === 'N') {
      if (jsonMode) {
        if (!state.haveNumber) console.log(JSON.stringify({ error: 'No numbers were entered.' }));
        else console.log(JSON.stringify({ minimum: state.min }));
      } else {
        if (!state.haveNumber) console.log('No numbers were entered.');
        else console.log('Minimum = ' + fmt(state.min));
      }
      return { done: true };
    }

    const val = Number(token);
    if (Number.isNaN(val)) {
      if (!jsonMode) console.log("Invalid input. Enter a number, or 'M'/'N' to finish.");
      continue;
    }

    if (!state.haveNumber) {
      state.max = val; state.min = val; state.haveNumber = true;
    } else {
      if (val > state.max) state.max = val;
      if (val < state.min) state.min = val;
    }

    state.count += 1;
    state.sum += val;
    const delta = val - state.mean;
    state.mean += delta / state.count;
    state.m2 += delta * (val - state.mean);

    const key = String(val);
    state.freq[key] = (state.freq[key] || 0) + 1;
  }
  return { done: false };
}

// CLI parsing
const argv = process.argv.slice(2);
let jsonMode = false;
const args = [];
for (const a of argv) {
  if (a === '--json' || a === '-j') jsonMode = true;
  else args.push(a);
}

const state = { max: -Infinity, min: Infinity, haveNumber: false, count: 0, sum: 0.0, mean: 0.0, m2: 0.0, freq: {} };

if (args.length > 0) {
  const res = processTokens(args, state, jsonMode);
  if (res.done) process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.setPrompt('> ');
rl.prompt();
rl.on('line', (line) => {
  const tokens = line.trim().split(/\s+/);
  const res = processTokens(tokens, state, jsonMode);
  if (res.done) { rl.close(); return; }
  rl.prompt();
}).on('close', () => {
  if (!state.haveNumber) {
    if (jsonMode) console.log(JSON.stringify({ info: 'No more input. Exiting.' }));
    else console.log('No more input. Exiting.');
  }
  process.exit(0);
});
