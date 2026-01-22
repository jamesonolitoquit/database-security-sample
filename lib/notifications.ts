import { getPrisma } from './prisma';

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'friend_request'
  | 'friend_accepted'
  | 'post_mention'
  | 'comment_mention';

export interface NotificationData {
  relatedUserId?: string;
  postId?: string;
  commentId?: string;
}

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
}

export async function createNotification(data: CreateNotificationData) {
  const prisma = getPrisma();

  try {
    // Don't create notification for self-actions
    if (data.data?.relatedUserId && data.userId === data.data.relatedUserId) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data ? JSON.stringify(data.data) : null,
        read: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function createLikeNotification(
  postAuthorId: string,
  likerId: string,
  postId: string
) {
  const prisma = getPrisma();

  try {
    const liker = await prisma.user.findUnique({
      where: { id: likerId },
      select: { name: true },
    });

    if (!liker || !liker.name) return null;

    return await createNotification({
      userId: postAuthorId,
      type: 'like',
      title: 'New Like',
      message: `${liker.name} liked your post`,
      data: { relatedUserId: likerId, postId },
    });
  } catch (error) {
    console.error('Error creating like notification:', error);
    return null;
  }
}

export async function createCommentNotification(
  postAuthorId: string,
  commenterId: string,
  postId: string,
  commentId: string
) {
  const prisma = getPrisma();

  try {
    const commenter = await prisma.user.findUnique({
      where: { id: commenterId },
      select: { name: true },
    });

    if (!commenter || !commenter.name) return null;

    return await createNotification({
      userId: postAuthorId,
      type: 'comment',
      title: 'New Comment',
      message: `${commenter.name} commented on your post`,
      data: { relatedUserId: commenterId, postId, commentId },
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
    return null;
  }
}

export async function createFollowNotification(
  followedUserId: string,
  followerId: string
) {
  const prisma = getPrisma();

  try {
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    if (!follower || !follower.name) return null;

    return await createNotification({
      userId: followedUserId,
      type: 'follow',
      title: 'New Follower',
      message: `${follower.name} started following you`,
      data: { relatedUserId: followerId },
    });
  } catch (error) {
    console.error('Error creating follow notification:', error);
    return null;
  }
}

export async function createFriendRequestNotification(
  recipientId: string,
  senderId: string
) {
  const prisma = getPrisma();

  try {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    if (!sender || !sender.name) return null;

    return await createNotification({
      userId: recipientId,
      type: 'friend_request',
      title: 'Friend Request',
      message: `${sender.name} sent you a friend request`,
      data: { relatedUserId: senderId },
    });
  } catch (error) {
    console.error('Error creating friend request notification:', error);
    return null;
  }
}

export async function createFriendAcceptedNotification(
  recipientId: string,
  accepterId: string
) {
  const prisma = getPrisma();

  try {
    const accepter = await prisma.user.findUnique({
      where: { id: accepterId },
      select: { name: true },
    });

    if (!accepter || !accepter.name) return null;

    return await createNotification({
      userId: recipientId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${accepter.name} accepted your friend request`,
      data: { relatedUserId: accepterId },
    });
  } catch (error) {
    console.error('Error creating friend accepted notification:', error);
    return null;
  }
}