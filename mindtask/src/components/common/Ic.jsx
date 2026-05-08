// Icon path definitions mapping icon names to their SVG path strings
// Each path follows standard SVG path syntax for feather-style icons
const ICON_PATHS = {
  sun:     "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",  // Sun icon for light mode toggle
  moon:    "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",  // Moon icon for dark mode toggle
  plus:    "M12 5v14M5 12h14",  // Plus icon for adding items
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",  // Trash can icon for delete actions
  check:   "M20 6L9 17l-5-5",  // Checkmark icon for confirmation
  circle:  "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",  // Empty circle icon
  send:    "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",  // Send/paper airplane icon for chat submission
  menu:    "M3 12h18M3 6h18M3 18h18",  // Hamburger menu icon
  x:       "M18 6L6 18M6 6l12 12",  // Close/X icon for dismissing elements
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",  // Logout icon for sign out actions
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",  // Eye icon for showing password/visibility
  eyeOff:  "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22",  // Eye-off icon for hiding password/visibility
};

/**
 * Component: Ic
 * Description: A reusable SVG icon component that renders feather-style icons
 * 
 * @param {Object} props - Component properties
 * @param {string} props.n - The name/key of the icon to render (must exist in ICON_PATHS)
 * @param {number} [props.size=16] - Width and height of the icon in pixels
 * @param {Object} [props.style={}] - Additional inline styles to apply to the SVG
 * @param {string} [props.className=""] - CSS class names for additional styling
 * @param {string} [props.color=""] - Custom stroke color (defaults to currentColor)
 * 
 * @returns {JSX.Element} SVG element with the specified icon path
 * 
 * Usage example:
 * <Ic n="sun" size={24} color="#ff9800" />
 * <Ic n="menu" className="icon-class" />
 */
export default function Ic({ n, size=16, style={}, className="", color="" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={color || "currentColor"}  // Uses custom color or inherits from parent text color
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style} 
      className={className}
    >
      <path d={ICON_PATHS[n]} />  {/* Renders the specific SVG path for the requested icon */}
    </svg>
  );
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────