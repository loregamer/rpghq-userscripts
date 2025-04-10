# User Reaction Auto-Marker

## Description

Automatically marks and removes notifications from specified users

## Author

loregamer

## Features

- Automatically marks notifications as read if they are from usernames starting with "Kalarion" or "dolor"
- Checks for new notifications every 5 seconds
- Removes marked notifications from view

## Settings

| Setting  | Type     | Default | Description              |
| -------- | -------- | ------- | ------------------------ |
| setting1 | checkbox | false   | Description of setting 1 |

## Implementation Details

The script works by:

1. Scanning the page for notification items (looking for `li.bg2.notification-block` elements)
2. Checking if the notification contains a username starting with "Kalarion" or "dolor"
3. If found, automatically clicking the "Mark read" button for that notification
4. The script runs immediately upon initialization and then every 5 seconds afterwards
5. When the script is disabled, the interval is cleared via the cleanup function
