import { Router } from 'express';
import { ticketController } from '../controllers';

const ticketRouter = Router();

ticketRouter.get('/', ticketController.getAllTickets);
ticketRouter.get('/:ticket_id', ticketController.getTicketById);
ticketRouter.post('/', ticketController.createTicket);
ticketRouter.put('/:ticket_id', ticketController.updateTicket);
ticketRouter.delete('/:ticket_id', ticketController.deleteTicket);

export default ticketRouter;