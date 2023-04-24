# Jobly (Backend)

---

Jobly is a job-search application that allows users to signup, login, search, and apply to jobs.

 Demo [here](https://jobly-cl.netlify.app/), deployed with with Netlify & Railway

 **Login**: *guest* | **Password**: *password*

##  🧐  Motivation & Challenges

---

> My major motivation with the backend was to learn about test-driven development, coverage, and error handling within a Node environment. TTD was a departure from past projects, but I grew appreciate how it forces the developer write thoughtful code based on initial design. 
>
> This was my first backend project without any ORM. Raw SQL queries were a difficult change and introduced new syntactical bugs, but in the end the control over the raw queries had it's own benifits. 

##  💻  **Tech Stack** & *Packages*

  **Node.js | Express | SQL | Postgres | Jest**

 *bcrypt | colors | cors | dotenv | jsonschema | jsonwebtoken | morgan | pg*

##  ⭐️  Features

---

Here is a high level overview of a few of the features:
- RESTful API built with Node.js and Express
- 95% test coverage for backend data using Jest
- No ORM, raw SQL queries
- Handled authorization and authentication by utilizing middleware with jsonwebtoken and password encryption with BCrypt
- Data validation with JSON Schema
- Easily seed data using the seed file

## 📦  Install & Run

---

``` shell

--- clone repo ---
cd into repo

psql -f jobly.sql jobly

npm install

npm start


Will be running on localhost 3001.

```

##  🧪  Testing

---

```shell
$ npm i --global jest (this is a global install, ignore if you already have)

--- JEST COMMANDS ---
jest -i (runs all tests)
jest --coverage (shows coverage of app)
jest {name_of_file}.test.js (to run specific file)

```

###  ☑️ To-Do's

---

- Convert to TypeScript
- Add company e-mail column, so users can send application
- Add company login, so company can edit their job postings and view applicant details

## 👉 Credits

---

>Jobly was built while attending Rithm School as part of a 6 day sprint (3 days for front and backend each). The frontend was built with @nico-martinucci and backend was built with @chalonlubin. It was refactored after graduation, for efficiency and general code cleanup.

## ⚖️ License

---

```
Copyright [2023] [Jesse Gelburd-Meyers]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```









