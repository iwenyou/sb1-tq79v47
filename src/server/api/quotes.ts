import express from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { handleDatabaseError } from '../utils/errors';

const router = express.Router();

const cabinetItemSchema = z.object({
  productId: z.string().optional(),
  material: z.string().optional(),
  width: z.number(),
  height: z.number(),
  depth: z.number(),
  price: z.number(),
});

const spaceSchema = z.object({
  name: z.string(),
  items: z.array(cabinetItemSchema),
});

const quoteSchema = z.object({
  clientName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  projectName: z.string(),
  installationAddress: z.string(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']),
  total: z.number(),
  adjustmentType: z.enum(['discount', 'surcharge']).optional(),
  adjustmentPercentage: z.number().optional(),
  adjustedTotal: z.number().optional(),
  spaces: z.array(spaceSchema),
});

// Get all quotes for the authenticated user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const quotes = await prisma.quote.findMany({
    where: { userId: req.user.id },
    include: {
      spaces: {
        include: {
          items: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(quotes);
}));

// Get a specific quote
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: {
      spaces: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }

  if (quote.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json(quote);
}));

// Create a new quote
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const data = quoteSchema.parse(req.body);

    const quote = await prisma.quote.create({
      data: {
        ...data,
        userId: req.user.id,
        spaces: {
          create: data.spaces.map(space => ({
            name: space.name,
            items: {
              create: space.items,
            },
          })),
        },
      },
      include: {
        spaces: {
          include: {
            items: true,
          },
        },
      },
    });

    res.status(201).json(quote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    throw handleDatabaseError(error);
  }
}));

// Update a quote
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const data = quoteSchema.parse(req.body);
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete existing spaces and items
    await prisma.cabinetItem.deleteMany({
      where: {
        space: {
          quoteId: req.params.id,
        },
      },
    });

    await prisma.space.deleteMany({
      where: {
        quoteId: req.params.id,
      },
    });

    // Create new spaces and items
    const updatedQuote = await prisma.quote.update({
      where: { id: req.params.id },
      data: {
        ...data,
        spaces: {
          create: data.spaces.map(space => ({
            name: space.name,
            items: {
              create: space.items,
            },
          })),
        },
      },
      include: {
        spaces: {
          include: {
            items: true,
          },
        },
      },
    });

    res.json(updatedQuote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    throw handleDatabaseError(error);
  }
}));

// Delete a quote
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
  });

  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }

  if (quote.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Delete associated spaces and items
  await prisma.cabinetItem.deleteMany({
    where: {
      space: {
        quoteId: req.params.id,
      },
    },
  });

  await prisma.space.deleteMany({
    where: {
      quoteId: req.params.id,
    },
  });

  await prisma.quote.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
}));

// Convert quote to order
router.post('/:id/convert', authenticateToken, asyncHandler(async (req, res) => {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: {
      spaces: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }

  if (quote.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (quote.status !== 'approved') {
    return res.status(400).json({ error: 'Only approved quotes can be converted to orders' });
  }

  const order = await prisma.order.create({
    data: {
      quoteId: quote.id,
      userId: req.user.id,
      clientName: quote.clientName,
      email: quote.email,
      phone: quote.phone,
      projectName: quote.projectName,
      installationAddress: quote.installationAddress,
      status: 'pending',
      total: quote.total,
      adjustmentType: quote.adjustmentType,
      adjustmentPercentage: quote.adjustmentPercentage,
      adjustedTotal: quote.adjustedTotal,
    },
    include: {
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
}));

export default router;