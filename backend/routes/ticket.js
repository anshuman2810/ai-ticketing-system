import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getTickets } from "../controllers/ticket.js";
import { getTicket } from "../controllers/ticket.js";
import { createTicket } from "../controllers/ticket.js";
import { replyToTicket } from '../controllers/ticket.js';
import { closeTicket } from '../controllers/ticket.js';

const router = express.Router();

router.get('/', authenticate, getTickets);
router.get('/:id', authenticate, getTicket);
router.post('/', authenticate, createTicket);
router.post("/:id/reply", authenticate, replyToTicket); 
router.put("/:id/close", authenticate, closeTicket); 

export default router;

