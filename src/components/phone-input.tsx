'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { countries, type Country } from '@/lib/countries';

// Find the country that best matches the beginning of the E.164 number
const findCountry = (value: string): Country | undefined => {
  if (!value || !value.startsWith('+')) return undefined;
  // Sort by dial code length descending to match longest prefix first (e.g., +44 before +4)
  return countries
    .slice()
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => value.startsWith(c.dialCode));
};

// Parse the E.164 number into its parts
const parsePhoneNumber = (
  value: string
): { country?: Country; nationalNumber: string } => {
  const country = findCountry(value);
  const nationalNumber = country
    ? value.substring(country.dialCode.length)
    : '';
  return { country, nationalNumber };
};

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  const t = useTranslations('Account.form');
  const [open, setOpen] = React.useState(false);

  const { country, nationalNumber } = React.useMemo(
    () => parsePhoneNumber(value),
    [value]
  );

  const handleCountrySelect = (newCountry: Country) => {
    onChange(`${newCountry.dialCode}${nationalNumber}`);
    setOpen(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNationalNumber = e.target.value.replace(/\D/g, '');
    const dialCode = country?.dialCode || '';
    onChange(`${dialCode}${newNationalNumber}`);
  };

  // Default to US if no country is matched or value is empty
  const selectedCountry = country || countries.find((c) => c.iso2 === 'us');

  return (
    <div className='flex items-center gap-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-[140px] justify-start font-normal'
          >
            {selectedCountry ? (
              <div className='flex items-center gap-2 truncate'>
                <span className='text-xl'>{selectedCountry.flag}</span>
                <span>{selectedCountry.dialCode}</span>
              </div>
            ) : (
              'Select Country'
            )}
            <ChevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] p-0' align='start'>
          <Command>
            <CommandInput placeholder='Search country...' />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((c) => (
                  <CommandItem
                    key={c.iso2}
                    value={`${c.name} (${c.dialCode})`}
                    onSelect={() => handleCountrySelect(c)}
                    className='gap-2'
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        country?.iso2 === c.iso2 ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className='text-lg'>{c.flag}</span>
                    <span className='text-sm text-muted-foreground'>
                      {c.dialCode}
                    </span>
                    <span className='truncate text-sm'>{c.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        value={nationalNumber}
        onChange={handleNumberChange}
        placeholder={t('phonePlaceholder')}
        {...props}
      />
    </div>
  );
}
