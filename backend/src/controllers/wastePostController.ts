import { Request, Response } from 'express';
import { WastePost, User, Review, Notification, sequelize } from '../models';
import { Op } from 'sequelize';

const getBusinessRating = async (businessId: number): Promise<number> => {
  try {
    const reviews = await Review.findAll({
      where: { businessId },
      attributes: ['rating'],
      raw: true
    });
    
    if (reviews.length === 0) return 0;
    const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
    return parseFloat(avgRating.toFixed(1));
  } catch (error) {
    return 0;
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};
export const createWastePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, wasteType, quantity, unit, condition, location, latitude, longitude, city, address, price, images, imageUrl } = req.body;
    const businessId = req.user?.id;

    if (!businessId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!title || !description || !wasteType || !quantity || !latitude || !longitude || !city || !address || !imageUrl) {
      return res.status(400).json({ message: 'Missing required fields: title, description, wasteType, quantity, latitude, longitude, city, address, imageUrl' });
    }

    if (req.user?.type !== 'business') {
      return res.status(403).json({ message: 'Only business users can create waste posts' });
    }

    let postImages: string[] = images || [];
    if (imageUrl && typeof imageUrl === 'string') {
      postImages = [imageUrl, ...postImages];
    }

    const wastePost = await WastePost.create({
      businessId,
      title,
      description,
      wasteType,
      quantity,
      unit: unit || 'kg',
      condition,
      location,
      latitude,
      longitude,
      city,
      address,
      price: price || null,
      images: postImages,
      status: 'active',
      visibility: 'public'
    });

    res.status(201).json({
      message: 'Waste post created successfully',
      data: wastePost
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating waste post', error: error.message });
  }
};

export const updateWastePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const businessId = req.user?.id;

    const wastePost = await WastePost.findByPk(id);
    if (!wastePost) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    if (wastePost.businessId !== businessId) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const { title, description, wasteType, quantity, unit, condition, location, latitude, longitude, city, address, price, images, imageUrl, status, visibility } = req.body;

    if (title) wastePost.title = title;
    if (description) wastePost.description = description;
    if (wasteType) wastePost.wasteType = wasteType;
    if (quantity) wastePost.quantity = quantity;
    if (unit) wastePost.unit = unit;
    if (condition) wastePost.condition = condition;
    if (location) wastePost.location = location;
    if (latitude) wastePost.latitude = latitude;
    if (longitude) wastePost.longitude = longitude;
    if (city) wastePost.city = city;
    if (address) wastePost.address = address;
    if (price) wastePost.price = price;
    
    if (images) {
      wastePost.images = images;
    }
    if (imageUrl && typeof imageUrl === 'string') {
      const currentImages = wastePost.images || [];
      wastePost.images = [imageUrl, ...currentImages];
    }
    
    if (status) wastePost.status = status;
    if (visibility) wastePost.visibility = visibility;

    await wastePost.save();

    res.status(200).json({
      message: 'Waste post updated successfully',
      data: wastePost
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating waste post', error: error.message });
  }
};

export const deleteWastePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const businessId = req.user?.id;

    const wastePost = await WastePost.findByPk(id);
    if (!wastePost) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    if (wastePost.businessId !== businessId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Check if there are active collections for this post
    const Collection = (sequelize as any).models.Collection;
    const activeCollections = await Collection.count({
      where: {
        postId: id,
        status: {
          [Op.in]: ['pending', 'approved', 'scheduled', 'confirmed']
        }
      }
    });

    if (activeCollections > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete waste post with active collection requests. Please cancel all pending requests first.',
        activeCollections
      });
    }

    // Safe to delete - no active collections
    await wastePost.destroy();

    res.status(200).json({
      message: 'Waste post deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting waste post', error: error.message });
  }
};

