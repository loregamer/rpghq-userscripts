/**
 * Constants for notifications customization
 */

// Time constants
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const FETCH_DELAY = 500; // Delay between fetches in milliseconds

// Style constants
export const REFERENCE_STYLE = {
  display: "inline-block",
  background: "rgba(23, 27, 36, 0.5)",
  color: "#ffffff",
  padding: "2px 4px",
  borderRadius: "2px",
  zIndex: "-1",
  maxWidth: "98%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const NOTIFICATION_BLOCK_STYLE = {
  position: "relative",
  paddingBottom: "20px", // Make room for the timestamp
};

export const NOTIFICATION_TIME_STYLE = {
  position: "absolute",
  bottom: "2px",
  right: "2px",
  fontSize: "0.85em",
  color: "#888",
};

export const NOTIFICATIONS_TIME_STYLE = {
  position: "absolute",
  bottom: "2px",
  left: "2px",
  fontSize: "0.85em",
  color: "#888",
};