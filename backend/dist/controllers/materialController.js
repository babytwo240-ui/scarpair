"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedMaterials = exports.getAllMaterials = exports.createMaterial = void 0;
const materialService = __importStar(require("../services/materialService"));
const cacheService_1 = __importDefault(require("../services/cacheService"));
const createMaterial = (req, res) => {
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
        cacheService_1.default.invalidateCachePrefix('materials').catch(err => console.error('Failed to invalidate materials cache:', err));
        res.status(201).json({
            message: 'Material posted successfully',
            data: material
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createMaterial = createMaterial;
const getAllMaterials = async (req, res) => {
    try {
        const cacheKey = cacheService_1.default.generateCacheKey('materials');
        // Try to get from cache first
        const cached = await cacheService_1.default.getCached(cacheKey);
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
        cacheService_1.default.setCached(cacheKey, materials, 3600).catch(err => console.error('Failed to cache materials:', err));
        res.status(200).json({
            message: 'All materials retrieved',
            count: materials.length,
            data: materials,
            cached: false
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllMaterials = getAllMaterials;
// Get recommended materials sa artist
const getRecommendedMaterials = async (req, res) => {
    try {
        const cacheKey = cacheService_1.default.generateCacheKey('materials', 'recommended');
        // Try cache
        const cached = await cacheService_1.default.getCached(cacheKey);
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
        cacheService_1.default.setCached(cacheKey, recommendedMaterials, 3600).catch(err => console.error('Failed to cache recommended materials:', err));
        res.status(200).json({
            message: 'Artist recommended materials',
            count: recommendedMaterials.length,
            data: recommendedMaterials,
            cached: false
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRecommendedMaterials = getRecommendedMaterials;
//# sourceMappingURL=materialController.js.map