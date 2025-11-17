import { Router, Request, Response, NextFunction } from 'express';
import { ticketController } from '../controllers';

const ticketRouter = Router();

// Can be used for both getting all tickets and filtering by status/supporter_id
ticketRouter.get('/', (req: Request, res: Response) => {
  // If status and supporter_id are provided, use the new endpoint
  if (req.query.status && req.query.supporter_id) {
    return ticketController.getTicketsByStatus(req, res);
  }
  // Otherwise, use the original getAllTickets
  return ticketController.getAllTickets(req, res);
});

ticketRouter.get('/:ticket_id', ticketController.getTicketById);
ticketRouter.post('/', ticketController.createTicket);
ticketRouter.put('/:ticket_id', ticketController.updateTicket);
ticketRouter.delete('/:ticket_id', ticketController.deleteTicket);

export default ticketRouter;