# ETL

## Setup

- Copy the latest version of Access DB to the folder `accdb` and rename it to `**elg_database.accdb**`.
- If running on a Unix machine (MacOS or Linux), it may be necessary to change the permissions of the folder `seed-data` so that it is writable by the container process. From this directory, execute the command:
  ```
  chmod 777 seed-data
  ```

## Run

Run the `etl` npm script (`npm run etl`) to run the container process. This will create new seed files, copy them to their destination in the repository, then execute the seed operation.
