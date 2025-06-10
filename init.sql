CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(7) NOT NULL,
    employee_name VARCHAR(50) NOT NULL,
    claim_type VARCHAR(20) NOT NULL,
    claim_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    submission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hospital_name VARCHAR(50),
    treatment_start_date DATE,
    treatment_end_date DATE,
    from_location VARCHAR(50),
    to_location VARCHAR(50),
    travel_start_date DATE,
    travel_end_date DATE,
    work_start_date DATE,
    work_end_date DATE,
    claim_name VARCHAR(50),
    claim_date DATE,
    claim_description VARCHAR(100),
    CONSTRAINT valid_status CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    CONSTRAINT valid_employee_id CHECK (employee_id ~ '^ATS0[0-9]{3}$' AND employee_id != 'ATS0000'),
    CONSTRAINT valid_claim_type CHECK (claim_type IN ('medical', 'travel', 'mobile', 'other')),
    CONSTRAINT valid_amount CHECK (claim_amount >= 500 AND claim_amount <= 1000000)
);


CREATE INDEX idx_employee_id ON claims(employee_id);
CREATE INDEX idx_claim_type ON claims(claim_type);
CREATE INDEX idx_status ON claims(status);
CREATE INDEX idx_submission_date ON claims(submission_date);
