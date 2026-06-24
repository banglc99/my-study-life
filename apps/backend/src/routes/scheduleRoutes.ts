import express from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  completeSchedule,
  deleteSchedule,
  getSchedulesByDateRange
} from '../controllers/scheduleController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get schedules by date range
router.get('/range', getSchedulesByDateRange);

// CRUD operations
router.get('/', getSchedules);
router.get('/:id', getSchedule);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.put('/:id/complete', completeSchedule);
router.delete('/:id', deleteSchedule);

export default router;
