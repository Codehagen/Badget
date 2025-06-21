# Marketing Pages Layout Guide

This guide explains how to create consistent marketing pages using Badget's design system, specifically focusing on the border styling and decorative elements.

## Layout Structure

All marketing pages should follow this hierarchical structure:

```jsx
<main className="flex flex-col items-center justify-center w-full relative px-5 md:px-10 py-20">
  <div className="border-x mx-5 md:mx-10 relative w-full max-w-4xl">
    {/* Decorative borders */}
    <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
    <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
    
    <div className="px-6 md:px-10 py-10">
      {/* Page content goes here */}
    </div>
  </div>
</main>
```

## Key Components Breakdown

### 1. Main Container
```jsx
<main className="flex flex-col items-center justify-center w-full relative px-5 md:px-10 py-20">
```
- `px-5 md:px-10`: Provides outer padding that pushes decorative borders to proper position
- `py-20`: Standard vertical padding for marketing pages
- `relative`: Required for absolute positioning of decorative elements

### 2. Border Container
```jsx
<div className="border-x mx-5 md:mx-10 relative w-full max-w-4xl">
```
- `border-x`: Creates left and right borders
- `mx-5 md:mx-10`: Horizontal margins that work with outer padding
- `max-w-4xl`: Standard max width for marketing content
- `relative`: Positioning context for decorative borders

### 3. Decorative Side Borders
```jsx
{/* Left decorative border */}
<div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

{/* Right decorative border */}
<div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
```

**Key Properties:**
- `absolute top-0`: Positioned at top of container
- `-left-4 md:-left-14` / `-right-4 md:-right-14`: Negative positioning to extend outside border
- `h-full`: Full height of parent container
- `w-4 md:w-14`: Responsive width (16px mobile, 56px desktop)
- `text-primary/5`: Very subtle color using theme primary
- `bg-[size:10px_10px]`: Sets background pattern size
- `[background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]`: Creates diagonal stripe pattern

### 4. Content Container
```jsx
<div className="px-6 md:px-10 py-10">
  {/* Your page content */}
</div>
```
- Inner padding for actual content
- Consistent spacing across all marketing pages

## Page Layout Patterns

### Standard Text Page (About, Legal, etc.)
```jsx
<div className="px-6 md:px-10 py-10 flex flex-col gap-8">
  <div className="text-center space-y-4">
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Page Title</h1>
    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
      Page description
    </p>
  </div>
  
  <div className="prose prose-gray max-w-none">
    {/* Content */}
  </div>
</div>
```

### Grid Layout (Contact, Features, etc.)
```jsx
<div className="px-6 md:px-10 py-10 flex flex-col gap-12">
  <div className="text-center space-y-4">
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Page Title</h1>
    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
      Page description
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Grid items with internal borders */}
    <div className="group p-8 border-r border-b border-border relative flex flex-col">
      {/* Content */}
    </div>
  </div>
</div>
```

## Border Variations

### Internal Grid Borders
For grid layouts (like contact page), use these border classes:
- Top-left: `border-r border-b border-border`
- Top-right: `border-b border-border`
- Bottom-left: `border-r border-border md:border-b-0`
- Bottom-right: `(no borders)`

### Section Separators
For content sections within a page:
```jsx
<div className="pt-8 border-t border-border">
  {/* Section content */}
</div>
```

## Examples

### Simple Text Page
See: `src/app/(marketing)/legal/privacy/page.tsx`

### Grid Layout Page
See: `src/app/(marketing)/contact/page.tsx`

### Complex Section Page
See: `src/components/sections/features-section.tsx`

## Common Mistakes to Avoid

1. **Missing outer padding**: Always include `px-5 md:px-10` on the main container
2. **Wrong positioning**: Decorative borders must be `-left-4 md:-left-14` and `-right-4 md:-right-14`
3. **Incorrect container structure**: Don't skip the border-x container
4. **Inconsistent spacing**: Always use the standard padding values
5. **Missing relative positioning**: Parent containers need `relative` for absolute decorative borders

## Design Consistency

- Always use `text-primary/5` for decorative border color
- Maintain consistent `max-w-4xl` for content width
- Use `py-20` for standard page vertical padding
- Follow the 3-layer container structure (main → border-x → content)

This structure ensures all marketing pages have consistent visual design and proper integration with the overall site layout defined in `src/app/(marketing)/layout.tsx`. 