export const getWastePostStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const wastePost = await WastePost.findByPk(id, {
      attributes: ['id', 'status', 'availabilityCount', 'visibility', 'createdAt', 'updatedAt']
    });

    if (!wastePost) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    res.status(200).json({
      message: 'Waste post status retrieved',
      data: {
        postId: wastePost.id,
        status: wastePost.status,
        availabilityCount: wastePost.availabilityCount,
        visibility: wastePost.visibility,
        createdAt: wastePost.createdAt,
        updatedAt: wastePost.updatedAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving post status', error: error.message });
  }
};

export const getMarketplaceFeed = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    let order: any[] = [['createdAt', 'DESC']];
    if (sort === 'oldest') {
      order = [['createdAt', 'ASC']];
    }

    const { count, rows } = await WastePost.findAndCountAll({
      where: {
        status: 'active',
        visibility: 'public',
        collectionStatus: 'ACTIVE'
      },
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'phone', 'email']
        }
      ],
      order,
      limit: limitNum,
      offset,
      raw: false,
      subQuery: false
    });

    const totalPages = Math.ceil(count / limitNum);

    const normalizedRows = await Promise.all(rows.map(async (post: any) => {
      const postData = post.dataValues || post;
      const images = Array.isArray(postData.images) ? postData.images : [];
      const businessRating = await getBusinessRating(post.businessId);
      return {
        id: postData.id,
        title: postData.title,
        description: postData.description,
        wasteType: postData.wasteType,
        quantity: postData.quantity,
        unit: postData.unit,
        condition: postData.condition,
        location: postData.location,
        latitude: postData.latitude,
        longitude: postData.longitude,
        city: postData.city,
        address: postData.address,
        price: postData.price,
        imageUrl: images.length > 0 ? images[0] : null,
        status: postData.status,
        visibility: postData.visibility,
        businessId: postData.businessId,
        collectionStatus: postData.collectionStatus,
        CreatedAt: postData.createdAt,
        business: postData.business || null,
        businessRating
      };
    }));

    res.status(200).json({
      message: 'Marketplace feed retrieved',
      data: normalizedRows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving marketplace feed', error: error.message });
  }
};

export const getNearbyMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const { latitude, longitude, page = 1, limit = 20, distance = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const maxDistance = parseInt(distance as string) || 50;
    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    const allPosts = await WastePost.findAll({
      where: {
        status: 'active',
        visibility: 'public'
      },
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'phone', 'email']
        }
      ],
      raw: false
    });

    const postsWithDistance = allPosts
      .map((post: any) => {
        const postData = post.dataValues || post;
        const images = Array.isArray(postData.images) ? postData.images : [];
        return {
          ...postData,
          imageUrl: images.length > 0 ? images[0] : null,
          distance: calculateDistance(lat, lng, parseFloat(post.latitude), parseFloat(post.longitude))
        };
      })
      .filter((post: any) => post.distance <= maxDistance)
      .sort((a: any, b: any) => a.distance - b.distance);

    const total = postsWithDistance.length;
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedPosts = postsWithDistance.slice(offset, offset + limitNum);

    res.status(200).json({
      message: 'Nearby materials retrieved',
      data: paginatedPosts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving nearby materials', error: error.message });
  }
};

export const searchMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const searchQuery = req.query.q || req.query.keyword;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    if (!searchQuery || (searchQuery as string).trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const { count, rows } = await WastePost.findAndCountAll({
      where: {
        status: 'active',
        visibility: 'public',
        [require('sequelize').Op.or]: [
          { title: { [require('sequelize').Op.like]: `%${searchQuery}%` } },
          { description: { [require('sequelize').Op.like]: `%${searchQuery}%` } },
          { wasteType: { [require('sequelize').Op.like]: `%${searchQuery}%` } }
        ]
      },
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'phone', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      raw: false
    });

    const totalPages = Math.ceil(count / limitNum);

    const normalizedRows = rows.map((post: any) => {
      const postData = post.dataValues || post;
      const images = Array.isArray(postData.images) ? postData.images : [];
      return {
        ...postData,
        imageUrl: images.length > 0 ? images[0] : null
      };
    });

    res.status(200).json({
      message: 'Search results retrieved',
      data: normalizedRows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error searching materials', error: error.message });
  }
};

export const filterMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, condition, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'active',
      visibility: 'public'
    };

    if (type) {
      where.wasteType = type;
    }
    if (condition) {
      where.condition = condition;
    }

    const { count, rows } = await WastePost.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'phone', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      raw: false
    });

    const totalPages = Math.ceil(count / limitNum);

    const normalizedRows = rows.map((post: any) => {
      const postData = post.dataValues || post;
      const images = Array.isArray(postData.images) ? postData.images : [];
      return {
        ...postData,
        imageUrl: images.length > 0 ? images[0] : null
      };
    });

    res.status(200).json({
      message: 'Filtered materials retrieved',
      data: normalizedRows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error filtering materials', error: error.message });
  }
};

