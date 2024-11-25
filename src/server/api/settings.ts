import express from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const presetValuesSchema = z.object({
  defaultHeight: z.number(),
  defaultWidth: z.number(),
  defaultDepth: z.number(),
  laborRate: z.number(),
  materialMarkup: z.number(),
  taxRate: z.number(),
  deliveryFee: z.number(),
  installationFee: z.number(),
  storageFee: z.number(),
  minimumOrder: z.number(),
  rushOrderFee: z.number(),
  shippingRate: z.number(),
  importTaxRate: z.number(),
  exchangeRate: z.number(),
});

const pricingRuleSchema = z.object({
  name: z.string(),
  formula: z.array(z.object({
    leftOperand: z.string(),
    operator: z.string(),
    rightOperand: z.string(),
    rightOperandType: z.string(),
    order: z.number(),
  })),
  result: z.string(),
});

const templateSchema = z.object({
  type: z.string(),
  settings: z.record(z.any()),
});

// Preset Values
router.get('/preset-values', authenticateToken, async (req, res) => {
  try {
    const presetValues = await prisma.presetValues.findFirst();
    res.json(presetValues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preset values' });
  }
});

router.put('/preset-values', authenticateToken, async (req, res) => {
  try {
    const data = presetValuesSchema.parse(req.body);
    const presetValues = await prisma.presetValues.upsert({
      where: { id: '1' },
      update: data,
      create: { ...data, id: '1' },
    });
    res.json(presetValues);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update preset values' });
  }
});

// Pricing Rules
router.get('/pricing-rules', authenticateToken, async (req, res) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      include: {
        formula: {
          orderBy: { order: 'asc' },
        },
      },
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

router.post('/pricing-rules', authenticateToken, async (req, res) => {
  try {
    const data = pricingRuleSchema.parse(req.body);
    const rule = await prisma.pricingRule.create({
      data: {
        name: data.name,
        result: data.result,
        formula: {
          create: data.formula,
        },
      },
      include: {
        formula: true,
      },
    });
    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

// Templates
router.get('/templates/:type', authenticateToken, async (req, res) => {
  try {
    const template = await prisma.template.findFirst({
      where: { type: req.params.type },
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

router.put('/templates/:type', authenticateToken, async (req, res) => {
  try {
    const data = templateSchema.parse(req.body);
    const template = await prisma.template.upsert({
      where: { type: req.params.type },
      update: { settings: data.settings },
      create: {
        type: req.params.type,
        settings: data.settings,
      },
    });
    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update template' });
  }
});

export default router;