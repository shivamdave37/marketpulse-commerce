import { getDashboard } from '../services/analyticsService.js';

export async function dashboard(req, res, next) {
  try {
    const data = await getDashboard();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

