# Post Caching Utility

The Post Caching utility is a core feature of the RPGHQ Userscript Manager that automatically caches forum posts and topic information. This allows scripts to access post content and metadata without requiring additional network requests.

## Overview

The post caching system automatically runs on various forum pages:

- On topic view pages: caches all visible posts
- On reply/quote pages: caches posts in the "topic review" section
- On forum index and viewforum pages: caches topic IDs and URLs

This data is stored in the userscript's GM storage and can be accessed by any script through the provided utility functions.

## Usage in Scripts

To access the post caching functionality in your scripts, import the needed functions:

```javascript
import { getCachedPost, getCachedTopicInfo } from "../utils/postCache.js";
```

Alternatively, you can use the shared utility wrappers:

```javascript
import { sharedUtils } from "../utils/sharedUtils.js";

// Then use:
const postData = sharedUtils._getCachedPostData(postId);
const topicData = sharedUtils._getCachedTopicData(topicId);
```

## API Reference

### Get Cached Post

Retrieves a cached post by its ID.

```javascript
const postData = getCachedPost("123456");
```

Returns an object with post data if found, or null if not cached:

```javascript
{
  html: '<p>The post content in HTML format</p>',
  bbcode: '[b]The post content[/b] in BBCode format', // Only available for posts from topic review
  time: 1683456789123 // Timestamp when the post was cached
}
```

### Get Cached Topic Info

Retrieves cached information about a topic by its ID.

```javascript
const topicInfo = getCachedTopicInfo("7890");
```

Returns an object with topic data if found, or null if not cached:

```javascript
{
  lastSeen: 1683456789123, // Timestamp when the topic was last seen
  replyUrl: 'https://rpghq.org/forums/posting.php?mode=reply&t=7890' // URL to reply to the topic
}
```

## Cache Maintenance

The cache is automatically maintained:

- New posts are added when encountered
- Posts older than 7 days are periodically cleaned up to prevent excessive storage usage

## Implementation Details

The post caching utility consists of:

1. **postCache.js**: Core utility module containing cache management functions
2. **sharedUtils.js integration**: Wrappers and auto-caching functions in the shared utilities

The cache is automatically populated during normal forum browsing, so scripts can rely on post data being available in most cases without additional work.
