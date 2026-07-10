import { Request, Response } from 'express';
import Camera from '../models/Camera';

export const createCamera = async (req: Request, res: Response) => {
  try {
    const camera = await Camera.create(req.body);
    return res.status(201).json(camera);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCameras = async (req: Request, res: Response) => {
  try {
    const list = await Camera.find();
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCameraById = async (req: Request, res: Response) => {
  try {
    const camera = await Camera.findById(req.params.id);
    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    return res.json(camera);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCamera = async (req: Request, res: Response) => {
  try {
    const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    return res.json({ message: 'Camera updated successfully', camera });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCamera = async (req: Request, res: Response) => {
  try {
    const camera = await Camera.findByIdAndDelete(req.params.id);
    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    return res.json({ message: 'Camera deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Check health status or trigger camera preview
export const previewCameraStream = async (req: Request, res: Response) => {
  try {
    const camera = await Camera.findById(req.params.id);
    if (!camera) {
      return res.status(404).json({ message: 'Camera not found' });
    }

    // Toggle camera status to online for visualization, update health details
    camera.status = 'online';
    camera.lastSeen = new Date();
    await camera.save();

    // Send mock preview metadata (e.g. video sample link or dummy canvas signal)
    return res.json({
      status: camera.status,
      fps: camera.fps,
      resolution: camera.resolution,
      health: 'Healthy',
      streamUrl: camera.rtspUrl,
      previewUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop'
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
