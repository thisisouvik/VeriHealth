VeriHealth: Proving Health Facts Without Sharing Health Data


Healthcare data sharing today is fundamentally broken because it operates on an all-or-nothing basis. When a patient needs to prove a single fact — that they're vaccinated, eligible for a procedure, or free of a particular allergy — they typically must hand over an entire medical record or portal login. Every organization that receives this data becomes a new point of failure: a database to secure, a target to breach, and a liability under regulations like HIPAA and GDPR, which explicitly demand data minimization. The tools available today force a choice between usability and privacy, when the law requires both.


VeriHealth solves this by building a zero-knowledge health credential network on Midnight. Hospitals and labs issue medical facts as cryptographically signed credentials, but the underlying data never leaves the patient's device. When a patient needs to prove something to an employer, insurer, or pharmacy, their wallet generates a zero-knowledge proof — mathematical evidence that the fact is true — without revealing why. Verifiers check this proof on-chain in milliseconds, learning only the answer, never the record. This is possible because Midnight separates public and private state at the protocol level, compiles privacy logic through its developer-friendly Compact language, and supports compliance reporting for regulators without compromising everyday user privacy.


The product's edge lies in features most health-tech platforms don't attempt: an on-chain registry of verified issuers so proofs carry institutional trust, not self-reported claims; revocation and expiry so outdated credentials automatically fail verification; range proofs that let a patient prove a lab value falls within a safe threshold without disclosing the number itself; and a separate compliance channel so regulators get required reporting without breaking the platform's privacy guarantee for everyone else. Because there is no central medical database, VeriHealth also eliminates the honeypot risk that makes healthcare breaches so damaging.


The business model follows the architecture rather than fighting it. Instead of monetizing patient data, VeriHealth charges verifiers — employers, insurers, pharmacies — per-verification or subscription fees, much like existing identity-verification APIs. Issuers pay integration and per-credential fees to connect existing hospital systems. Regulated entities pay for an enterprise compliance tier, and the entire credential and verification stack can be white-labeled to telehealth or HR platforms that want privacy-preserving proofs built into their own products.


A concrete example illustrates the flow: a hospital issues a credential stating a patient is cleared for physically demanding work, without recording the underlying diagnosis. An employer's HR system requests proof; the patient's wallet generates a zero-knowledge proof confirming validity, issuer authenticity, and non-revocation; the employer sees only "valid: yes," never the medical reasoning. The same pattern extends naturally to vaccination checks, prescription eligibility, and insurance underwriting.


Building this responsibly means moving in phases: an MVP with a single credential type and issuer, followed by an issuer registry and revocation system, then richer range-based and composable proofs with delegated access for dependents, then a compliance layer and enterprise dashboards, and finally real legal review before any claim of regulatory compliance is made to actual institutions.


VeriHealth is, at its core, a direct answer to the problem Midnight was designed to solve: letting a regulated, high-stakes industry use blockchain's verifiability without abandoning the data protection its users are legally owed. We'd welcome Midnight's guidance on credential and revocation design patterns, and would be glad to explore testnet support as this moves from concept to pilot.


I want to build this for frontend Nextjs, sadcn UI component for good UI screens. for db I will use Prisma + Supabase + Redis for cache and for blockchain MoonLight ecosystem things. I my target here is Deployed Preprod contract address (verifiable on-chain).