export const getBusinessMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await WastePost.findAndCountAll({
      where: {
        businessId,
        status: 'active',
        visibility: 'public'
      },
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      raw: false
    });

    const totalPages = Math.ceil(count / limitNum);

    const normalizedRows = rows.map((post: any) => {
      const postData = post.dataValues || post;
      const images = Array.isArray(postData.images) ? postData.images : [];
      return {
        ...postData,
        imageUrl: images.length > 0 ? images[0] : null
      };
    });

    res.status(200).json({
      message: "Business owner's materials retrieved",
      data: normalizedRows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving business materials', error: error.message });
  }
};

export const getBusinessProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const { businessId } = req.params;
    const { latitude, longitude } = req.query;

    const business = await User.findByPk(businessId, {
      attributes: ['id', 'businessName', 'phone', 'email', 'createdAt'],
      raw: true
    });

    if (!business) {
      return res.status(404).json({ message: 'Business owner not found' });
    }

    const materials = await WastePost.findAll({
      where: {
        businessId,
        visibility: 'public',
        status: 'active'
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'description', 'wasteType', 'quantity', 'unit', 'condition', 'images', 'latitude', 'longitude', 'createdAt'],
      raw: false
    });

    const normalizedMaterials = materials.map((post: any) => {
      const postData = post.dataValues || post;
      const images = Array.isArray(postData.images) ? postData.images : [];
      return {
        ...postData,
        imageUrl: images.length > 0 ? images[0] : null
      };
    });

    let distance = null;
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      if (!isNaN(lat) && !isNaN(lng) && normalizedMaterials.length > 0) {
        const firstMaterial = materials[0];
        distance = calculateDistance(lat, lng, parseFloat(firstMaterial.latitude), parseFloat(firstMaterial.longitude));
      }
    }

    res.status(200).json({
      message: 'Business profile retrieved',
      data: {
        business,
        materials: normalizedMaterials,
        distance: distance ? `${distance.toFixed(2)} km away` : null,
        totalMaterials: materials.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving business profile', error: error.message });
  }
};

export const getUserWastePosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const businessId = req.user?.id;

    if (!businessId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where: any = { businessId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await WastePost.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'phone', 'email'],
          required: false
        },
        {
          model: User,
          as: 'approvedRecycler',
          attributes: ['id', 'companyName', 'email', 'phone'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      raw: false,
      subQuery: false
    });

    const totalPages = Math.ceil(count / limitNum);

    const normalizedRows = rows.map((post: any) => {
      const postData = post.dataValues || post;
      const images = Array.isArray(postData.images) ? postData.images : [];
      
      return {
        id: postData.id,
        title: postData.title,
        description: postData.description,
        wasteType: postData.wasteType,
        quantity: postData.quantity,
        unit: postData.unit,
        condition: postData.condition,
        location: postData.location,
        latitude: postData.latitude,
        longitude: postData.longitude,
        city: postData.city,
        address: postData.address,
        price: postData.price,
        imageUrl: images.length > 0 ? images[0] : null,
        status: postData.status,
        visibility: postData.visibility,
        availabilityCount: postData.availabilityCount,
        collectionStatus: postData.collectionStatus,
        approvedRecyclerId: postData.approvedRecyclerId,
        pickupDeadline: postData.pickupDeadline,
        pickedUpAt: postData.pickedUpAt,
        businessId: postData.businessId,
        createdAt: postData.createdAt,
        updatedAt: postData.updatedAt,
        business: postData.business || null,
        approvedRecycler: postData.approvedRecycler || null
      };
    });

    res.status(200).json({
      message: 'User waste posts retrieved',
      data: normalizedRows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving user posts', error: error.message });
  }
};

export const getWastePostDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const wastePost = await WastePost.findByPk(id, {
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'phone', 'email', 'createdAt']
        }
      ]
    });

    if (!wastePost) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    let images: string[] = [];
    try {
      if (wastePost.images) {
        if (Array.isArray(wastePost.images)) {
          images = wastePost.images;
        } else if (typeof wastePost.images === 'string') {
          images = JSON.parse(wastePost.images);
        }
      }
    } catch (imgError) {
      images = [];
    }

    const responseData = {
      id: wastePost.id,
      title: wastePost.title,
      description: wastePost.description,
      wasteType: wastePost.wasteType,
      quantity: wastePost.quantity,
      unit: wastePost.unit,
      condition: wastePost.condition,
      status: wastePost.status,
      visibility: wastePost.visibility,
      address: wastePost.address,
      city: wastePost.city,
      latitude: wastePost.latitude,
      longitude: wastePost.longitude,
      price: wastePost.price,
      businessId: wastePost.businessId,
      collectionStatus: wastePost.collectionStatus,
      approvedRecyclerId: wastePost.approvedRecyclerId,
      pickupDeadline: wastePost.pickupDeadline,
      pickedUpAt: wastePost.pickedUpAt,
      images: images,
      createdAt: wastePost.createdAt,
      updatedAt: wastePost.updatedAt,
      business: wastePost.business ? {
        id: wastePost.business.id,
        businessName: wastePost.business.businessName,
        phone: wastePost.business.phone,
        email: wastePost.business.email,
        createdAt: wastePost.business.createdAt
      } : null
    };

    res.status(200).json({
      message: 'Waste post details retrieved',
      data: responseData
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving waste post details', error: error.message });
  }
};

