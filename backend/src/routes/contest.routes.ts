import { Router } from 'express';
import { getGlobalContests, getUpcomingContests } from '../controllers/contest.controller';
import { createReminder, getReminders, deleteReminder, exportContestICS } from '../controllers/reminder.controller';

const router = Router();

// Route to get cached global contests
router.get('/global', getGlobalContests);

// Route to get clean upcoming contests directly from kontests
router.get('/', getUpcomingContests);

// Reminders Routes
router.post('/reminders', createReminder);
router.get('/reminders/:userId', getReminders);
router.delete('/reminders/:id', deleteReminder);

// Export Event Route
router.get('/export/ics/:contestId', exportContestICS);

export default router;
