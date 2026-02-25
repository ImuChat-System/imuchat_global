
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
const logger = { debug: console.debug, info: console.info, warn: console.warn, error: console.error };
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Link as LinkIcon, UploadCloud } from "lucide-react";
import { useTranslations } from '@/providers/I18nProvider';
import { useForm } from "react-hook-form";
import { z } from "zod";

const SubmissionForm = () => {
    const t = useTranslations("ContestsPage.detail.submissionForm");

    const formSchema = z.object({
        title: z.string().min(5, t('errors.titleMin')).max(100, t('errors.titleMax')),
        description: z.string().max(500, t('errors.descriptionMax')).optional(),
        file: z.any().refine(file => file, t('errors.fileRequired')), // Simplified for now
        url: z.string().url(t('errors.urlInvalid')).optional().or(z.literal('')),
        agreement: z.boolean().refine(val => val === true, t('errors.agreementRequired')),
    });
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            title: "",
            description: "",
            file: null,
            url: "",
            agreement: false,
        },
        mode: 'onChange'
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        logger.debug(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('title')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('titlePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('description')}</FormLabel>
                            <FormControl>
                                <Textarea placeholder={t('descriptionPlaceholder')} {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('file')}</FormLabel>
                            <FormControl>
                                <Card
                                    className="border-2 border-dashed bg-muted hover:bg-muted/50 cursor-pointer"
                                    onClick={() => field.onChange({ name: 'mock-file.png', size: 1024 })} // Simulate file selection
                                >
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                        <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
                                        <p className="font-semibold">{field.value ? field.value.name : t('filePlaceholder')}</p>
                                        <p className="text-xs text-muted-foreground">{t('fileDescription')}</p>
                                    </CardContent>
                                </Card>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('url')}</FormLabel>
                             <FormControl>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder={t('urlPlaceholder')} {...field} className="pl-9" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="agreement"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                             <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    {t('agreement')}
                                </FormLabel>
                                <FormDescription>
                                    <Button variant="link" type="button" className="p-0 h-auto text-xs">{t('agreementLink')}</Button>
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
                 <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    <span>{t('xpGain')}</span>
                </div>

                <Button type="submit" className="w-full">{t('submit')}</Button>
            </form>
        </Form>
    )
}

export default SubmissionForm;
