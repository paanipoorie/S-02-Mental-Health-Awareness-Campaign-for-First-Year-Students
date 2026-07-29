import { describe, it, expect } from 'vitest';
import { prisma } from '../../prisma/client.js';
import { postService } from '../../services/post.service.js';
import { PostCategory, EmotionType, UrgencyLevel } from '@campus-peer-support/shared-types';

async function createIdentity(email: string) {
  const user = await prisma.user.create({
    data: {
      universityEmail: email,
      passwordHash: 'hashed',
      role: 'STUDENT',
    },
  });
  const anon = await prisma.anonymousIdentity.create({
    data: {
      userId: user.id,
      displayName: `Anon ${email.split('@')[0]}`,
      avatarSeed: 444,
    },
  });
  return anon;
}

describe('Post Service Unit Tests', () => {
  it('should perform all CRUD operations on posts via service layer', async () => {
    const studentAnon = await createIdentity('postunit1@test.edu');
    const bystanderAnon = await createIdentity('postunit2@test.edu');

    // Create post
    const post = await postService.createPost(studentAnon.id, {
      title: 'Unit Test Post',
      body: 'Testing the post service layers directly.',
      category: PostCategory.GENERAL,
      emotion: EmotionType.HAPPY,
      urgencyLevel: UrgencyLevel.LOW,
    });

    expect(post).toBeDefined();
    expect(post.title).toBe('Unit Test Post');
    expect(post.anonymousIdentityId).toBe(studentAnon.id);

    // Get post list
    const postsResult = await postService.getPosts({ page: 1, limit: 10 });
    expect(postsResult.posts.length).toBeGreaterThanOrEqual(1);

    // Get post detail
    const postDetail = await postService.getPostById(post.id);
    expect(postDetail).not.toBeNull();
    expect(postDetail?.title).toBe('Unit Test Post');

    // Update post as someone else -> throws FORBIDDEN
    await expect(postService.updatePost(post.id, bystanderAnon.id, { title: 'Hacked title' }))
      .rejects.toThrow('FORBIDDEN');

    // Update post as author -> success
    const updatedPost = await postService.updatePost(post.id, studentAnon.id, { title: 'Updated Unit Title' });
    expect(updatedPost?.title).toBe('Updated Unit Title');

    // Create reply
    const reply = await postService.createReply(post.id, bystanderAnon.id, { body: 'Friendly unit test reply' });
    expect(reply).toBeDefined();
    expect(reply.body).toBe('Friendly unit test reply');

    // Delete reply as bystander author -> success
    const deleteReplyResult = await postService.deleteReply(post.id, reply.id, bystanderAnon.id);
    expect(deleteReplyResult).toBe(true);

    // Delete post as bystander -> throws FORBIDDEN
    await expect(postService.deletePost(post.id, bystanderAnon.id))
      .rejects.toThrow('FORBIDDEN');

    // Delete post as author -> success
    const deletePostResult = await postService.deletePost(post.id, studentAnon.id);
    expect(deletePostResult).toBe(true);
  });
});
