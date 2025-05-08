# Disable Media Embeds

## Description

Replaces YouTube and Reddit embeds with plain links for faster page loading and cleaner appearance.

## Author

loregamer

## Features

- Converts YouTube video embeds to plain links
- Converts Reddit post embeds to plain links
- Preserves the original content URLs
- Works with both existing and dynamically added embeds

## Settings

Settings for this script are managed through the Forum Preferences → Threads tab:

| Setting                | Type     | Default | Description                             |
| ---------------------- | -------- | ------- | --------------------------------------- |
| Disable YouTube Embeds | checkbox | false   | Replace YouTube embeds with plain links |
| Disable Reddit Embeds  | checkbox | false   | Replace Reddit embeds with plain links  |

## Implementation Details

The script scans the page for media embeds and replaces them with direct links when the corresponding setting is enabled. It uses a MutationObserver to catch dynamically added embeds.

### YouTube Embed Detection

Looks for elements with the `data-s9e-mediaembed="youtube"` attribute, extracts the video ID from the iframe src, and replaces with a direct link to the YouTube video.

### Reddit Embed Detection

Looks for iframes with the `data-s9e-mediaembed="reddit"` attribute, extracts the post path from the iframe src, and replaces with a direct link to the Reddit post.
