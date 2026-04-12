/**
 * Central API export point
 * Import all API service modules for easy access
 */

// Import all service modules first
import * as authAPI from './auth';
import * as userAPI from './user';
import * as wastePostAPI from './waste-post';
import * as collectionAPI from './collection';
import * as messageAPI from './message';
import * as conversationAPI from './conversation';
import * as materialAPI from './material';
import * as ratingAPI from './rating';
import * as notificationAPI from './notification';
import * as imageAPI from './image';
import * as reportAPI from './report';
import * as feedbackAPI from './feedback';
import authService from './auth/authService';
import userService from './users/userService';
import wastePostService from './wastePosts/wastePostService';
import collectionService from './collections/collectionService';
import messageService from './messages/messageService';
import notificationService from './notifications/notificationService';
import ratingService from './ratings/ratingService';
import feedbackServiceModule from './feedback/feedbackService';
import subscriptionService from './subscriptions/subscriptionService';
import { reportAPI as reportAPIExport } from './report';
import { feedbackAPI as feedbackAPIExport } from './feedback';

// Export individual services
export {
  authService,
  userService,
  wastePostService,
  collectionService,
  messageService,
  notificationService,
  ratingService,
  feedbackServiceModule as feedbackService,
  subscriptionService,
  reportAPIExport as reportAPI,
  feedbackAPIExport as feedbackAPI,
};

// Export as namespace
export default {
  authAPI,
  userAPI,
  wastePostAPI,
  collectionAPI,
  messageAPI,
  conversationAPI,
  materialAPI,
  ratingAPI,
  notificationAPI,
  imageAPI,
  reportAPI,
  feedbackAPI,
};
