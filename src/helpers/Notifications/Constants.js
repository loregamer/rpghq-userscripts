/**
 * @module helpers/Notifications/Constants
 * @description Constants specific to the Notifications feature.
 */

export const ONE_DAY = 24 * 60 * 60 * 1000;
export const FETCH_DELAY = 500; // Add delay between fetches (consider if still needed)

// Base style for displaying quoted content reference in notifications
export const REFERENCE_STYLE = {
  display: "inline-block",
  background: "rgba(23, 27, 36, 0.5)",
  color: "#ffffff",
  padding: "2px 4px",
  borderRadius: "2px",
  zIndex: "-1", // May not be needed if structure is flat
  maxWidth: "98%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  verticalAlign: "bottom", // Align better with text
  marginLeft: "4px",
  fontSize: "0.9em",
};

// Style for the notification block container
export const NOTIFICATION_BLOCK_STYLE = {
  position: "relative",
  paddingBottom: "20px", // Make room for the timestamp
};

// Style for the timestamp within a notification block
export const NOTIFICATION_TIME_STYLE = {
  position: "absolute",
  bottom: "2px",
  right: "2px",
  fontSize: "0.85em",
  color: "#888",
  pointerEvents: "none", // Prevent interfering with clicks
};

// Style for timestamp on the dedicated notification page (ucp.php?i=ucp_notifications)
// Note: This might be redundant if the selector can be more specific in CSS
export const NOTIFICATIONS_PAGE_TIME_STYLE = {
  position: "absolute",
  bottom: "2px",
  left: "2px", // Positioned differently on this page in original script
  fontSize: "0.85em",
  color: "#888",
  pointerEvents: "none",
};

// --- Reaction display ---
export const REACTION_SPAN_STYLE = {
  display: "inline-flex",
  marginLeft: "2px",
  verticalAlign: "middle",
};

export const REACTION_IMAGE_STYLE = {
  height: "1em !important",
  width: "auto !important",
  verticalAlign: "middle !important",
  marginRight: "2px !important",
};

// --- Color constants for notification types ---
// Keep consistent with forum or define a palette
export const COLOR_REACTED = "#3889ED"; // Blueish
export const COLOR_MENTIONED = "#FFC107"; // Gold/Yellow
export const COLOR_QUOTED = "#FF4A66"; // Reddish/Pink
export const COLOR_REPLY = "#95DB00"; // Greenish
export const COLOR_WARNING = "#D31141"; // Red
export const COLOR_REPORT_CLOSED = "#f58c05"; // Orange
export const COLOR_POST_APPROVAL = "#00AA00"; // Green

// --- Text styling ---
export const SUBTLE_TEXT_STYLE = {
  fontSize: "0.85em",
  padding: "0 0.25px",
};
