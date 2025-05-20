import { cn } from "@/lib/utils"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  children?: React.ReactNode
}

export function HeroSection({
  title,
  description,
  children,
  className,
  ...props
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 text-center",
        className
      )}
      {...props}
    >
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          {description}
        </p>
      )}
      {children}
    </div>
  )
} 