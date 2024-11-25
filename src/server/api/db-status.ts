import express from 'express';
import { prisma } from '../db';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tables = await Promise.all([
      prisma.user.findMany(),
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
      prisma.template.findMany(),
    ]);

    const tableNames = [
      'users',
      'quotes',
      'spaces',
      'cabinetItems',
      'orders',
      'receipts',
      'categories',
      'products',
      'presetValues',
      'pricingRules',
      'formulaSteps',
      'templates',
    ];

    const tableData = tables.map((data, index) => ({
      name: tableNames[index],
      count: data.length,
      data: data.map(item => ({
        ...item,
        createdAt: item.createdAt?.toISOString(),
        updatedAt: item.updatedAt?.toISOString(),
        sentAt: item.sentAt?.toISOString(),
      })),
    }));

    res.json({ tables: tableData });
  } catch (error) {
    console.error('Error fetching database status:', error);
    res.status(500).json({ error: 'Failed to fetch database status' });
  }
});

export default router;