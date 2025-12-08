import { Request, Response } from 'express';
import { supporterService, teamService, userService, ticketService } from '../services';

export const adminController = {
  // --- Supporter CRUD ---
  getAllSupporters: async (req: Request, res: Response) => {
    try {
      const data = await supporterService.getAllSupporters();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getSupporterById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const data = await supporterService.getSupporterById(id);
      if (!data) {
        return res.status(404).json({ message: 'Supporter not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createSupporter: async (req: Request, res: Response) => {
    try {
      // supporter_id is required by service
      const { supporter_id, team_id, supporter_name, user_id } = req.body;
      if (!supporter_id || !supporter_name) {
        return res.status(400).json({ message: 'Supporter ID and Name are required' });
      }
      const data = await supporterService.createSupporter(
        supporter_id,
        team_id || null,
        supporter_name,
        user_id // optional
      );
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSupporter: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { team_id, supporter_name, user_id } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'Supporter ID is required' });
      }
      // Service updateSupporter requires team_id and supporter_name
      if (team_id === undefined || supporter_name === undefined) {
        return res.status(400).json({ message: 'Team ID and Supporter Name are required' });
      }

      const data = await supporterService.updateSupporter(id, team_id, supporter_name, user_id);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Supporter not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteSupporter: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      await supporterService.deleteSupporter(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // --- Team CRUD ---
  getAllTeams: async (req: Request, res: Response) => {
    try {
      const data = await teamService.getAllTeams();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getTeamById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const data = await teamService.getTeamById(id);
      if (!data) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createTeam: async (req: Request, res: Response) => {
    try {
      const { team_name, team_description } = req.body;
      if (!team_name) {
        return res.status(400).json({ message: 'Team Name is required' });
      }
      const data = await teamService.createTeam(team_name, team_description);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateTeam: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { team_name, team_description } = req.body;
      if (!id) return res.status(400).json({ message: 'Team ID is required' });
      if (!team_name) return res.status(400).json({ message: 'Team Name is required' });

      const data = await teamService.updateTeam(id, team_name, team_description || '');
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteTeam: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      await teamService.deleteTeam(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // --- User CRUD ---
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const data = await userService.getAllUsers();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const data = await userService.getUserById(id);
      if (!data) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      const { user_id, user_type, user_name } = req.body;
      if (!user_id || user_type === undefined || user_name === undefined) {
        return res.status(400).json({ message: 'User ID, Type, and Name are required' });
      }
      const data = await userService.createUser(user_id, user_type, user_name);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { user_type, user_name } = req.body;
      if (!id) return res.status(400).json({ message: 'User ID is required' });

      const data = await userService.updateUser(id, user_type, user_name);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // --- Ticket CRUD (Read, Update, Delete ONLY) ---
  getAllTickets: async (req: Request, res: Response) => {
    try {
      const data = await ticketService.getAllTickets();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getTicketById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const data = await ticketService.getTicketById(id);
      if (!data) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateTicket: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,
        response_content,
        team_id,
        user_id
      } = req.body;

      if (!id) return res.status(400).json({ message: 'Ticket ID is required' });

      // Assuming partial updates are allowed, or all fields required? 
      // The service signature implies we pass all of them.
      // ticketService.updateTicket(ticket_id, priority, content, tone, difficulty, response, team_id, user_id)

      const data = await ticketService.updateTicket(
        id,
        ticket_priority,
        ticket_content,
        ticket_tone,
        ticket_difficulty,
        response_content,
        team_id,
        user_id
      );
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteTicket: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      await ticketService.deleteTicket(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
