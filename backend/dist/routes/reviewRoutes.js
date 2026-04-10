"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
router.post('/', userAuthMiddleware_1.authenticateUser, rateLimiter_1.RateLimiter.middleware('createReview'), reviewController_1.ReviewController.createReview);
router.get('/business/:businessId', reviewController_1.ReviewController.getBusinessReviews);
router.get('/business/:businessId/rating', reviewController_1.ReviewController.getBusinessRating);
router.put('/:reviewId', userAuthMiddleware_1.authenticateUser, reviewController_1.ReviewController.updateReview);
router.delete('/:reviewId', userAuthMiddleware_1.authenticateUser, reviewController_1.ReviewController.deleteReview);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map