import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();

    // Seed default preset values
    await prisma.presetValues.create({
      data: {
        defaultHeight: 30,
        defaultWidth: 24,
        defaultDepth: 24,
        laborRate: 75,
        materialMarkup: 30,
        taxRate: 13,
        deliveryFee: 150,
        installationFee: 500,
        storageFee: 25,
        minimumOrder: 1000,
        rushOrderFee: 15,
        shippingRate: 2.5,
        importTaxRate: 5,
        exchangeRate: 1,
      },
    });

    // Seed default categories
    const category = await prisma.category.create({
      data: {
        name: 'Kitchen Cabinets',
        description: 'Standard kitchen cabinet collection',
      },
    });

    // Seed default products
    await prisma.product.create({
      data: {
        name: 'Base Cabinet',
        categoryId: category.id,
        type: 'base',
        materials: ['solid_wood', 'mdf'],
        unitCost: 299.99,
        description: 'Standard base cabinet',
      },
    });

    // Seed default pricing rules
    await prisma.pricingRule.create({
      data: {
        name: 'Base Cost Calculation',
        result: 'unit_cost',
        formula: {
          create: [
            {
              leftOperand: 'base_price',
              operator: '*',
              rightOperand: 'material_markup',
              rightOperandType: 'factor',
              order: 1,
            },
          ],
        },
      },
    });

    // Seed default templates
    await prisma.template.create({
      data: {
        type: 'quote',
        settings: {
          companyInfo: {
            name: 'Your Company',
            address: '123 Business St\nCity, State 12345',
            phone: '(555) 123-4567',
            email: 'contact@company.com',
            website: 'www.company.com',
          },
          layout: {
            primaryColor: '#4F46E5',
            fontFamily: 'Inter',
            showLogo: true,
            showCompanyInfo: true,
          },
        },
      },
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();