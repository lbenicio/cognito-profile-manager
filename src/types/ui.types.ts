import type * as React from 'react';
import type { DialogProps } from '@radix-ui/react-dialog';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import type * as ToastPrimitives from '@radix-ui/react-toast';
import type { FieldPath, FieldValues } from 'react-hook-form';
import type { DayPicker } from 'react-day-picker';
import type { TooltipContentProps, TooltipProps } from 'recharts';
import type useEmblaCarousel from 'embla-carousel-react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

export type ButtonVariant =
  'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export type AlertVariant = 'default' | 'destructive';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export type CarouselApi = UseEmblaCarouselType[1];
export type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
export type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1];
export type CarouselVariant = ButtonVariant;

export interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
}

export interface CarouselContextProps extends CarouselProps {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

export type ChartTheme = 'light' | 'dark';

export type ChartConfigEntry =
  | {
      label?: React.ReactNode;
      icon?: React.ComponentType;
      color?: string;
      theme?: never;
    }
  | {
      label?: React.ReactNode;
      icon?: React.ComponentType;
      color?: never;
      theme: Record<ChartTheme, string>;
    };

export type ChartConfig = Record<string, ChartConfigEntry>;

export interface ChartContextProps {
  config: ChartConfig;
}

export interface ChartTooltipContentProps
  extends
    Partial<Pick<TooltipContentProps, 'active' | 'payload' | 'label'>>,
    Pick<TooltipProps, 'formatter' | 'labelFormatter'> {
  className?: string;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelClassName?: string;
  color?: string;
  nameKey?: string;
  labelKey?: string;
  config?: ChartConfig;
}

export type CommandDialogProps = DialogProps;

export interface DatePickerProps {
  value?: Date;
  onChangeAction: (date: Date | undefined) => void;
  placeholder: string;
}

export interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

export interface FormItemContextValue {
  id: string;
}

export interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export interface SidebarContext {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export interface ToastProps extends React.ComponentPropsWithoutRef<
  typeof ToastPrimitives.Root
> {
  variant?: 'default' | 'destructive';
}

export type ToastActionElement = React.ReactElement<
  React.ComponentProps<typeof ToastPrimitives.Action>
>;
