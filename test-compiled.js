const { Contract } = require('./contracts/artifacts/contract/index.js');
const CompiledContract = require('@midnight-ntwrk/compact-js/effect/CompiledContract');

let compiled = CompiledContract.make('verihealth', Contract);
compiled = CompiledContract.withVacantWitnesses(compiled);
console.log(compiled);
