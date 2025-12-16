import * as React from "react";

import { cn } from "@/shared/lib/cn";

const Card = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
};

const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 px-6",
        className
      )}
      {...props}
    />
  );
};

const CardTitle = ({ className, ...props }: React.ComponentProps<"h3">) => {
  return (
    <h3
      className={cn("typo-h5 text-card-foreground", className)}
      {...props}
    />
  );
};

const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};

const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div className={cn("px-6", className)} {...props} />;
};

const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("flex items-center px-6 pt-0", className)}
      {...props}
    />
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

