import { Router } from 'express';
import { HelpController } from '../controllers/help.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// FAQs
router.get('/faqs', HelpController.getFaqs);

// System Info
router.get('/system-info', HelpController.getSystemInfo);

// Tickets
router.get('/tickets', HelpController.getTickets);
router.post('/tickets', HelpController.createTicket);

export default router;
