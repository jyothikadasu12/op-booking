# PostgreSQL Backup and Restore (pgAdmin 4)

The primary development database for this project is:

- Database name: `service_booking_db`
- Host: `localhost`
- Port: `5432`
- Username: `postgres`

## Backup using pgAdmin 4

1. Open pgAdmin 4.
2. Connect to the local PostgreSQL server.
3. Expand Servers > PostgreSQL > Databases.
4. Right-click `service_booking_db`.
5. Select Backup.
6. Choose a filename such as `service_booking_db_backup.sql`.
7. Select the appropriate format (e.g., Plain or Custom).
8. Click Backup.

## Backup using psql

```bash
pg_dump -U postgres -h localhost -p 5432 -d service_booking_db -F c -f service_booking_db_backup.dump
```

## Restore using pgAdmin 4

1. Right-click `service_booking_db`.
2. Select Restore.
3. Choose the backup file.
4. Click Restore.

## Restore using psql

```bash
pg_restore -U postgres -h localhost -p 5432 -d service_booking_db service_booking_db_backup.dump
```

## Notes

- Never commit backup files containing real data to source control.
- Use a separate test database (`service_booking_test_db`) for automated tests.
- Verify restored data in pgAdmin before using it in development.
