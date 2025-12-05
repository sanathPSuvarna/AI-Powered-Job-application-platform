# Color Scheme Guide for Mock Interview & Career Path Components

## Primary Color Palette

### Main Brand Colors
- **Primary Blue**: `#667eea` - Used for main buttons, headers, and primary actions
- **Primary Purple**: `#764ba2` - Used in gradients with primary blue
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Status Colors

#### Success (Green) - For completed tasks, correct answers, matched skills
- **Dark Green**: `#1b5e20` - Text color
- **Medium Green**: `#4caf50` - Border and accent color
- **Light Green Background**: `linear-gradient(135deg, #e8f5e8, #c8e6c9)`

#### Warning (Orange) - For missing skills, time warnings
- **Dark Orange**: `#e65100` - Text color
- **Medium Orange**: `#ff9800` - Border and accent color  
- **Light Orange Background**: `linear-gradient(135deg, #fff3e0, #ffcc02)`

#### Error (Red) - For poor performance, time critical
- **Dark Red**: `#b71c1c` - Text color
- **Medium Red**: `#f44336` - Border and accent color
- **Light Red Background**: `linear-gradient(135deg, #ffebee, #ffcdd2)`

#### Info (Blue) - For current skills, neutral information
- **Dark Blue**: `#0d47a1` - Text color
- **Medium Blue**: `#2196f3` - Border and accent color
- **Light Blue Background**: `linear-gradient(135deg, #e3f2fd, #bbdefb)`

## Usage Examples

### For Mock Interview Components:

```jsx
// Score Display
<div className="score-excellent">95/100</div>
<div className="score-good">80/100</div>
<div className="score-average">65/100</div>
<div className="score-poor">45/100</div>

// Difficulty Indicators
<div className="difficulty-easy">Easy Question</div>
<div className="difficulty-medium">Medium Question</div>
<div className="difficulty-hard">Hard Question</div>

// Feedback Sections
<div className="feedback-positive">Great job explaining the concept!</div>
<div className="feedback-neutral">Your answer is correct.</div>
<div className="feedback-improvement">Consider adding more examples.</div>

// Timer States
<div className="timer-safe">05:00</div>
<div className="timer-warning">02:30</div>
<div className="timer-danger">00:30</div>
```

### For Career Path Components:

```jsx
// Status Badges
<span className="status-excellent">Excellent</span>
<span className="status-good">Good</span>
<span className="status-fair">Fair</span>
<span className="status-poor">Needs Work</span>

// Skill Tags
<span className="skill-current">JavaScript</span>
<span className="skill-matched">React.js</span>
<span className="skill-missing">Node.js</span>
<span className="skill-optional">TypeScript</span>

// Resource Types
<span className="resource-type course">Course</span>
<span className="resource-type tutorial">Tutorial</span>
<span className="resource-type certification">Certification</span>
<span className="resource-type practice">Practice</span>
<span className="resource-type book">Book</span>
```

## CSS Classes Available

### Status Badges
- `.status-badge-success` - Green success badge
- `.status-badge-warning` - Orange warning badge  
- `.status-badge-error` - Red error badge
- `.status-badge-info` - Blue info badge

### Skill Tags
- `.skill-current` - Blue for current skills
- `.skill-matched` - Green for matched skills (with glow animation)
- `.skill-missing` - Orange for missing skills
- `.skill-optional` - Purple for optional skills

### Progress Bars
- `.progress-success` - Green progress bar
- `.progress-warning` - Orange progress bar
- `.progress-error` - Red progress bar
- `.progress-info` - Blue progress bar

### Animation Classes
- `.animate-fade-in` - Fade in from bottom animation
- `.animate-pulse` - Gentle pulsing animation
- `.animate-bounce` - Bouncing animation

### Utility Classes
- `.text-center`, `.text-left`, `.text-right` - Text alignment
- `.mb-1` to `.mb-4` - Margin bottom (8px to 32px)
- `.mt-1` to `.mt-4` - Margin top (8px to 32px)  
- `.p-1` to `.p-4` - Padding (8px to 32px)
- `.rounded`, `.rounded-lg`, `.rounded-xl`, `.rounded-full` - Border radius
- `.shadow`, `.shadow-md`, `.shadow-lg`, `.shadow-xl` - Box shadows

## How to Use

1. **Import the CSS files in your components:**
   ```jsx
   import './MockInterview.css';
   import './CareerPathSimulator.css';
   import '../styles/interview-career-utils.css';
   ```

2. **Apply classes to your JSX elements:**
   ```jsx
   <div className="interview-card animate-fade-in">
     <span className="status-badge-success">Completed</span>
     <div className="skill-matched">React.js</div>
   </div>
   ```

3. **Use CSS custom properties for consistent theming:**
   ```css
   .my-custom-element {
     background: var(--gradient-primary);
     color: var(--success-color);
   }
   ```

## Color Accessibility

All color combinations have been tested for accessibility:
- Text colors provide sufficient contrast against their backgrounds
- Important information is not conveyed by color alone
- Colors work well for users with color vision deficiencies

## Responsive Behavior

- All components adapt to mobile screens (< 768px)
- Font sizes and padding scale appropriately
- Touch-friendly button sizes on mobile devices