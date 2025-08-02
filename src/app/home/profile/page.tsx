
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
    userId: z.string(),
    username: z.string().min(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' }),
    avatar: z.string().url({ message: 'Lütfen geçerli bir URL girin.' }).optional().or(z.literal('')),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      username: '',
      avatar: '',
    },
  });

  useEffect(() => {
    // localStorage'a sadece component mount edildikten sonra erişilir.
    const userData = localStorage.getItem('loggedInUser');
    if (userData) {
      const user = JSON.parse(userData);
      form.reset({
        userId: user.id,
        username: user.username,
        avatar: user.avatar || '',
      });
    }
    setIsUserDataLoading(false);
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const updatedUser = await updateProfile(values.userId, { 
          username: values.username, 
          avatar: values.avatar 
      });
      if (updatedUser) {
        // Update localStorage with new user data
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        
        toast({
            title: "Profil Güncellendi!",
            description: "Bilgilerin başarıyla değiştirildi.",
        });
        // Force a reload of the window to reflect changes in sidebar
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error: any) {
      toast({
            variant: "destructive",
            title: "Güncelleme Başarısız",
            description: error.message,
      });
    } finally {
        setIsLoading(false);
    }
  }

  if (isUserDataLoading) {
      return (
          <div className="space-y-8">
             <Skeleton className="h-10 w-1/3" />
             <Card className="max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </CardContent>
             </Card>
          </div>
      )
  }

  return (
    <div className="space-y-8">
        <h1 className="font-headline text-4xl font-bold">Profilini Düzenle</h1>
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Kullanıcı Bilgileri</CardTitle>
                <CardDescription>
                    Kullanıcı adını ve profil resmini buradan değiştirebilirsin.
                </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profil Resmi</FormLabel>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={field.value} alt={form.watch('username')} data-ai-hint="user avatar" />
                            <AvatarFallback>{form.watch('username')?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <FormControl>
                          <Input placeholder="https://ornek.com/resim.png" {...field} />
                        </FormControl>
                      </div>
                       <FormDescription>
                          Profil resminiz için bir resim URL'i girin.
                        </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kullanıcı Adı</FormLabel>
                        <FormControl>
                        <Input placeholder="Yeni kullanıcı adın" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Değişiklikleri Kaydet
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
    </div>
  );
}
