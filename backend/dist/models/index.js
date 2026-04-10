"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = exports.PasswordAudit = exports.Report = exports.PostRating = exports.UserRating = exports.Feedback = exports.WasteCategory = exports.SystemLog = exports.PostMessage = exports.Review = exports.Notification = exports.Message = exports.Conversation = exports.Collection = exports.WastePost = exports.Material = exports.User = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const env = (process.env.NODE_ENV || 'development');
const dbConfig = database_1.default[env];
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: 'UTC' // Force all date handling to UTC - DO NOT APPLY LOCAL TIMEZONE CONVERSION
});
exports.sequelize = sequelize;
const User = require('./User')(sequelize);
exports.User = User;
const Material = require('./Material')(sequelize);
exports.Material = Material;
const WastePost = require('./WastePost')(sequelize);
exports.WastePost = WastePost;
const Collection = require('./Collection')(sequelize);
exports.Collection = Collection;
const Review = require('./Review')(sequelize);
exports.Review = Review;
const PostMessage = require('./PostMessage')(sequelize);
exports.PostMessage = PostMessage;
const SystemLog = require('./SystemLog')(sequelize);
exports.SystemLog = SystemLog;
const WasteCategory = require('./WasteCategory')(sequelize);
exports.WasteCategory = WasteCategory;
const Feedback = require('./Feedback')(sequelize);
exports.Feedback = Feedback;
const UserRating = require('./UserRating')(sequelize);
exports.UserRating = UserRating;
const PostRating = require('./PostRating')(sequelize);
exports.PostRating = PostRating;
const Report = require('./Report')(sequelize);
exports.Report = Report;
const Conversation = require('./Conversation')(sequelize);
exports.Conversation = Conversation;
const Message = require('./Message')(sequelize);
exports.Message = Message;
const Notification = require('./Notification')(sequelize);
exports.Notification = Notification;
const PasswordAudit = require('./PasswordAudit')(sequelize);
exports.PasswordAudit = PasswordAudit;
const Subscription = require('./Subscription')(sequelize);
exports.Subscription = Subscription;
const models = {
    User,
    Material,
    WastePost,
    Collection,
    Conversation,
    Message,
    Notification,
    Review,
    PostMessage,
    SystemLog,
    WasteCategory,
    Feedback,
    UserRating,
    PostRating,
    Report,
    PasswordAudit,
    Subscription
};
Object.keys(models).forEach((key) => {
    if (models[key].associate) {
        models[key].associate(models);
    }
});
User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'conversationsAsP1' });
Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'conversationsAsP2' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });
Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
WastePost.hasMany(Conversation, { foreignKey: 'wastePostId' });
Conversation.belongsTo(WastePost, { foreignKey: 'wastePostId', as: 'wastePost' });
Review.belongsTo(User, { foreignKey: 'businessId', as: 'businessOwner' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
Review.belongsTo(WastePost, { foreignKey: 'postId', as: 'post' });
User.hasMany(Review, { foreignKey: 'businessId', as: 'reviews' });
PostMessage.belongsTo(WastePost, { foreignKey: 'postId', as: 'post' });
PostMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
PostMessage.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
WastePost.hasMany(PostMessage, { foreignKey: 'postId', as: 'messages' });
User.hasMany(PostMessage, { foreignKey: 'senderId', as: 'sentPostMessages' });
User.hasMany(PostMessage, { foreignKey: 'recipientId', as: 'receivedPostMessages' });
SystemLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SystemLog, { foreignKey: 'userId', as: 'systemLogs' });
Collection.hasMany(Feedback, { foreignKey: 'collectionId', as: 'feedbacks' });
User.hasMany(Feedback, { foreignKey: 'fromUserId', as: 'feedbackGiven' });
User.hasMany(Feedback, { foreignKey: 'toUserId', as: 'feedbackReceived' });
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reportsSubmitted' });
User.hasMany(Report, { foreignKey: 'reportedUserId', as: 'reportsReceived' });
User.hasMany(Report, { foreignKey: 'approvedBy', as: 'reportsApproved' });
PasswordAudit.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordAudit, { foreignKey: 'userId', as: 'passwordAudits' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
exports.default = models;
//# sourceMappingURL=index.js.map