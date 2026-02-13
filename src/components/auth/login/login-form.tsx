'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Button, Input, loginSchema, type LoginSchema } from '@/components';
import { route } from '@/constants';

export default function LoginForm() {
	const form = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = (values: LoginSchema) => {
		console.log(values);
	};

	return (
		<div className="flex flex-col gap-4 mt-8 p-4 bg-white rounded-lg">
			<Button type="button" size="lg" variant="outline">
				Google Login
			</Button>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-8">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="hello@skew.run" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="ui-flex-center-between">
									<FormLabel>Password</FormLabel>
									<Button asChild variant="link" size="sm" className="h-auto text-gray-500 text-center">
										<Link href={route.AUTH.FORGOT_PASSWORD}>Forgot Password?</Link>
									</Button>
								</div>
								<FormControl>
									<Input type="password" placeholder="*******" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" variant="default" size="lg">
						Login
					</Button>
				</form>
			</Form>

			<Button asChild variant="link" className="mx-auto text-center">
				<Link href={route.AUTH.SIGNUP}>Do you need to register?</Link>
			</Button>
		</div>
	);
}
