# cadastrar novo projeto.
insert into public.projects (
  slug,
  title,
  summary,
  description,
  technologies,
  published,
  featured,
  sort_order
)
values (
  'Slug',
  'Titulo',
  'Summary',
  'Description',
  array['React', 'JavaScript', 'Tailwind CSS', 'Supabase'],
  true,
  true,
  1
);