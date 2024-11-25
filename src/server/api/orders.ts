import express from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const orderSchema = z.object({
  quoteId: z.string(),
  clientName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  projectName: z.string(),
  installationAddress: z.string(),
  status: z.string(),
  total: z.number(),
  adjustmentType: z.string().optional(),
  adjustmentPercentage: z.number().optional(),
  adjustedTotal: z.number().optional(),
});

const receiptSchema = z.object({
  paymentPercentage: z.number(),
  amount: z.number(),
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        receipts: true,
        quote: {
          include: {
            spaces: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        receipts: true,
        quote: {
          include: {
            spaces: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = orderSchema.parse(req.body);
    const quote = await prisma.quote.findUnique({
      where: { id: data.quoteId },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const order = await prisma.order.create({
      data: {
        ...data,
        userId: req.user.id,
      },
      include: {
        receipts: true,
        quote: {
          include: {
            spaces: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/:id/receipts', authenticateToken, async (req, res) => {
  try {
    const data = receiptSchema.parse(req.body);
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { receipts: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const totalPercentage = order.receipts.reduce(
      (sum, receipt) => sum + receipt.paymentPercentage,
      0
    );

    if (totalPercentage + data.paymentPercentage > 100) {
      return res.status(400).json({ error: 'Total payment percentage cannot exceed 100%' });
    }

    const receipt = await prisma.receipt.create({
      data: {
        ...data,
        status: 'draft',
        orderId: req.params.id,
      },
    });

    res.status(201).json(receipt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create receipt' });
  }
});

router.put('/:orderId/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const receipt = await prisma.receipt.update({
      where: { id: req.params.receiptId },
      data: {
        status,
        sentAt: status === 'sent' ? new Date() : null,
      },
    });

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update receipt' });
  }
});

router.delete('/:orderId/receipts/:receiptId', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id: req.params.receiptId },
    });

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    if (receipt.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft receipts can be deleted' });
    }

    await prisma.receipt.delete({
      where: { id: req.params.receiptId },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete receipt' });
  }
});

export default router;