export const approveRecycler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { recyclerId } = req.body;
    const businessId = req.user?.id;

    if (!recyclerId) {
      return res.status(400).json({ message: 'Recycler ID is required' });
    }

    const wastePost = await WastePost.findByPk(id);
    if (!wastePost) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    if (wastePost.businessId !== businessId) {
      return res.status(403).json({ message: 'You can only approve recyclers for your own posts' });
    }

    if (wastePost.collectionStatus !== 'ACTIVE') {
      return res.status(400).json({ 
        message: `Cannot approve recycler for post with status ${wastePost.collectionStatus}` 
      });
    }

    const recycler = await User.findByPk(recyclerId);
    if (!recycler || recycler.type !== 'recycler') {
      return res.status(404).json({ message: 'Recycler not found' });
    }

    // Check if there's a Collection record with a scheduled date for this recycler
    const Collection = (sequelize as any).models.Collection;
    const collection = await Collection.findOne({
      where: {
        postId: id,
        recyclerId: recyclerId
      }
    });

    // Calculate pickup deadline based on scheduled date or current time
    let pickupDeadline;
    if (collection && collection.scheduledDate) {
      // If scheduled, deadline is 1 hour BEFORE scheduled time
      pickupDeadline = new Date(new Date(collection.scheduledDate).getTime() - 60 * 60 * 1000);
    } else {
      // If not scheduled, deadline is 1 hour from now
      pickupDeadline = new Date(Date.now() + 60 * 60 * 1000);
    }

    wastePost.collectionStatus = 'APPROVED';
    wastePost.approvedRecyclerId = recyclerId;
    wastePost.pickupDeadline = pickupDeadline;
    await wastePost.save();

    await Notification.create({
      userId: recyclerId,
      type: 'COLLECTION_REQUEST',
      title: `Collection Approved`,
      message: `${wastePost.title} has been approved for collection. You have until ${new Date(pickupDeadline).toLocaleString()} to pick up.`,
      relatedId: wastePost.id
    });

    res.status(200).json({
      message: 'Recycler approved for collection',
      data: {
        postId: wastePost.id,
        collectionStatus: wastePost.collectionStatus,
        approvedRecyclerId: wastePost.approvedRecyclerId,
        pickupDeadline: wastePost.pickupDeadline
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error approving recycler', 
      error: error.message,
      details: error.stack
    });
  }
};

