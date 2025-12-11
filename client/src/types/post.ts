// Post types
export interface Post {
    $id: string;
    authorId: string;
    content: string;
    postType: 'skill_offer' | 'project_invite' | 'workshop' | 'learning_request';
    tags: string[];
    imageUrl?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    $createdAt: string;
    $updatedAt: string;
}

export interface PostWithAuthor extends Post {
    author: {
        $id: string;
        fullName: string;
        username: string;
        email: string;
        avatarUrl?: string;
        department?: string;
    };
}

export interface PostLike {
    $id: string;
    postId: string;
    userId: string;
    $createdAt: string;
}

export interface CreatePostData {
    content: string;
    postType: 'skill_offer' | 'project_invite' | 'workshop' | 'learning_request';
    tags?: string[];
    image?: File;
}

export interface PostComment {
    $id: string;
    postId: string;
    authorId: string;
    content: string;
    likesCount: number;
    $createdAt: string;
}

// API Response types
export interface PostsResponse {
    documents: Post[];
    total: number;
}

export interface InfinitePostsData {
    pages: PostsResponse[];
    pageParams: (number | undefined)[];
}
