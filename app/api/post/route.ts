import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
    const posts = await prisma.post.findMany({
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
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                level: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    const totalPosts = await prisma.post.count();

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, image } = await request.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: "Content must be less than 1000 characters" }, { status: 400 });
  }

  const prisma = getPrisma();

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        image,
        authorId: user.id
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
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}