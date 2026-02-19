export default {
  name: 'vehicle',
  title: 'Vehicle',
  type: 'document',
  fields: [
    {
      name: 'make',
      title: 'Make',
      type: 'string',
      description: 'e.g., Porsche, BMW, Mercedes-Benz',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'model',
      title: 'Model',
      type: 'string',
      description: 'e.g., 911, M3, S-Class',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'year',
      title: 'Year/Range',
      type: 'string',
      description: 'e.g., 2024, 2020-Present',
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'Auto-generated URL segment used for fitment pages, e.g. /fitment/porsche/911',
      options: {
        source: (doc: any) => `${doc.make?.toLowerCase().replace(/\s+/g, '-')}/${doc.model?.toLowerCase().replace(/\s+/g, '-')}`,
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'interior_type',
      title: 'Interior Type',
      type: 'string',
      options: {
        list: [
          { title: 'Leather', value: 'Leather' },
          { title: 'Alcantara', value: 'Alcantara' },
          { title: 'Wood Trim', value: 'Wood Trim' },
          { title: 'Carbon Fiber', value: 'Carbon Fiber' },
          { title: 'Piano Black', value: 'Piano Black' },
        ],
      },
    },
    {
      name: 'scent_pairing',
      title: 'Recommended Scent Pairing',
      type: 'string',
      description: 'The Autivora scent name that best complements this vehicle interior (e.g., Smoked Sandalwood & Amber).',
    },
    {
      name: 'description',
      title: 'Curation Description',
      type: 'text',
      rows: 3,
      description: 'Editorial copy explaining why this scent pairs with this vehicle interior.',
    },
    {
      name: 'hero_image',
      title: 'Vehicle Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'model',
      subtitle: 'make',
      media: 'hero_image',
    },
  },
}
