import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed script — populates only essential reference data required by the application.
 * Run with: npx prisma db seed
 *
 * Does NOT create mock users, mock issuers, or mock credentials.
 * Real issuers are registered on-chain via the Admin Portal.
 * Real credentials are issued via the Issuer Portal.
 */
async function main() {
  console.log('Seeding credential types...')

  // Credential Types — these are the on-chain typeIds used by the V2 circuit.
  // The integer `typeId` (auto-incremented) MUST match what is passed to
  // the `issue_credential` circuit argument. Keep these in sync with the contract.

  await prisma.credentialType.upsert({
    where: { name: 'COVID-19 Vaccination' },
    update: {},
    create: {
      name: 'COVID-19 Vaccination',
      description: 'Proof of full COVID-19 vaccination series.',
      onChainId: 'type_1'
    }
  })

  await prisma.credentialType.upsert({
    where: { name: 'Severe Allergy Record' },
    update: {},
    create: {
      name: 'Severe Allergy Record',
      description: 'Certified medical record of severe allergies (e.g. Penicillin, Latex).',
      onChainId: 'type_2'
    }
  })

  await prisma.credentialType.upsert({
    where: { name: 'Blood Type Certification' },
    update: {},
    create: {
      name: 'Blood Type Certification',
      description: 'Verified blood group and Rh factor.',
      onChainId: 'type_3'
    }
  })

  await prisma.credentialType.upsert({
    where: { name: 'Work Clearance' },
    update: {},
    create: {
      name: 'Work Clearance',
      description: 'Medical clearance for workplace fitness-to-work requirements.',
      onChainId: 'type_4'
    }
  })

  await prisma.credentialType.upsert({
    where: { name: 'Prescription Eligibility' },
    update: {},
    create: {
      name: 'Prescription Eligibility',
      description: 'Proof of a valid active prescription issued by a licensed physician.',
      onChainId: 'type_5'
    }
  })

  await prisma.credentialType.upsert({
    where: { name: 'Vaccination Status' },
    update: {},
    create: {
      name: 'Vaccination Status',
      description: 'General proof of up-to-date vaccination status per national schedule.',
      onChainId: 'type_6'
    }
  })

  console.log('✅ Credential types seeded. Real issuers and credentials are created on-chain via the application.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
