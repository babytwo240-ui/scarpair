import { Request, Response } from 'express';
import * as materialService from '../services/materialService';
import CacheService from '../services/cacheService';

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

    // Invalidate cache on create
    CacheService.invalidateCachePrefix('materials').catch(err =>
      console.error('Failed to invalidate materials cache:', err)
    );

    res.status(201).json({
      message: 'Material posted successfully',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const getAllMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = CacheService.generateCacheKey('materials');
    
    // Try to get from cache first
    const cached = await CacheService.getCached<any[]>(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json({
        message: 'All materials retrieved (from cache)',
        count: cached.length,
        data: cached,
        cached: true
      });
    }

    // Not cached, fetch from service
    res.set('X-Cache', 'MISS');
    const materials = materialService.getAllMaterials();
    
    // Cache the result for 1 hour
    CacheService.setCached(cacheKey, materials, 3600).catch(err =>
      console.error('Failed to cache materials:', err)
    );

    res.status(200).json({
      message: 'All materials retrieved',
      count: materials.length,
      data: materials,
      cached: false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get recommended materials sa artist
const getRecommendedMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = CacheService.generateCacheKey('materials', 'recommended');
    
    // Try cache
    const cached = await CacheService.getCached<any[]>(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json({
        message: 'Artist recommended materials (from cache)',
        count: cached.length,
        data: cached,
        cached: true
      });
    }

    res.set('X-Cache', 'MISS');
    const recommendedMaterials = materialService.getRecommendedMaterials();
    
    // Cache for 1 hour
    CacheService.setCached(cacheKey, recommendedMaterials, 3600).catch(err =>
      console.error('Failed to cache recommended materials:', err)
    );

    res.status(200).json({
      message: 'Artist recommended materials',
      count: recommendedMaterials.length,
      data: recommendedMaterials,
      cached: false
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { createMaterial, getAllMaterials, getRecommendedMaterials };
