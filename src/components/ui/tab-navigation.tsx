import React from "react";
import * as NavigationMenuPrimitives from "@radix-ui/react-navigation-menu";

import { cn } from "@/lib/utils";

function getSubtree(
  options: { asChild: boolean | undefined; children: React.ReactNode },
  content: React.ReactNode | ((children: React.ReactNode) => React.ReactNode)
) {
  const { asChild, children } = options;
  if (!asChild)
    return typeof content === "function" ? content(children) : content;

  const firstChild = React.Children.only(children) as React.ReactElement<{
    children?: React.ReactNode;
  }>;
  return React.cloneElement(firstChild, {
    children:
      typeof content === "function"
        ? content(firstChild.props.children)
        : content,
  });
}

const TabNavigation = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Root>,
    "orientation" | "defaultValue" | "dir"
  >
>(({ className, children, ...props }, forwardedRef) => (
  <NavigationMenuPrimitives.Root ref={forwardedRef} {...props} asChild={false}>
    <NavigationMenuPrimitives.List
      className={cn(
        // base
        "flex items-center justify-start whitespace-nowrap border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // border color following design system
        "border-border",
        className
      )}
    >
      {children}
    </NavigationMenuPrimitives.List>
  </NavigationMenuPrimitives.Root>
));

TabNavigation.displayName = "TabNavigation";

const TabNavigationLink = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Link>,
  Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Link>,
    "onSelect"
  > & { disabled?: boolean; active?: boolean }
>(
  (
    { asChild, disabled, active, className, children, ...props },
    forwardedRef
  ) => (
    <NavigationMenuPrimitives.Item className="flex" aria-disabled={disabled}>
      <NavigationMenuPrimitives.Link
        aria-disabled={disabled}
        data-active={active}
        className={cn(
          "group relative flex shrink-0 select-none items-center justify-center",
          disabled ? "pointer-events-none" : ""
        )}
        ref={forwardedRef}
        onSelect={() => {}}
        asChild={asChild}
        {...props}
      >
        {getSubtree({ asChild, children }, (children) => (
          <span
            className={cn(
              // base - following design system spacing and typography
              "-mb-px flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-[color,border-color] duration-200",
              // text color - using design system semantic tokens
              "text-muted-foreground",
              // hover - following design system hover patterns
              "group-hover:text-foreground group-hover:border-border",
              // selected - using primary color from design system
              "group-data-[active=true]:border-primary group-data-[active=true]:text-primary",
              // disabled - following design system disabled state
              disabled ? "pointer-events-none text-muted-foreground/50" : "",
              // focus - following design system focus patterns
              "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-offset-2",
              className
            )}
          >
            {children}
          </span>
        ))}
      </NavigationMenuPrimitives.Link>
    </NavigationMenuPrimitives.Item>
  )
);

TabNavigationLink.displayName = "TabNavigationLink";

export { TabNavigation, TabNavigationLink };
