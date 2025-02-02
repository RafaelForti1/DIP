import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';

const prisma = new PrismaClient();

export interface SignUpData {
  email: string;
  password: string;
  rg: string;
  rank: string;
  qra: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const db = {
  async signUp(data: SignUpData) {
    const hashedPassword = await hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        rg: data.rg,
        rank: data.rank,
        qra: data.qra,
      },
    });
  },

  async signIn(data: SignInData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await compare(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  },

  async resetPassword(email: string, newPassword: string) {
    const hashedPassword = await hash(newPassword, 10);
    
    return prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  },

  async createInvestigation(data: {
    title: string;
    priority: string;
    location?: string;
    videoUrl?: string;
    userId: string;
    timelineEntries: { time: string; description: string }[];
    evidenceImages: { url: string }[];
    locationImages: { url: string }[];
  }) {
    return prisma.investigation.create({
      data: {
        title: data.title,
        priority: data.priority,
        location: data.location,
        videoUrl: data.videoUrl,
        userId: data.userId,
        timelineEntries: {
          create: data.timelineEntries,
        },
        evidenceImages: {
          create: data.evidenceImages,
        },
        locationImages: {
          create: data.locationImages,
        },
      },
      include: {
        timelineEntries: true,
        evidenceImages: true,
        locationImages: true,
      },
    });
  },

  async getInvestigations(userId: string) {
    return prisma.investigation.findMany({
      where: { userId },
      include: {
        timelineEntries: true,
        evidenceImages: true,
        locationImages: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateInvestigation(id: string, data: {
    title?: string;
    status?: string;
    priority?: string;
    location?: string;
    videoUrl?: string;
    resolvedAt?: Date | null;
  }) {
    return prisma.investigation.update({
      where: { id },
      data,
      include: {
        timelineEntries: true,
        evidenceImages: true,
        locationImages: true,
      },
    });
  },
};