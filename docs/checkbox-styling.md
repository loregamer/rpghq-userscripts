# Checkbox Styling in RPGHQ Userscript Manager

This document describes the custom styling applied to checkboxes throughout the Userscript Manager.

## Styling Implementation

Checkboxes use custom CSS styling instead of browser defaults. The styling includes:

- Custom appearance with CSS
- Blue accent color when checked (using the success color variable)
- Checkmark using CSS pseudo-elements
- Hover and focus states for better UX
- Consistent sizing and appearance across the application

## HTML Usage

Checkboxes are used with a simple implementation:

```html
<input type="checkbox" name="example.setting.name" />
```

### Naming Convention

Checkboxes follow a naming convention for their `name` attribute:

- `notification.type.[notification_type].method.[method_name]` - For notification settings
- `user.display.[display_option]` - For user display options
- `[section].[category].[setting_name]` - For other settings

## CSS Implementation

The checkbox styling is defined in the `injectStyles.js` file, which is injected into the final userscript during the build process.

Key style features:

- Custom appearance with `-webkit-appearance: none` and similar for other browsers
- Consistent size (18x18px)
- Custom checkmark using `::after` pseudo-element
- Transitions for smooth state changes
- Focus styles for accessibility
