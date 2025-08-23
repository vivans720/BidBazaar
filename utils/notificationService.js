const { createNotification } = require('../controllers/notificationController');

/**
 * Notification service for creating standardized notifications
 */
class NotificationService {
  
  /**
   * Create a bid placed notification
   */
  static async notifyBidPlaced(vendorId, bidderName, amount, productTitle, productId, bidId) {
    return await createNotification({
      recipient: vendorId,
      type: 'bid_placed',
      title: 'New Bid Placed',
      message: `${bidderName} placed a bid of ₹${amount} on your product "${productTitle}"`,
      data: {
        productId,
        bidId,
        amount,
        url: `/products/${productId}`
      }
    });
  }

  /**
   * Create an outbid notification
   */
  static async notifyOutbid(bidderId, amount, productTitle, productId, newAmount) {
    return await createNotification({
      recipient: bidderId,
      type: 'bid_outbid',
      title: 'You\'ve Been Outbid',
      message: `Your bid of ₹${amount} on "${productTitle}" has been outbid. New highest bid: ₹${newAmount}`,
      data: {
        productId,
        amount: newAmount,
        url: `/products/${productId}`
      }
    });
  }

  /**
   * Create auction won notification
   */
  static async notifyAuctionWon(winnerId, amount, productTitle, productId, bidId) {
    return await createNotification({
      recipient: winnerId,
      type: 'auction_won',
      title: 'Congratulations! You Won!',
      message: `You won the auction for "${productTitle}" with a bid of ₹${amount}`,
      data: {
        productId,
        bidId,
        amount,
        url: `/products/${productId}`
      }
    });
  }

  /**
   * Create auction lost notification
   */
  static async notifyAuctionLost(loserId, productTitle, productId, finalAmount) {
    return await createNotification({
      recipient: loserId,
      type: 'auction_lost',
      title: 'Auction Ended',
      message: `The auction for "${productTitle}" has ended. You were outbid. Final price: ₹${finalAmount}`,
      data: {
        productId,
        amount: finalAmount,
        url: `/products/${productId}`
      }
    });
  }

  /**
   * Create auction ending soon notification
   */
  static async notifyAuctionEndingSoon(userId, productTitle, productId, timeLeft) {
    return await createNotification({
      recipient: userId,
      type: 'auction_ending_soon',
      title: 'Auction Ending Soon',
      message: `The auction for "${productTitle}" ends in ${timeLeft}. Don't miss out!`,
      data: {
        productId,
        url: `/products/${productId}`
      }
    });
  }

  /**
   * Create payment received notification
   */
  static async notifyPaymentReceived(userId, amount, paymentMethod, newBalance) {
    return await createNotification({
      recipient: userId,
      type: 'payment_received',
      title: 'Funds Added Successfully',
      message: `₹${amount} has been added to your wallet via ${paymentMethod}. New balance: ₹${newBalance}`,
      data: {
        amount,
        url: '/wallet'
      }
    });
  }

  /**
   * Create payment refunded notification
   */
  static async notifyPaymentRefunded(userId, amount, reason, newBalance) {
    return await createNotification({
      recipient: userId,
      type: 'payment_refunded',
      title: 'Refund Processed',
      message: `₹${amount} has been refunded to your wallet. Reason: ${reason}. New balance: ₹${newBalance}`,
      data: {
        amount,
        url: '/wallet'
      }
    });
  }

  /**
   * Create product approved notification
   */
  static async notifyProductApproved(vendorId, productTitle, productId) {
    return await createNotification({
      recipient: vendorId,
      type: 'product_approved',
      title: 'Product Approved',
      message: `Your product "${productTitle}" has been approved and is now live for bidding`,
      data: {
        productId,
        url: `/products/${productId}`
      }
    });
  }

  /**
   * Create product rejected notification
   */
  static async notifyProductRejected(vendorId, productTitle, reason) {
    return await createNotification({
      recipient: vendorId,
      type: 'product_rejected',
      title: 'Product Rejected',
      message: `Your product "${productTitle}" has been rejected. Reason: ${reason}`,
      data: {
        url: '/dashboard'
      }
    });
  }

  /**
   * Create feedback received notification
   */
  static async notifyFeedbackReceived(vendorId, rating, productTitle, productId) {
    return await createNotification({
      recipient: vendorId,
      type: 'feedback_received',
      title: 'New Feedback Received',
      message: `You received a ${rating}-star rating for "${productTitle}"`,
      data: {
        productId,
        url: `/feedback/${productId}`
      }
    });
  }

  /**
   * Create system announcement notification
   */
  static async notifySystemAnnouncement(userId, title, message, url = null) {
    return await createNotification({
      recipient: userId,
      type: 'system_announcement',
      title,
      message,
      data: {
        url: url || '/'
      }
    });
  }

  /**
   * Bulk notify multiple users
   */
  static async bulkNotify(userIds, notificationData) {
    const promises = userIds.map(userId => 
      createNotification({
        ...notificationData,
        recipient: userId
      })
    );
    
    return await Promise.allSettled(promises);
  }
}

module.exports = NotificationService;
