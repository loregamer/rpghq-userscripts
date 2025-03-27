/**
 * Toggle the formatting of 4-digit numbers setting
 */
export function toggleFourDigitFormatting() {
  const newValue = !GM_getValue("formatFourDigits", false);
  GM_setValue("formatFourDigits", newValue);
  updateMenuLabel(newValue);
  location.reload();
}

/**
 * Update the menu command label based on the current setting
 * @param {boolean} formatFourDigits - Current setting for formatting 4-digit numbers
 */
export function updateMenuLabel(formatFourDigits) {
  const label = formatFourDigits
    ? "Disable 4-digit formatting"
    : "Enable 4-digit formatting";
  GM_unregisterMenuCommand("Toggle 4-digit formatting");
  GM_registerMenuCommand(label, toggleFourDigitFormatting);
}
