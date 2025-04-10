# Kalarion Reaction Auto-Marker

## Description

Marks smiley reaction notifs from Kalarion automagically so he can't rape you

## Author

loregamer

## Features

- Automatically marks notifications as read if they are from a username starting with "dolor"
- Checks for new notifications every 5 seconds

## Settings

| Setting  | Type     | Default | Description              |
| -------- | -------- | ------- | ------------------------ |
| setting1 | checkbox | false   | Description of setting 1 |

## Implementation Details

The script works by:

1. Scanning the page for notification items (looking for `li.bg2` elements)
2. Checking if the notification contains a username starting with "dolor"
3. If found, automatically clicking the "Mark read" button for that notification
4. The script runs immediately upon initialization and then every 5 seconds afterwards
5. When the script is disabled, the interval is cleared via the cleanup function
