import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  register_issuer(context: __compactRuntime.CircuitContext<PS>,
                  caller_pk_0: Uint8Array,
                  new_issuer_pk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issue_credential(context: __compactRuntime.CircuitContext<PS>,
                   caller_pk_0: Uint8Array,
                   commitment_hash_0: Uint8Array,
                   type_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verify_credential(context: __compactRuntime.CircuitContext<PS>,
                    commitment_hash_0: Uint8Array,
                    expected_type_0: bigint): __compactRuntime.CircuitResults<PS, [boolean]>;
  revoke_credential(context: __compactRuntime.CircuitContext<PS>,
                    caller_pk_0: Uint8Array,
                    commitment_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  register_issuer(context: __compactRuntime.CircuitContext<PS>,
                  caller_pk_0: Uint8Array,
                  new_issuer_pk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issue_credential(context: __compactRuntime.CircuitContext<PS>,
                   caller_pk_0: Uint8Array,
                   commitment_hash_0: Uint8Array,
                   type_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verify_credential(context: __compactRuntime.CircuitContext<PS>,
                    commitment_hash_0: Uint8Array,
                    expected_type_0: bigint): __compactRuntime.CircuitResults<PS, [boolean]>;
  revoke_credential(context: __compactRuntime.CircuitContext<PS>,
                    caller_pk_0: Uint8Array,
                    commitment_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  register_issuer(context: __compactRuntime.CircuitContext<PS>,
                  caller_pk_0: Uint8Array,
                  new_issuer_pk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issue_credential(context: __compactRuntime.CircuitContext<PS>,
                   caller_pk_0: Uint8Array,
                   commitment_hash_0: Uint8Array,
                   type_id_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  verify_credential(context: __compactRuntime.CircuitContext<PS>,
                    commitment_hash_0: Uint8Array,
                    expected_type_0: bigint): __compactRuntime.CircuitResults<PS, [boolean]>;
  revoke_credential(context: __compactRuntime.CircuitContext<PS>,
                    caller_pk_0: Uint8Array,
                    commitment_hash_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly owner: Uint8Array;
  approved_issuers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  issued_credentials: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { is_valid: boolean,
                                 issuer_pk: Uint8Array,
                                 credential_type_id: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { is_valid: boolean, issuer_pk: Uint8Array, credential_type_id: bigint }]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               admin_pk_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
