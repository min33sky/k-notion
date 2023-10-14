import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';

/**
 * 아카이브로 문서를 이동 (소프트 삭제)
 */
export const archive = mutation({
  args: {
    id: v.id('documents'),
  },
  async handler(ctx, args) {
    //? 인증 여부와 이미 존재하는 문서인지 확인
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error('Not found');
    }

    if (existingDocument.userId !== userId) {
      throw new Error('Unauthorized');
    }

    //? 문서를 아카이브로 이동
    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    //? 해당 문서의 자식 문서들도 있다면 함께 이동시켜줘야 한다.
    const recursiveArchive = async (parentDocumentId: Id<'documents'>) => {
      const children = await ctx.db
        .query('documents')
        .withIndex('by_user_parent', (q) =>
          q.eq('userId', userId).eq('parentDocument', parentDocumentId),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        //? 해당 문서의 자식들에게도 적용
        await recursiveArchive(child._id);
      }
    };

    recursiveArchive(args.id);

    return document;
  },
});

/**
 * 사이드바 문서 목록 가져오기
 */
export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id('documents')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_user_parent', (q) =>
        q.eq('userId', userId).eq('parentDocument', args.parentDocument),
      )
      .filter((q) => q.eq(q.field('isArchived'), false))
      .order('desc')
      .collect();

    return documents;
  },
});

/**
 * 문서 만들기
 */
export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id('documents')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const document = await ctx.db.insert('documents', {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
    });

    return document;
  },
});
