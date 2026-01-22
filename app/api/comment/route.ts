import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createCommentNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const prisma = getPrisma();

  try {
    const comments = await prisma.comment.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
            characterClass: {
              select: { name: true, icon: true }
            }
          }
        },
        post: {
          select: {
            id: true,
            content: true
          }
        }
      }
    });

    const totalComments = await prisma.comment.count();

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total: totalComments,
        pages: Math.ceil(totalComments / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, content } = await request.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "Content must be less than 500 characters" }, { status: 400 });
  }
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
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        postId: post.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
            characterClass: {
              select: { name: true, icon: true }
            }
          }
        },
        post: {
          select: {
            id: true,
            content: true
          }
        }
      }
    });

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== user.id) {
      await createCommentNotification(post.authorId, user.id, post.id, comment.id);
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
