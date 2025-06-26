'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Palette, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { LanguageSelect } from './language-select'

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('Settings.appearance');
  const [fontSize, setFontSize] = useState(10)

  useEffect(() => {
    const storedFontSize = localStorage.getItem('font-size')
    if (storedFontSize) {
      const size = parseInt(storedFontSize, 10)
      if (!isNaN(size)) {
        setFontSize(size)
        document.documentElement.style.fontSize = `${size}pt`
      }
    }
  }, [])

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0]
    if (newSize) {
      setFontSize(newSize)
      document.documentElement.style.fontSize = `${newSize}pt`
      localStorage.setItem('font-size', newSize.toString())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label className="font-semibold">{t('theme')}</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
          >
            <div>
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6" />
                {t('light')}
              </Label>
            </div>
            <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6" />
                {t('dark')}
              </Label>
            </div>
            <div>
              <RadioGroupItem value="system" id="system" className="peer sr-only" />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Palette className="mb-3 h-6 w-6" />
                {t('system')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label htmlFor="text-size-slider" className="font-semibold">{t('textSize')}</Label>
          <div className="flex items-center gap-4 pt-2">
            <Slider
              id="text-size-slider"
              min={10}
              max={20}
              step={1}
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
            />
            <span className="w-12 text-right text-sm text-muted-foreground">{fontSize}pt</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="font-semibold">{t('language')}</Label>
          <LanguageSelect />
        </div>
      </CardContent>
    </Card>
  )
}
