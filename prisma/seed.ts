const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const dietaryRestrictions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'low-carb',
  'high-protein'
]

async function main() {
  console.log('🌱 Starting seed...')

  // Create dietary restrictions
  for (const name of dietaryRestrictions) {
    await prisma.dietaryRestriction.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 