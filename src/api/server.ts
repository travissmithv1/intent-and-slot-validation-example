import express from 'express';
import dotenv from 'dotenv';
import { handleMessage, getUserSlots, clearUserSlots } from '../chat/chat-handler.js';
import { bookFlight } from '../booking/booking-service.js';
import { clearConversation } from '../chat/conversation-store.js';
import logger from '../observability/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
  });
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/chat', async (req, res) => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({
        error: 'Missing required fields: user_id and message',
      });
    }

    const response = await handleMessage(user_id, message);
    return res.json(response);
  } catch (error) {
    logger.error('Error in /chat endpoint', { error });
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.post('/book', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: 'Missing required field: user_id',
      });
    }

    const slots = getUserSlots(user_id);
    const result = await bookFlight(slots);

    if (result.success) {
      await clearConversation(user_id);
      clearUserSlots(user_id);
    }

    return res.json(result);
  } catch (error) {
    logger.error('Error in /book endpoint', { error });
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.delete('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await clearConversation(userId);
    clearUserSlots(userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error in /conversation/:userId endpoint', { error });
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({
    error: 'Internal server error',
  });
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`✓ Flight Booking API server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});
