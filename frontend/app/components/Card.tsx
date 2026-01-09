import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = false, children, ...props }, ref) => {
    const hoverStyles = hover ? "hover:border-[var(--color-border-hover)] hover:shadow-lg hover:scale-[1.02] cursor-pointer" : "";
    
    return (
      <div
        ref={ref}
        className={`bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6 shadow-md transition-all duration-200 ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
