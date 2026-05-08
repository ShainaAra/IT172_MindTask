/**
 * Component: GlobalStyles
 * Description: Global CSS-in-JS component that injects styles into the document head.
 * Provides consistent styling across the entire application including:
 * - Font imports (Geist + Lora)
 * - CSS resets for consistent box model
 * - Scrollbar styling (themed based on dark/light mode)
 * - Animation keyframes (fadeIn, slideUp, popIn, bubbleIn, tdBounce)
 * - Utility classes for interactive elements (buttons, sidebar items, task cards)
 * - Markdown content styling for rendered pages (headings, paragraphs, lists, blockquotes)
 * - Priority badge styling (ph, pm, pl)
 * - Transition and hover effects
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.dark - Current theme mode (true for dark mode, false for light mode)
 *                              Used to conditionally style scrollbar thumb color
 * 
 * @returns {JSX.Element} Style component that renders raw CSS in <style> tag
 */
export default function GlobalStyles({ dark }) {
  return <style>{`
    /* Google Fonts Import - Geist for UI, Lora for headings */
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Lora:ital,wght@0,500;0,700;1,400&display=swap');
    
    /* CSS Reset - Box sizing and margin/padding removal */
    ,::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    
    /* Base HTML/Body Styles */
    html,body{height:100%;font-family:'Geist',sans-serif;}
    
    /* Custom Scrollbar Styling - Thin, clean scrollbar */
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${dark?"#2e2e2e":"#d0d0ce"};border-radius:4px;}
    
    /* Form Element Font Inheritance */
    input,textarea,button,select{font-family:'Geist',sans-serif;}
    textarea{resize:none;}
    
    /* Button Reset and Base Styles */
    button{cursor:pointer;border:none;outline:none;background:none;}
    
    /* Sidebar Item Styles */
    .sb-item{transition:background 0.12s;cursor:pointer;border-radius:7px;}
    .sb-item:hover{background:${dark?"#1e1e1e":"#eaeae8"};}
    .sb-item.active{background:${dark?"rgba(91,138,240,0.14)":"rgba(91,138,240,0.09)"};}
    
    /* Button Utility Classes */
    .btn{transition:all 0.15s;}
    .btn:hover{opacity:0.82;}
    .btn:active{transform:scale(0.96);}
    .tc{transition:background 0.12s,color 0.12s;} /* Transition for background and color */
    
    /* Task Card Hover Effect */
    .task-card{transition:transform 0.15s,box-shadow 0.15s;}
    .task-card:hover{transform:translateY(-2px);}
    
    /* Animation Keyframes and Classes */
    .fade-in{animation:fadeIn 0.3s ease;}
    .slide-up{animation:slideUp 0.38s cubic-bezier(0.16,1,0.3,1);}
    .pop-in{animation:popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275);}
    
    /* Fade In Animation */
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    
    /* Slide Up Animation - For modals and slide-in elements */
    @keyframes slideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    
    /* Pop In Animation - Scale and fade, for chat panel and modals */
    @keyframes popIn{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
    
    /* Bubble In Animation - For chat messages */
    .bubble{animation:bubbleIn 0.22s ease;}
    @keyframes bubbleIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    
    /* Typing Dots Animation - Bouncing dots for AI typing indicator */
    .td{animation:tdBounce 1.3s infinite ease-in-out;}
    .td:nth-child(2){animation-delay:0.18s;}  /* Second dot delay */
    .td:nth-child(3){animation-delay:0.36s;}  /* Third dot delay */
    @keyframes tdBounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-4px);opacity:1}}
    
    /* Markdown Content Styling (class: .pc = page content) */
    .pc h1{font-size:1.85rem;font-weight:700;margin:22px 0 10px;font-family:'Lora',serif;line-height:1.2;}
    .pc h2{font-size:1.25rem;font-weight:600;margin:18px 0 8px;}
    .pc h3{font-size:1.05rem;font-weight:600;margin:14px 0 6px;}
    .pc p{margin-bottom:8px;line-height:1.72;}
    .pc ul,.pc ol{padding-left:22px;margin-bottom:8px;}
    .pc li{margin-bottom:5px;line-height:1.65;}
    .pc blockquote{border-left:3px solid #5b8af0;padding-left:14px;opacity:0.75;font-style:italic;margin:14px 0;color:inherit;}
    .pc strong{font-weight:700;}
    .pc br{display:block;margin:4px 0;}
    
    /* Priority Badge Styles (ph = priority high, pm = priority medium, pl = priority low) */
    .ph{background:rgba(248,113,113,0.14);color:#f87171;}  /* High priority - red */
    .pm{background:rgba(251,191,36,0.14);color:#fbbf24;}   /* Medium priority - yellow */
    .pl{background:rgba(74,222,128,0.14);color:#4ade80;}   /* Low priority - green */
    
    /* Focus State Styles */
    .ai:focus{border-color:#5b8af0!important;box-shadow:0 0 0 3px rgba(91,138,240,0.15)!important;}
    
    /* Remove default focus outline (handled by custom styles) */
    input:focus,textarea:focus{outline:none;}
  `}</style>;
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────