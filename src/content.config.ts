import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const media = {
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imageWidth: z.number().int().positive().optional(),
  imageHeight: z.number().int().positive().optional(),
  frame: z.boolean().optional(),
  mat: z.boolean().optional(),
};

const link = z.object({
  label: z.string(),
  to: z.enum(['rsvp', 'faq', 'home']),
});

const dateString = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
);

const section = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('prose'),
    heading: z.string().optional(),
    paragraphs: z.array(z.string()).min(1),
    rule: z.boolean().optional(),
    ...media,
  }),
  z.object({
    type: z.literal('menu'),
    heading: z.string(),
    intro: z.string().optional(),
    items: z.array(z.string()).min(1),
    rule: z.boolean().optional(),
    ...media,
  }),
  z.object({
    type: z.literal('cocktail'),
    name: z.string(),
    description: z.string(),
    rule: z.boolean().optional(),
    ...media,
  }),
  z.object({
    type: z.literal('callout'),
    heading: z.string(),
    paragraphs: z.array(z.string()).min(1),
    showCalendar: z.boolean().optional(),
    rule: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('steps'),
    heading: z.string(),
    lead: z.string().optional(),
    paragraphs: z.array(z.string()).optional(),
    steps: z
      .array(
        z.object({
          label: z.string().optional(),
          text: z.string(),
        }),
      )
      .min(1),
    rule: z.boolean().optional(),
    ...media,
  }),
  z.object({
    type: z.literal('rsvp'),
    heading: z.string(),
    kicker: z.string().optional(),
    paragraphs: z.array(z.string()).min(1),
    rule: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('actions'),
    links: z.array(link).min(1),
    rule: z.boolean().optional(),
  }),
]);

const events = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: dateString,
    dateLabel: z.string(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    doors: z.string(),
    summary: z.string(),
    rsvpUrl: z.string().url(),
    rsvpLabel: z.string(),
    location: z.string().optional(),
    address: z.string().optional(),
    hero: z.string(),
    heroAlt: z.string(),
    heroWidth: z.number().int().positive(),
    heroHeight: z.number().int().positive(),
    heroFrame: z.boolean().optional(),
    ogImage: z.string(),
    sections: z.array(section).min(1),
  }),
});

export const collections = { events };
