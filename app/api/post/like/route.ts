import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createLikeNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await request.json();

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const prisma = getPrisma();

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id
        }
      }
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId: post.id
          }
        }
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: post.id
        }
      });

      // Create notification for post author (if not liking own post)
      if (post.authorId !== user.id) {
        await createLikeNotification(post.authorId, user.id, post.id);
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}