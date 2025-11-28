## Table: ticket

| Column Name     | Data Type              | Is Nullable | Column Default     |
|-----------------|------------------------|-------------|--------------------|
| ticket_id      | uuid                   | NO          | gen_random_uuid() |
| created_at     | timestamp with time zone | NO          | now()             |
| ticket_priority| text                   | YES         | null              |
| ticket_content | text                   | YES         | null              |
| ticket_difficulty | text                | YES         | null              |
| ticket_tone    | text                   | YES         | null              |
| response_content | text                 | YES         | null              |
| team_id        | uuid                   | YES         | null              |

## Table: profile

| Column Name | Data Type              | Is Nullable | Column Default     |
|-------------|------------------------|-------------|--------------------|
| profile_id | uuid                   | NO          | gen_random_uuid() |
| created_at | timestamp with time zone | NO          | now()             |
| profile_type | text                 | YES         | null              |
| profile_name | text                  | YES         | null              |

## Table: supporter

| Column Name   | Data Type              | Is Nullable | Column Default     |
|---------------|------------------------|-------------|--------------------|
| supporter_id | uuid                   | NO          | gen_random_uuid() |
| created_at   | timestamp with time zone | NO          | now()             |
| team_id      | uuid                   | YES         | null              |
| supporter_name | text                 | YES         | null              |

## Table: team

| Column Name     | Data Type              | Is Nullable | Column Default     |
|-----------------|------------------------|-------------|--------------------|
| team_id        | uuid                   | NO          | gen_random_uuid() |
| created_at     | timestamp with time zone | NO          | now()             |
| team_name      | text                   | YES         | null              |
| team_description | text                 | YES         | null              |