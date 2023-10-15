create table if not exists polls
(
    id serial constraint poll_pk primary key,
    created_at date DEFAULT CURRENT_DATE,
    telegram_message_id bigint
);

create table if not exists poll_answers
(
    applied_at timestamp,
    user_login varchar,
    poll_id int
        constraint foreign_poll_key
        references polls,
    primary key (poll_id, user_login)
);