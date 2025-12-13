import { Router } from 'express';
import { ticketController } from '../controllers';
import { verifyToken } from '../middlewares/authMiddleware';

const ticketRouter = Router();

// Apply verifyToken to all routes
ticketRouter.use(verifyToken);

ticketRouter.get('/', ticketController.getAllTickets);
ticketRouter.get('/:ticket_id', ticketController.getTicketById);
ticketRouter.post('/', ticketController.createTicket);
ticketRouter.put('/:ticket_id', ticketController.updateTicket);
ticketRouter.post('/:ticket_id/message', ticketController.replyTicket);
ticketRouter.delete('/:ticket_id', ticketController.deleteTicket);

export default ticketRouter;