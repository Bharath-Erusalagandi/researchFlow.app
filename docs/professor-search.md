# Professor Search Feature

This document explains how the professor search feature works in ResearchConnect.

## Overview

The professor search feature allows users to find professors based on their research areas, names, universities, or titles. It uses Supabase as the backend database to efficiently query professors matching the search criteria.

## Database Structure

Professors are stored in the `professors` table in Supabase with the following structure:

| Field         | Type     | Description                           |
|---------------|----------|---------------------------------------|
| id            | BIGINT   | Primary key                           |
| name          | TEXT     | Professor's full name                 |
| title         | TEXT     | Academic title                        |
| university    | TEXT     | Affiliated university                 |
| research_areas| TEXT     | JSON array of research areas as text  |
| email         | TEXT     | Contact email                         |
| publications  | INTEGER  | Number of publications                |
| citations     | INTEGER  | Number of citations                   |
| image_url     | TEXT     | Profile image URL                     |
| created_at    | TIMESTAMPTZ | Creation timestamp                |
| updated_at    | TIMESTAMPTZ | Last update timestamp             |

## Search Implementation

The search functionality is implemented in `pages/search.tsx`. The search process:

1. Connects to Supabase using the client configured in `lib/supabaseClient.ts`
2. When a search query is entered, it performs a server-side search using Supabase's `.or()` query to match the search terms against multiple fields
3. Results are ordered by citation count to show the most impactful professors first
4. If the server search fails, there's a fallback to client-side filtering

### Technical Details

- The search is fuzzy, using PostgreSQL's `ilike` operator with wildcards
- Search indexes are created on research areas, name, university, and title fields for better performance
- Results are limited to improve performance

## Setting Up Locally

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Run the SQL migration file at `supabase/migrations/20231122000000_professors_table.sql` to create the table and add sample data
3. Add your Supabase URL and anon key to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Adding More Professors

To add more professors to the database, you can:

1. Use the Supabase dashboard UI to add records to the professors table
2. Run additional SQL insertions similar to those in the migration file
3. Create an admin interface (future enhancement)

## Troubleshooting

### No Results Found

If no results are found for a search term, check:
- The search term is spelled correctly
- The research area exists in the database
- The network connection is working properly

### Error Messages

- "Error fetching professors" - Check your Supabase credentials and network connection
- "Search failed" - There might be an issue with the Supabase query or data format

## Future Enhancements

Planned enhancements for the professor search feature:

1. Advanced filtering options (by university, publication count, etc.)
2. Pagination for large result sets
3. Professor profile pages with detailed information
4. Save favorite professors
5. Connect with professors through the platform 