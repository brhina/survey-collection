import { Request, Response } from 'express';
import Survey from '../models/Survey';

// Create a new survey
export const createSurvey = async (req: Request, res: Response): Promise<void> => {
  try {
    const survey = await Survey.create(req.body);
    res.status(201).json(survey);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create survey';
    res.status(400).json({ message });
  }
};

// Get all surveys
export const getAllSurveys = async (_req: Request, res: Response): Promise<void> => {
  try {
    const surveys = await Survey.find({ isActive: true });
    res.json(surveys);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch surveys';
    res.status(500).json({ message });
  }
};

// Get a single survey by ID
export const getSurveyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    res.json(survey);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch survey';
    res.status(500).json({ message });
  }
};

// Update a survey
export const updateSurvey = async (req: Request, res: Response): Promise<void> => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    res.json(survey);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update survey';
    res.status(400).json({ message });
  }
};

// Delete a survey (soft delete)
export const deleteSurvey = async (req: Request, res: Response): Promise<void> => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete survey';
    res.status(500).json({ message });
  }
};
