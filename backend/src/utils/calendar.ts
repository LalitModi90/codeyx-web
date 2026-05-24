/**
 * Utility for generating calendar links and downloadable ICS files
 */

// Helper to format Date to UTC format: YYYYMMDDTHHmmSSZ
export const formatToUTCString = (date: Date): string => {
  const d = new Date(date);
  const pad = (num: number) => String(num).padStart(2, '0');
  
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

// 1. Google Calendar URL Generator
export const generateGoogleCalendarUrl = (event: {
  name: string;
  startTime: Date;
  endTime: Date;
  url: string;
  platform: string;
  description?: string;
}): string => {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const start = formatToUTCString(event.startTime);
  const end = formatToUTCString(event.endTime);
  const details = encodeURIComponent(
    `${event.description || ''}\n\nPlatform: ${event.platform}\nContest URL: ${event.url}`
  );
  const text = encodeURIComponent(event.name);
  const location = encodeURIComponent(event.url);
  
  return `${base}&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
};

// 2. Outlook Calendar URL Generator
export const generateOutlookCalendarUrl = (event: {
  name: string;
  startTime: Date;
  endTime: Date;
  url: string;
  platform: string;
  description?: string;
}): string => {
  const base = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent';
  const start = event.startTime.toISOString();
  const end = event.endTime.toISOString();
  const subject = encodeURIComponent(event.name);
  const body = encodeURIComponent(
    `${event.description || ''}\n\nPlatform: ${event.platform}\nContest URL: ${event.url}`
  );
  const location = encodeURIComponent(event.platform);
  
  return `${base}&subject=${subject}&startdt=${start}&enddt=${end}&body=${body}&location=${location}`;
};

// 3. Downloadable .ics File Content Generator (Apple/Universal Calendar support)
export const generateICSFileContent = (event: {
  name: string;
  startTime: Date;
  endTime: Date;
  url: string;
  platform: string;
  description?: string;
}): string => {
  const start = formatToUTCString(event.startTime);
  const end = formatToUTCString(event.endTime);
  const now = formatToUTCString(new Date());
  const cleanSummary = event.name.replace(/[,;]/g, '\\$&');
  const cleanDescription = `${event.description || ''} - Platform: ${event.platform} - URL: ${event.url}`.replace(/[,;]/g, '\\$&');
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Codeyx//Contests Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:contest_${start}_${cleanSummary.substring(0, 10)}@codeyx.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${event.platform}`,
    `URL:${event.url}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};
