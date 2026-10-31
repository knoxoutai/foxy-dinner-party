import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildIcs } from '../../../lib/ics';
import type { Party } from '../../../lib/events';

export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map((event) => ({
    params: { slug: event.id },
    props: { event },
  }));
}

export const GET: APIRoute = ({ props, site }) => {
  const event = props.event as Party;
  const pageUrl = new URL(`/events/${event.id}`, site ?? 'https://foxydinnerparty.com').href;
  return new Response(buildIcs(event.id, event.data, pageUrl), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.id}.ics"`,
    },
  });
};
