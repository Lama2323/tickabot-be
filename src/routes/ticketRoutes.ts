import { Router, Request, Response, NextFunction } from 'express';
import { ticketController } from '../controllers';

const ticketRouter = Router();

ticketRouter.get('/', (req: Request, res: Response) => {
  if (req.query.status && req.query.supporter_id) {
    return ticketController.getTicketsByStatus(req, res);
  }
  return ticketController.getAllTickets(req, res);
});

ticketRouter.get('/:ticket_id', ticketController.getTicketById);
ticketRouter.post('/', ticketController.createTicket);
ticketRouter.put('/:ticket_id', ticketController.updateTicket);
ticketRouter.delete('/:ticket_id', ticketController.deleteTicket);

export default ticketRouter;