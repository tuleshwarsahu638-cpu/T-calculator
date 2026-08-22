// Small friendly loading messages shown while the assistant "thinks" —
// spelling of the name always stays exactly "Tuleshwar".
const MESSAGES = [
  "Tuleshwar सोच रहा है…",
  "Tuleshwar solution बना रहा है…",
  "Tuleshwar सवाल को समझ रहा है…",
  "Tuleshwar step-by-step तैयार कर रहा है…",
  "Tuleshwar answer check कर रहा है…",
];

export function randomTuleshwarMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}
