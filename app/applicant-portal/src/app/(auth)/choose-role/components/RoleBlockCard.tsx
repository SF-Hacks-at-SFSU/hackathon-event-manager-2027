import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/shadcn/utils';

import { LucideIcon } from 'lucide-react'; // optional type helper for icons
export function RoleBlock({
  title,
  body,
  onPrimary,
  selected,
  disabled = false,
  Icon
}: {
  title: string;
  body: string;
  onPrimary: () => void;
  selected?: boolean;
  disabled?: boolean;
  Icon?: LucideIcon;
}) {
  return (
    <Card
      onClick={disabled ? undefined : onPrimary}
      className={cn(
        'group h-full border transition-all duration-300 ease-out',
        disabled ? 'cursor-not-allowed border-muted bg-muted/40 opacity-60' : 'cursor-pointer',
        !disabled &&
          (selected
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-primary/40 hover:bg-muted/30')
      )}
    >
      <CardContent className="p-1 sm:p-2">
        <div className="flex items-start gap-4">
          {/* Optional icon */}
          {Icon && (
            <div
              className={cn(
                'mt-0.5 transition-colors duration-300',
                disabled
                  ? 'text-muted-foreground'
                  : selected
                    ? 'text-accent'
                    : 'text-accent group-hover:text-accent'
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{body}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
