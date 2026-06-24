import { Response } from 'express';
import Schedule from '../models/Schedule';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all schedules for user
// @route   GET /api/schedules
// @access  Private
export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const { subject, priority, completed } = req.query;
    const filter: any = { userId: req.userId };

    if (subject) filter.subject = subject;
    if (priority) filter.priority = priority;
    if (completed !== undefined) filter.completed = completed === 'true';

    const schedules = await Schedule.find(filter)
      .sort({ startTime: 1 })
      .exec();

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
export const getSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
      return;
    }

    // Check if user owns this schedule
    if (schedule.userId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this schedule'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private
export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const { title, description, startTime, endTime, subject, priority, breakDuration } = req.body;

    // Validation
    if (!title || !startTime || !endTime || !subject) {
      res.status(400).json({
        success: false,
        message: 'Please provide title, startTime, endTime, and subject'
      });
      return;
    }

    // Check if endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
      return;
    }

    const schedule = await Schedule.create({
      userId: req.userId,
      title,
      description,
      startTime,
      endTime,
      subject,
      priority: priority || 'medium',
      breakDuration: breakDuration || 5
    });

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private
export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
      return;
    }

    // Check if user owns this schedule
    if (schedule.userId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
      return;
    }

    // Check if endTime is after startTime if both are provided
    if (req.body.startTime && req.body.endTime) {
      if (new Date(req.body.endTime) <= new Date(req.body.startTime)) {
        res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
        return;
      }
    }

    schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Mark schedule as completed
// @route   PUT /api/schedules/:id/complete
// @access  Private
export const completeSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
      return;
    }

    // Check if user owns this schedule
    if (schedule.userId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
      return;
    }

    schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Schedule marked as completed',
      data: schedule
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private
export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
      return;
    }

    // Check if user owns this schedule
    if (schedule.userId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this schedule'
      });
      return;
    }

    await Schedule.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get schedules for date range
// @route   GET /api/schedules/range
// @access  Private
export const getSchedulesByDateRange = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
      return;
    }

    const schedules = await Schedule.find({
      userId: req.userId,
      startTime: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
