\c biztime
DROP TABLE IF EXISTS comp_industry;

DROP TABLE IF EXISTS invoices;

DROP TABLE IF EXISTS companies;

DROP TABLE IF EXISTS industries;

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

CREATE TABLE companies (
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

CREATE TABLE invoices (
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT FALSE NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date,
  CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE comp_industry (
  industry_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
  company_code text NOT NULL REFERENCES companies ON DELETE CASCADE
);

INSERT INTO companies
  VALUES ('apple-cmptr', 'Apple Computer', 'Maker of OSX.'), ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple-cmptr', 100, FALSE, NULL), ('apple-cmptr', 200, FALSE, NULL), ('apple-cmptr', 300, TRUE, '2018-01-01'), ('ibm', 400, FALSE, NULL);

INSERT INTO industries
  VALUES ('tech', 'Technology'), ('acct', 'Accounting'), ('tele', 'Telephone');

INSERT INTO comp_industry
  VALUES ('tech', 'apple-cmptr'), ('tech', 'ibm'), ('tele', 'apple-cmptr');