export const cancelApproval = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const businessId = req.user?.id;

    const wastePost = await WastePost.findByPk(id);
    if (!wastePost) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    if (wastePost.businessId !== businessId) {
      return res.status(403).json({ message: 'You can only cancel approvals for your own posts' });
    }

    if (wastePost.collectionStatus !== 'APPROVED') {
      return res.status(400).json({ 
        message: `Cannot cancel approval for post with status ${wastePost.collectionStatus}` 
      });
    }

    const recyclerId = wastePost.approvedRecyclerId;

    wastePost.collectionStatus = 'ACTIVE';
    wastePost.approvedRecyclerId = null;
    wastePost.pickupDeadline = null;
    await wastePost.save();

    if (recyclerId) {
      await Notification.create({
        userId: recyclerId,
        type: 'COLLECTION_REQUEST',
        title: `Collection Cancelled`,
        message: `${wastePost.title} collection request has been cancelled by the business owner.`,
        relatedId: wastePost.id
      });
    }

    res.status(200).json({
      message: 'Approval cancelled, post returned to active',
      data: {
        postId: wastePost.id,
        collectionStatus: wastePost.collectionStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error cancelling approval', error: error.message });
  }
};

export const markAsPickedUp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const recyclerId = req.user?.id;

    const wastePost = await WastePost.findByPk(id, {
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'email']
        },
        {
          model: User,
          as: 'approvedRecycler',
          attributes: ['id', 'companyName', 'email']
        }
      ]
    });

    if (!wastePost) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    if (wastePost.approvedRecyclerId !== recyclerId) {
      return res.status(403).json({ message: 'You are not approved to pick up this waste' });
    }

    if (wastePost.collectionStatus !== 'APPROVED') {
      return res.status(400).json({ 
        message: `Cannot mark pickup for post with status ${wastePost.collectionStatus}` 
      });
    }

    if (new Date() > new Date(wastePost.pickupDeadline!)) {
      wastePost.collectionStatus = 'ACTIVE';
      wastePost.approvedRecyclerId = null;
      wastePost.pickupDeadline = null;
      await wastePost.save();

      return res.status(400).json({ 
        message: 'Pickup deadline has expired' 
      });
    }

    wastePost.collectionStatus = 'COMPLETED';
    wastePost.pickedUpAt = new Date();
    wastePost.status = 'collected'; 
    await wastePost.save();

    await Notification.create({
      userId: wastePost.businessId,
      type: 'COLLECTION_REQUEST',
      title: `Collection Completed`,
      message: `${wastePost.title} has been picked up by ${(wastePost as any).approvedRecycler?.companyName || 'recycler'}`,
      relatedId: wastePost.id
    });

    res.status(200).json({
      message: 'Marked as picked up, collection completed',
      data: {
        postId: wastePost.id,
        collectionStatus: wastePost.collectionStatus,
        pickedUpAt: wastePost.pickedUpAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error marking pickup', error: error.message });
  }
};

export const getMyApprovedCollections = async (req: Request, res: Response): Promise<any> => {
  try {
    const recyclerId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await WastePost.findAndCountAll({
      where: {
        approvedRecyclerId: recyclerId,
        collectionStatus: {
          [Op.in]: ['APPROVED', 'PICKED_UP', 'COMPLETED']
        }
      },
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'phone', 'email'],
          required: false
        }
      ],
      order: [['pickupDeadline', 'ASC']], 
      limit: limitNum,
      offset,
      raw: false,
      subQuery: false
    });

    const totalPages = Math.ceil(count / limitNum);

    const normalizedRows = rows.map((post: any) => {
      const postData = post.dataValues || post;
      const images = Array.isArray(postData.images) ? postData.images : [];
      return {
        ...postData,
        imageUrl: images.length > 0 ? images[0] : null
      };
    });

    res.status(200).json({
      message: 'Approved collections retrieved',
      data: normalizedRows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving approved collections', error: error.message });
  }
};

export const getWasteCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const WasteCategory = (sequelize as any).models.WasteCategory;

    const categories = await WasteCategory.findAll({
      attributes: ['id', 'name', 'description', 'icon'],
      where: { isActive: true },
      order: [['name', 'ASC']],
      raw: true
    });

    res.status(200).json({
      message: 'Waste categories retrieved successfully',
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching waste categories', error: error.message });
  }
};
