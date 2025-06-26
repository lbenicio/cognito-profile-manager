'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AiHint } from './ai-hint';
import { Save } from 'lucide-react';
import React from 'react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  address: z.string().min(10, { message: 'Please enter a full address.' }).max(100),
  phone_number: z.string().refine((phone) => /^\+[1-9]\d{1,14}$/.test(phone), {
    message: 'Phone number must be in E.164 format (e.g., +12223334444).',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type User = {
  name: string;
  address: string;
  phone_number: string;
};

interface ProfileFormProps {
    user: User;
    onUpdate: (data: ProfileFormValues) => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      address: user.address || '',
      phone_number: user.phone_number || '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    form.reset(user);
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        onUpdate(data);
        toast({
            title: 'Profile Updated',
            description: 'Your profile has been successfully updated.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update your profile. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information. Click the lightbulb for help.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Full Name</FormLabel>
                    <AiHint fieldDescription="The user's full name, including first and last name." />
                  </div>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center">
                    <FormLabel>Address</FormLabel>
                    <AiHint fieldDescription="The user's full street address, including street number, street name, city, state/province, and postal code." />
                  </div>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center">
                    <FormLabel>Phone Number</FormLabel>
                    <AiHint fieldDescription="The user's phone number in international E.164 format. It must start with a '+' followed by the country code and the number." />
                  </div>
                  <FormControl>
                    <Input placeholder="+15551234567" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be in E.164 format (e.g., +12223334444).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <Save />
              )}
              <span className='ml-2'>Save Changes</span>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
