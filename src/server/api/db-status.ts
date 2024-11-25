import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch data from all tables
    const [
      users,
      quotes,
      spaces,
      cabinetItems,
      orders,
      receipts,
      categories,
      products,
      presetValues,
      pricingRules,
      formulaSteps,
      templates
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } }),
      prisma.quote.findMany(),
      prisma.space.findMany(),
      prisma.cabinetItem.findMany(),
      prisma.order.findMany(),
      prisma.receipt.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.presetValues.findMany(),
      prisma.pricingRule.findMany(),
      prisma.formulaStep.findMany(),
      prisma.template.findMany()
    ]);

    // Map table data
    const tables = [
      { name: 'Users', data: users },
      { name: 'Quotes', data: quotes },
      { name: 'Spaces', data: spaces },
      { name: 'Cabinet Items', data: cabinetItems },
      { name: 'Orders', data: orders },
      { name: 'Receipts', data: receipts },
      { name: 'Categories', data: categories },
      { name: 'Products', data: products },
      { name: 'Preset Values', data: presetValues },
      { name: 'Pricing Rules', data: pricingRules },
      { name: 'Formula Steps', data: formulaSteps },
      { name: 'Templates', data: templates }
    ].map(table => ({
      name: table.name,
      count: table.data.length,
      data: table.data.map(item => ({
        ...item,
        createdAt: item.createdAt?.toISOString(),
        updatedAt: item.updatedAt?.toISOString(),
        sentAt: item.sentAt?.toISOString(),
        password: item.password ? '[HIDDEN]' : undefined
      }))
    }));

    res.json({ tables });
  } catch (error) {
    console.error('Error fetching database status:', error);
    res.status(500).json({ error: 'Failed to fetch database status' });
  }
});