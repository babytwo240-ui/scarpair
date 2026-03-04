import { Request, Response } from 'express';
import * as materialService from '../services/materialService';

const createMaterial = (req: Request, res: Response): any => {
  try {
    const { businessName, materialType, quantity, description, contactEmail } = req.body;

    if (!businessName || !materialType || !quantity || !contactEmail) {
      return res.status(400).json({
        error: 'Missing required fields: businessName, materialType, quantity, contactEmail'
      });
    }

    const material = materialService.addMaterial({
      businessName,
      materialType,
      quantity,
      description,
      contactEmail
    });

    res.status(201).json({
      message: 'Material posted successfully',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getAllMaterials = (req: Request, res: Response): any => {
  try {
    const materials = materialService.getAllMaterials();
    res.status(200).json({
      message: 'All materials retrieved',
      count: materials.length,
      data: materials
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get recommended materials sa artist
const getRecommendedMaterials = (req: Request, res: Response): any => {
  try {
    const recommendedMaterials = materialService.getRecommendedMaterials();
    res.status(200).json({
      message: 'Artist recommended materials',
      count: recommendedMaterials.length,
      data: recommendedMaterials
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { createMaterial, getAllMaterials, getRecommendedMaterials };
