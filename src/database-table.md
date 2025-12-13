### Bảng `ticket`

| Column Name         | Data Type                  | Nullable | Default Value       |
|---------------------|----------------------------|----------|---------------------|
| ticket_id           | uuid                       | NO       | gen_random_uuid()   |
| created_at          | timestamp with time zone   | NO       | now()               |
| ticket_priority     | text                       | YES      | null                |
| ticket_content      | text                       | YES      | null                |
| ticket_difficulty   | text                       | YES      | null                |
| ticket_tone         | text                       | YES      | null                |
| ticket_tone         | text                       | YES      | null                |
| team_id             | uuid                       | YES      | null                |
| team_id             | uuid                       | YES      | null                |
| user_id             | uuid                       | YES      | auth.uid()          |
| status              | text                       | YES      | 'open'              |

### Bảng `user`

| Column Name         | Data Type                  | Nullable | Default Value       |
|---------------------|----------------------------|----------|---------------------|
| user_id             | uuid                       | NO       | gen_random_uuid()   |
| created_at          | timestamp with time zone   | NO       | now()               |
| user_type           | text                       | YES      | null                |
| user_name           | text                       | YES      | null                |

### Bảng `supporter`

| Column Name         | Data Type                  | Nullable | Default Value       |
|---------------------|----------------------------|----------|---------------------|
| supporter_id        | uuid                       | NO       | gen_random_uuid()   |
| created_at          | timestamp with time zone   | NO       | now()               |
| team_id             | uuid                       | YES      | null                |
| supporter_name      | text                       | YES      | null                |
| user_id             | uuid                       | YES      | auth.uid()          |

### Bảng `team`

| Column Name         | Data Type                  | Nullable | Default Value       |
|---------------------|----------------------------|----------|---------------------|
| team_id             | uuid                       | NO       | gen_random_uuid()   |
| created_at          | timestamp with time zone   | NO       | now()               |
| team_name           | text                       | YES      | null                |
| team_description    | text                       | YES      | null                |

### Bảng `ticket_messages`

| Column Name         | Data Type                  | Nullable | Default Value       |
|---------------------|----------------------------|----------|---------------------|
| message_id          | uuid                       | NO       | gen_random_uuid()   |
| ticket_id           | uuid                       | NO       | null                |
| sender_type         | text                       | NO       | null                |
| content             | text                       | YES      | null                |
| created_at          | timestamp with time zone   | NO       | now()               |