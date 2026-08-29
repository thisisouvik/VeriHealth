const { Contract } = require('./contracts/artifacts/contract/index.js');
const { ContractExecutable } = require('@midnight-ntwrk/compact-js/dist/cjs/effect/ContractExecutable.js');
const contract = new Contract({});
try {
  console.log(ContractExecutable.make(contract));
} catch(e) {
  console.error(e.message);
}
