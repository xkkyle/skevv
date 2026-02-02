'use client';

import { getTimePeriodByTimezone, greetingMap } from '@/utils/date';

export default function Greeting() {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	return (
		<div className="mx-auto px-4 py-8 w-full h-fit text-center font-black text-xl rounded-lg bg-light md:w-fit md:min-w-120 md:text-3xl">
			{greetingMap[getTimePeriodByTimezone(timezone)]}
		</div>
	);
}
