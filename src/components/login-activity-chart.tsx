'use client';

import type { LoginActivityChartProps } from '@/types/components.types';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Fingerprint } from '@/types/user/user.types';
import { useTranslations } from 'next-intl';
import { format, subDays, startOfDay } from 'date-fns';

export function LoginActivityChart({ fingerprint }: LoginActivityChartProps) {
  const t = useTranslations('Dashboard.loginActivity');

  const chartData = useMemo(() => {
    const dataPoints = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'EEE'), // Short day name e.g., "Mon"
        fullDate: format(date, 'yyyy-MM-dd'),
        logins: 0,
      };
    });

    if (fingerprint && fingerprint.length > 0) {
      fingerprint.forEach((entry) => {
        const loginDateStr = format(
          startOfDay(new Date(entry.date)),
          'yyyy-MM-dd'
        );
        const dayData = dataPoints.find((d) => d.fullDate === loginDateStr);
        if (dayData) {
          dayData.logins++;
        }
      });
    }

    return dataPoints;
  }, [fingerprint]);

  const chartConfig = {
    logins: {
      label: t('logins'),
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[200px] w-full'>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              allowDecimals={false}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <Bar dataKey='logins' fill='var(--color-logins)' radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
