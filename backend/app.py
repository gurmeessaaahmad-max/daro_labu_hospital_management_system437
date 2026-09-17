from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection
from datetime import date, datetime


# =========================================================
# DARO LABU HOSPITAL MANAGEMENT SYSTEM
# FLASK + MYSQL BACKEND
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# DATABASE HELPERS
# =========================================================

def close_db(connection=None, cursor=None):

    try:
        if cursor:
            cursor.close()
    except Exception:
        pass

    try:
        if connection:
            connection.close()
    except Exception:
        pass


def serialize_value(value):

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    return value


def serialize_row(row):

    return {
        key: serialize_value(value)
        for key, value in row.items()
    }


def calculate_medicine_status(quantity, reorder_level):

    if quantity is None:
        quantity = 0

    if reorder_level is None:
        reorder_level = 0

    if quantity <= 0:
        return "Out of Stock"

    if quantity <= reorder_level:
        return "Low Stock"

    return "Available"


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Daro Labu Hospital Backend is Running!"
    })


# =========================================================
# TEST DATABASE CONNECTION
# =========================================================

@app.route("/api/test-db", methods=["GET"])
def test_database():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT 1")
        result = cursor.fetchone()

        return jsonify({
            "success": True,
            "message": "Database connection successful.",
            "result": result
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Database connection failed.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# PATIENTS
# =========================================================

@app.route("/api/patients", methods=["GET"])
def get_patients():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                patient_id,
                patient_number,
                first_name,
                middle_name,
                last_name,
                date_of_birth,
                gender,
                phone,
                email,
                address,
                emergency_contact_name,
                emergency_contact_phone,
                blood_group,
                marital_status,
                status
            FROM patients
            ORDER BY patient_id DESC
        """)

        patients = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(patients),
            "patients": [
                serialize_row(patient)
                for patient in patients
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get patients.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/patients", methods=["POST"])
def create_patient():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        first_name = data.get("first_name")
        last_name = data.get("last_name")

        if not first_name or not last_name:

            return jsonify({
                "success": False,
                "message": "First name and last name are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Generate patient number
        cursor.execute("""
            SELECT patient_id
            FROM patients
            ORDER BY patient_id DESC
            LIMIT 1
        """)

        last_patient = cursor.fetchone()

        if last_patient:
            next_id = last_patient[0] + 1
        else:
            next_id = 1

        patient_number = f"DLH-{next_id:04d}"

        cursor.execute("""
            INSERT INTO patients
            (
                patient_number,
                first_name,
                middle_name,
                last_name,
                date_of_birth,
                gender,
                phone,
                email,
                address,
                emergency_contact_name,
                emergency_contact_phone,
                blood_group,
                marital_status,
                status
            )
            VALUES
            (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            patient_number,
            first_name,
            data.get("middle_name"),
            last_name,
            data.get("date_of_birth"),
            data.get("gender"),
            data.get("phone"),
            data.get("email"),
            data.get("address"),
            data.get("emergency_contact_name"),
            data.get("emergency_contact_phone"),
            data.get("blood_group"),
            data.get("marital_status"),
            data.get("status") or "Active"
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Patient created successfully.",
            "patient_id": cursor.lastrowid,
            "patient_number": patient_number
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create patient.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM patients
            WHERE patient_id = %s
        """, (patient_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Patient not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Patient deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete patient.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# DEPARTMENTS
# =========================================================

@app.route("/api/departments", methods=["GET"])
def get_departments():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                department_id,
                department_name,
                description,
                status,
                created_at
            FROM departments
            ORDER BY department_name
        """)

        departments = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(departments),
            "departments": [
                serialize_row(department)
                for department in departments
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get departments.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# DOCTORS
# =========================================================

@app.route("/api/doctors", methods=["GET"])
def get_doctors():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                d.doctor_id,
                d.user_id,
                d.department_id,
                d.first_name,
                d.middle_name,
                d.last_name,
                d.specialization,
                d.license_number,
                d.phone,
                d.email,
                d.status,
                d.created_at,
                dep.department_name
            FROM doctors d

            LEFT JOIN departments dep
                ON d.department_id = dep.department_id

            ORDER BY d.doctor_id DESC
        """)

        doctors = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(doctors),
            "doctors": [
                serialize_row(doctor)
                for doctor in doctors
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get doctors.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/doctors/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                d.doctor_id,
                d.user_id,
                d.department_id,
                d.first_name,
                d.middle_name,
                d.last_name,
                d.specialization,
                d.license_number,
                d.phone,
                d.email,
                d.status,
                d.created_at,
                dep.department_name
            FROM doctors d

            LEFT JOIN departments dep
                ON d.department_id = dep.department_id

            WHERE d.doctor_id = %s
        """, (doctor_id,))

        doctor = cursor.fetchone()

        if not doctor:

            return jsonify({
                "success": False,
                "message": "Doctor not found."
            }), 404

        return jsonify({
            "success": True,
            "doctor": serialize_row(doctor)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get doctor.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/doctors", methods=["POST"])
def create_doctor():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        department_id = data.get("department_id")

        if not first_name or not last_name or not department_id:

            return jsonify({
                "success": False,
                "message": "First name, last name and department are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check department
        cursor.execute("""
            SELECT department_id
            FROM departments
            WHERE department_id = %s
        """, (department_id,))

        department = cursor.fetchone()

        if not department:

            return jsonify({
                "success": False,
                "message": "Selected department does not exist."
            }), 400

        cursor.execute("""
            INSERT INTO doctors
            (
                user_id,
                department_id,
                first_name,
                middle_name,
                last_name,
                specialization,
                license_number,
                phone,
                email,
                status
            )
            VALUES
            (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
        """, (
            data.get("user_id"),
            department_id,
            first_name,
            data.get("middle_name"),
            last_name,
            data.get("specialization"),
            data.get("license_number"),
            data.get("phone"),
            data.get("email"),
            data.get("status") or "Active"
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Doctor created successfully.",
            "doctor_id": cursor.lastrowid
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create doctor.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/doctors/<int:doctor_id>", methods=["PUT"])
def update_doctor(doctor_id):

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE doctors
            SET
                user_id = %s,
                department_id = %s,
                first_name = %s,
                middle_name = %s,
                last_name = %s,
                specialization = %s,
                license_number = %s,
                phone = %s,
                email = %s,
                status = %s
            WHERE doctor_id = %s
        """, (
            data.get("user_id"),
            data.get("department_id"),
            data.get("first_name"),
            data.get("middle_name"),
            data.get("last_name"),
            data.get("specialization"),
            data.get("license_number"),
            data.get("phone"),
            data.get("email"),
            data.get("status") or "Active",
            doctor_id
        ))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Doctor not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Doctor updated successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update doctor.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/doctors/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM doctors
            WHERE doctor_id = %s
        """, (doctor_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Doctor not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Doctor deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete doctor.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# APPOINTMENTS
# =========================================================

@app.route("/api/appointments", methods=["GET"])
def get_appointments():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                a.appointment_id,
                a.patient_id,
                a.doctor_id,
                a.appointment_date,
                a.reason,
                a.status,
                a.notes,
                a.created_at,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.middle_name AS patient_middle_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.middle_name AS doctor_middle_name,
                d.last_name AS doctor_last_name,
                d.specialization,

                dep.department_id,
                dep.department_name

            FROM appointments a

            LEFT JOIN patients p
                ON a.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON a.doctor_id = d.doctor_id

            LEFT JOIN departments dep
                ON d.department_id = dep.department_id

            ORDER BY a.appointment_id DESC
        """)

        appointments = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(appointments),
            "appointments": [
                serialize_row(appointment)
                for appointment in appointments
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get appointments.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/appointments", methods=["POST"])
def create_appointment():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        appointment_date = data.get("appointment_date")

        if not patient_id or not doctor_id or not appointment_date:

            return jsonify({
                "success": False,
                "message": "Patient, doctor and appointment date are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check patient
        cursor.execute("""
            SELECT patient_id
            FROM patients
            WHERE patient_id = %s
        """, (patient_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Patient does not exist."
            }), 400

        # Check doctor
        cursor.execute("""
            SELECT doctor_id
            FROM doctors
            WHERE doctor_id = %s
        """, (doctor_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Doctor does not exist."
            }), 400

        # Check if appointment_time exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'appointments'
              AND column_name = 'appointment_time'
        """)

        has_time = cursor.fetchone()[0] > 0

        if has_time:

            cursor.execute("""
                INSERT INTO appointments
                (
                    patient_id,
                    doctor_id,
                    appointment_date,
                    appointment_time,
                    reason,
                    status,
                    notes
                )
                VALUES
                (
                    %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                patient_id,
                doctor_id,
                appointment_date,
                data.get("appointment_time"),
                data.get("reason"),
                data.get("status") or "Scheduled",
                data.get("notes")
            ))

        else:

            cursor.execute("""
                INSERT INTO appointments
                (
                    patient_id,
                    doctor_id,
                    appointment_date,
                    reason,
                    status,
                    notes
                )
                VALUES
                (
                    %s, %s, %s, %s, %s, %s
                )
            """, (
                patient_id,
                doctor_id,
                appointment_date,
                data.get("reason"),
                data.get("status") or "Scheduled",
                data.get("notes")
            ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Appointment created successfully.",
            "appointment_id": cursor.lastrowid
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create appointment.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/appointments/<int:appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if appointment_time exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'appointments'
              AND column_name = 'appointment_time'
        """)

        has_time = cursor.fetchone()[0] > 0

        if has_time:

            cursor.execute("""
                UPDATE appointments
                SET
                    patient_id = %s,
                    doctor_id = %s,
                    appointment_date = %s,
                    appointment_time = %s,
                    reason = %s,
                    status = %s,
                    notes = %s
                WHERE appointment_id = %s
            """, (
                data.get("patient_id"),
                data.get("doctor_id"),
                data.get("appointment_date"),
                data.get("appointment_time"),
                data.get("reason"),
                data.get("status") or "Scheduled",
                data.get("notes"),
                appointment_id
            ))

        else:

            cursor.execute("""
                UPDATE appointments
                SET
                    patient_id = %s,
                    doctor_id = %s,
                    appointment_date = %s,
                    reason = %s,
                    status = %s,
                    notes = %s
                WHERE appointment_id = %s
            """, (
                data.get("patient_id"),
                data.get("doctor_id"),
                data.get("appointment_date"),
                data.get("reason"),
                data.get("status") or "Scheduled",
                data.get("notes"),
                appointment_id
            ))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Appointment not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Appointment updated successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update appointment.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM appointments
            WHERE appointment_id = %s
        """, (appointment_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Appointment not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Appointment deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete appointment.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# MEDICAL RECORDS
# =========================================================

@app.route("/api/medical-records", methods=["GET"])
def get_medical_records():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                mr.record_id,
                mr.patient_id,
                mr.doctor_id,
                mr.appointment_id,
                mr.visit_date,
                mr.chief_complaint,
                mr.symptoms,
                mr.diagnosis,
                mr.treatment,
                mr.notes,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.middle_name AS patient_middle_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.middle_name AS doctor_middle_name,
                d.last_name AS doctor_last_name,
                d.specialization,

                dep.department_id,
                dep.department_name

            FROM medical_records mr

            LEFT JOIN patients p
                ON mr.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON mr.doctor_id = d.doctor_id

            LEFT JOIN departments dep
                ON d.department_id = dep.department_id

            ORDER BY mr.record_id DESC
        """)

        records = cursor.fetchall()

        serialized_records = [
            serialize_row(record)
            for record in records
        ]

        return jsonify({
            "success": True,
            "count": len(serialized_records),

            # Main property
            "records": serialized_records,

            # Compatibility with frontend
            "medical_records": serialized_records
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get medical records.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/medical-records/<int:record_id>", methods=["GET"])
def get_medical_record(record_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                mr.record_id,
                mr.patient_id,
                mr.doctor_id,
                mr.appointment_id,
                mr.visit_date,
                mr.chief_complaint,
                mr.symptoms,
                mr.diagnosis,
                mr.treatment,
                mr.notes,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.middle_name AS patient_middle_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.middle_name AS doctor_middle_name,
                d.last_name AS doctor_last_name,
                d.specialization,

                dep.department_id,
                dep.department_name

            FROM medical_records mr

            LEFT JOIN patients p
                ON mr.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON mr.doctor_id = d.doctor_id

            LEFT JOIN departments dep
                ON d.department_id = dep.department_id

            WHERE mr.record_id = %s
        """, (record_id,))

        record = cursor.fetchone()

        if not record:

            return jsonify({
                "success": False,
                "message": "Medical record not found."
            }), 404

        return jsonify({
            "success": True,
            "record": serialize_row(record)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get medical record.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/medical-records", methods=["POST"])
def create_medical_record():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        appointment_id = data.get("appointment_id")
        visit_date = data.get("visit_date")

        if not patient_id:

            return jsonify({
                "success": False,
                "message": "Patient is required."
            }), 400

        if not doctor_id:

            return jsonify({
                "success": False,
                "message": "Doctor is required."
            }), 400

        if not visit_date:

            return jsonify({
                "success": False,
                "message": "Visit date is required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # -------------------------------------------------
        # CHECK PATIENT
        # -------------------------------------------------

        cursor.execute("""
            SELECT patient_id
            FROM patients
            WHERE patient_id = %s
        """, (patient_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Selected patient does not exist."
            }), 400

        # -------------------------------------------------
        # CHECK DOCTOR
        # -------------------------------------------------

        cursor.execute("""
            SELECT doctor_id
            FROM doctors
            WHERE doctor_id = %s
        """, (doctor_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Selected doctor does not exist."
            }), 400

        # -------------------------------------------------
        # CHECK APPOINTMENT IF PROVIDED
        # -------------------------------------------------

        if appointment_id:

            cursor.execute("""
                SELECT
                    appointment_id,
                    patient_id,
                    doctor_id
                FROM appointments
                WHERE appointment_id = %s
            """, (appointment_id,))

            appointment = cursor.fetchone()

            if not appointment:

                return jsonify({
                    "success": False,
                    "message": "Selected appointment does not exist."
                }), 400

            if appointment[1] != int(patient_id):

                return jsonify({
                    "success": False,
                    "message": "Appointment does not belong to the selected patient."
                }), 400

            if appointment[2] != int(doctor_id):

                return jsonify({
                    "success": False,
                    "message": "Appointment does not belong to the selected doctor."
                }), 400

        # -------------------------------------------------
        # SAVE RECORD
        # -------------------------------------------------

        cursor.execute("""
            INSERT INTO medical_records
            (
                patient_id,
                doctor_id,
                appointment_id,
                visit_date,
                chief_complaint,
                symptoms,
                diagnosis,
                treatment,
                notes
            )
            VALUES
            (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """, (
            patient_id,
            doctor_id,
            appointment_id if appointment_id else None,
            visit_date,
            data.get("chief_complaint"),
            data.get("symptoms"),
            data.get("diagnosis"),
            data.get("treatment"),
            data.get("notes")
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Medical record saved successfully.",
            "record_id": cursor.lastrowid
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to save medical record.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/medical-records/<int:record_id>", methods=["PUT"])
def update_medical_record(record_id):

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        appointment_id = data.get("appointment_id")
        visit_date = data.get("visit_date")

        if not patient_id or not doctor_id or not visit_date:

            return jsonify({
                "success": False,
                "message": "Patient, doctor and visit date are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # -------------------------------------------------
        # CHECK RECORD
        # -------------------------------------------------

        cursor.execute("""
            SELECT record_id
            FROM medical_records
            WHERE record_id = %s
        """, (record_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Medical record not found."
            }), 404

        # -------------------------------------------------
        # CHECK PATIENT
        # -------------------------------------------------

        cursor.execute("""
            SELECT patient_id
            FROM patients
            WHERE patient_id = %s
        """, (patient_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Selected patient does not exist."
            }), 400

        # -------------------------------------------------
        # CHECK DOCTOR
        # -------------------------------------------------

        cursor.execute("""
            SELECT doctor_id
            FROM doctors
            WHERE doctor_id = %s
        """, (doctor_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Selected doctor does not exist."
            }), 400

        # -------------------------------------------------
        # CHECK APPOINTMENT
        # -------------------------------------------------

        if appointment_id:

            cursor.execute("""
                SELECT
                    appointment_id,
                    patient_id,
                    doctor_id
                FROM appointments
                WHERE appointment_id = %s
            """, (appointment_id,))

            appointment = cursor.fetchone()

            if not appointment:

                return jsonify({
                    "success": False,
                    "message": "Selected appointment does not exist."
                }), 400

            if appointment[1] != int(patient_id):

                return jsonify({
                    "success": False,
                    "message": "Appointment does not belong to the selected patient."
                }), 400

            if appointment[2] != int(doctor_id):

                return jsonify({
                    "success": False,
                    "message": "Appointment does not belong to the selected doctor."
                }), 400

        # -------------------------------------------------
        # UPDATE RECORD
        # -------------------------------------------------

        cursor.execute("""
            UPDATE medical_records
            SET
                patient_id = %s,
                doctor_id = %s,
                appointment_id = %s,
                visit_date = %s,
                chief_complaint = %s,
                symptoms = %s,
                diagnosis = %s,
                treatment = %s,
                notes = %s
            WHERE record_id = %s
        """, (
            patient_id,
            doctor_id,
            appointment_id if appointment_id else None,
            visit_date,
            data.get("chief_complaint"),
            data.get("symptoms"),
            data.get("diagnosis"),
            data.get("treatment"),
            data.get("notes"),
            record_id
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Medical record updated successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update medical record.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/medical-records/<int:record_id>", methods=["DELETE"])
def delete_medical_record(record_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM medical_records
            WHERE record_id = %s
        """, (record_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Medical record not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Medical record deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete medical record.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# MEDICINES
# =========================================================

@app.route("/api/medicines", methods=["GET"])
def get_medicines():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                medicine_id,
                category_id,
                medicine_name,
                generic_name,
                dosage,
                unit,
                quantity,
                reorder_level,
                purchase_price,
                selling_price,
                expiry_date,
                status,
                created_at
            FROM medicines
            ORDER BY medicine_id DESC
        """)

        medicines = cursor.fetchall()

        for medicine in medicines:

            medicine["stock_status"] = calculate_medicine_status(
                medicine.get("quantity"),
                medicine.get("reorder_level")
            )

        return jsonify({
            "success": True,
            "count": len(medicines),
            "medicines": [
                serialize_row(medicine)
                for medicine in medicines
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get medicines.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/medicines", methods=["POST"])
def create_medicine():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        if not data.get("medicine_name"):

            return jsonify({
                "success": False,
                "message": "Medicine name is required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO medicines
            (
                category_id,
                medicine_name,
                generic_name,
                dosage,
                unit,
                quantity,
                reorder_level,
                purchase_price,
                selling_price,
                expiry_date,
                status
            )
            VALUES
            (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s
            )
        """, (
            data.get("category_id"),
            data.get("medicine_name"),
            data.get("generic_name"),
            data.get("dosage"),
            data.get("unit"),
            data.get("quantity") or 0,
            data.get("reorder_level") or 0,
            data.get("purchase_price") or 0,
            data.get("selling_price") or 0,
            data.get("expiry_date"),
            data.get("status") or "Active"
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Medicine created successfully.",
            "medicine_id": cursor.lastrowid
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create medicine.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/medicines/<int:medicine_id>", methods=["PUT"])
def update_medicine(medicine_id):

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE medicines
            SET
                category_id = %s,
                medicine_name = %s,
                generic_name = %s,
                dosage = %s,
                unit = %s,
                quantity = %s,
                reorder_level = %s,
                purchase_price = %s,
                selling_price = %s,
                expiry_date = %s,
                status = %s
            WHERE medicine_id = %s
        """, (
            data.get("category_id"),
            data.get("medicine_name"),
            data.get("generic_name"),
            data.get("dosage"),
            data.get("unit"),
            data.get("quantity") or 0,
            data.get("reorder_level") or 0,
            data.get("purchase_price") or 0,
            data.get("selling_price") or 0,
            data.get("expiry_date"),
            data.get("status") or "Active",
            medicine_id
        ))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Medicine not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Medicine updated successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update medicine.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/medicines/<int:medicine_id>", methods=["DELETE"])
def delete_medicine(medicine_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM medicines
            WHERE medicine_id = %s
        """, (medicine_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Medicine not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Medicine deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete medicine.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# PRESCRIPTIONS
# =========================================================

@app.route("/api/prescriptions", methods=["GET"])
def get_prescriptions():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                pr.prescription_id,
                pr.patient_id,
                pr.doctor_id,
                pr.record_id,
                pr.prescription_date,
                pr.instructions,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.last_name AS doctor_last_name

            FROM prescriptions pr

            LEFT JOIN patients p
                ON pr.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON pr.doctor_id = d.doctor_id

            ORDER BY pr.prescription_id DESC
        """)

        prescriptions = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(prescriptions),
            "prescriptions": [
                serialize_row(prescription)
                for prescription in prescriptions
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get prescriptions.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


@app.route("/api/prescriptions", methods=["POST"])
def create_prescription():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        record_id = data.get("record_id")

        if not patient_id or not doctor_id:

            return jsonify({
                "success": False,
                "message": "Patient and doctor are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO prescriptions
            (
                patient_id,
                doctor_id,
                record_id,
                prescription_date,
                instructions
            )
            VALUES
            (
                %s, %s, %s, %s, %s
            )
        """, (
            patient_id,
            doctor_id,
            record_id,
            data.get("prescription_date") or datetime.now(),
            data.get("instructions")
        ))

        prescription_id = cursor.lastrowid

        # -------------------------------------------------
        # PRESCRIPTION ITEMS
        # -------------------------------------------------

        items = data.get("items") or []

        for item in items:

            cursor.execute("""
                INSERT INTO prescription_items
                (
                    prescription_id,
                    medicine_id,
                    quantity,
                    dosage,
                    frequency,
                    duration
                )
                VALUES
                (
                    %s, %s, %s, %s, %s, %s
                )
            """, (
                prescription_id,
                item.get("medicine_id"),
                item.get("quantity"),
                item.get("dosage"),
                item.get("frequency"),
                item.get("duration")
            ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Prescription created successfully.",
            "prescription_id": prescription_id
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create prescription.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)
        # =========================================================
# LABORATORY
# =========================================================

# ---------------------------------------------------------
# GET LABORATORY TESTS
# ---------------------------------------------------------

@app.route("/api/laboratory/tests", methods=["GET"])
def get_laboratory_tests():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                test_id,
                test_name,
                category,
                price,
                description,
                status
            FROM laboratory_tests
            ORDER BY test_id DESC
        """)

        tests = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(tests),
            "tests": [
                serialize_row(test)
                for test in tests
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get laboratory tests.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# GET ONE LABORATORY TEST
# ---------------------------------------------------------

@app.route("/api/laboratory/tests/<int:test_id>", methods=["GET"])
def get_laboratory_test(test_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                test_id,
                test_name,
                category,
                price,
                description,
                status
            FROM laboratory_tests
            WHERE test_id = %s
        """, (test_id,))

        test = cursor.fetchone()

        if not test:

            return jsonify({
                "success": False,
                "message": "Laboratory test not found."
            }), 404

        return jsonify({
            "success": True,
            "test": serialize_row(test)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get laboratory test.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# CREATE LABORATORY TEST
# ---------------------------------------------------------

@app.route("/api/laboratory/tests", methods=["POST"])
def create_laboratory_test():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        test_name = data.get("test_name")

        if not test_name:

            return jsonify({
                "success": False,
                "message": "Test name is required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check duplicate test name
        cursor.execute("""
            SELECT test_id
            FROM laboratory_tests
            WHERE test_name = %s
        """, (test_name,))

        if cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Laboratory test with this name already exists."
            }), 409

        cursor.execute("""
            INSERT INTO laboratory_tests
            (
                test_name,
                category,
                price,
                description,
                status
            )
            VALUES
            (
                %s, %s, %s, %s, %s
            )
        """, (
            test_name,
            data.get("category"),
            data.get("price") or 0,
            data.get("description"),
            data.get("status") or "Active"
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory test created successfully.",
            "test_id": cursor.lastrowid
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create laboratory test.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# UPDATE LABORATORY TEST
# ---------------------------------------------------------

@app.route("/api/laboratory/tests/<int:test_id>", methods=["PUT"])
def update_laboratory_test(test_id):

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        test_name = data.get("test_name")

        if not test_name:

            return jsonify({
                "success": False,
                "message": "Test name is required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check whether another test has the same name
        cursor.execute("""
            SELECT test_id
            FROM laboratory_tests
            WHERE test_name = %s
              AND test_id != %s
        """, (test_name, test_id))

        if cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Another laboratory test already uses this name."
            }), 409

        cursor.execute("""
            UPDATE laboratory_tests
            SET
                test_name = %s,
                category = %s,
                price = %s,
                description = %s,
                status = %s
            WHERE test_id = %s
        """, (
            test_name,
            data.get("category"),
            data.get("price") or 0,
            data.get("description"),
            data.get("status") or "Active",
            test_id
        ))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Laboratory test not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory test updated successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update laboratory test.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# DELETE LABORATORY TEST
# ---------------------------------------------------------

@app.route("/api/laboratory/tests/<int:test_id>", methods=["DELETE"])
def delete_laboratory_test(test_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM laboratory_tests
            WHERE test_id = %s
        """, (test_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Laboratory test not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory test deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete laboratory test.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# GET LABORATORY REQUESTS
# ---------------------------------------------------------

@app.route("/api/laboratory/requests", methods=["GET"])
def get_laboratory_requests():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                lr.request_id,
                lr.patient_id,
                lr.doctor_id,
                lr.test_id,
                lr.request_date,
                lr.priority,
                lr.status,
                lr.notes,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.middle_name AS patient_middle_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.middle_name AS doctor_middle_name,
                d.last_name AS doctor_last_name,

                lt.test_name,
                lt.category,
                lt.price

            FROM laboratory_requests lr

            LEFT JOIN patients p
                ON lr.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON lr.doctor_id = d.doctor_id

            LEFT JOIN laboratory_tests lt
                ON lr.test_id = lt.test_id

            ORDER BY lr.request_id DESC
        """)

        requests = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(requests),
            "requests": [
                serialize_row(laboratory_request)
                for laboratory_request in requests
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get laboratory requests.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# CREATE LABORATORY REQUEST
# ---------------------------------------------------------

@app.route("/api/laboratory/requests", methods=["POST"])
def create_laboratory_request():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        test_id = data.get("test_id")

        if not patient_id:

            return jsonify({
                "success": False,
                "message": "Patient is required."
            }), 400

        if not test_id:

            return jsonify({
                "success": False,
                "message": "Laboratory test is required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check patient
        cursor.execute("""
            SELECT patient_id
            FROM patients
            WHERE patient_id = %s
        """, (patient_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Selected patient does not exist."
            }), 400

        # Check doctor if provided
        if doctor_id:

            cursor.execute("""
                SELECT doctor_id
                FROM doctors
                WHERE doctor_id = %s
            """, (doctor_id,))

            if not cursor.fetchone():

                return jsonify({
                    "success": False,
                    "message": "Selected doctor does not exist."
                }), 400

        # Check laboratory test
        cursor.execute("""
            SELECT
                test_id,
                status
            FROM laboratory_tests
            WHERE test_id = %s
        """, (test_id,))

        laboratory_test = cursor.fetchone()

        if not laboratory_test:

            return jsonify({
                "success": False,
                "message": "Selected laboratory test does not exist."
            }), 400

        if laboratory_test[1] != "Active":

            return jsonify({
                "success": False,
                "message": "Selected laboratory test is inactive."
            }), 400

        cursor.execute("""
            INSERT INTO laboratory_requests
            (
                patient_id,
                doctor_id,
                test_id,
                priority,
                status,
                notes
            )
            VALUES
            (
                %s, %s, %s, %s, %s, %s
            )
        """, (
            patient_id,
            doctor_id if doctor_id else None,
            test_id,
            data.get("priority") or "Normal",
            data.get("status") or "Requested",
            data.get("notes")
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory request created successfully.",
            "request_id": cursor.lastrowid
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create laboratory request.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# UPDATE LABORATORY REQUEST
# ---------------------------------------------------------

@app.route("/api/laboratory/requests/<int:request_id>", methods=["PUT"])
def update_laboratory_request(request_id):

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        test_id = data.get("test_id")

        if not patient_id or not test_id:

            return jsonify({
                "success": False,
                "message": "Patient and laboratory test are required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check request
        cursor.execute("""
            SELECT request_id
            FROM laboratory_requests
            WHERE request_id = %s
        """, (request_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Laboratory request not found."
            }), 404

        # Check patient
        cursor.execute("""
            SELECT patient_id
            FROM patients
            WHERE patient_id = %s
        """, (patient_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Selected patient does not exist."
            }), 400

        # Check doctor
        if doctor_id:

            cursor.execute("""
                SELECT doctor_id
                FROM doctors
                WHERE doctor_id = %s
            """, (doctor_id,))

            if not cursor.fetchone():

                return jsonify({
                    "success": False,
                    "message": "Selected doctor does not exist."
                }), 400

        # Check test
        cursor.execute("""
            SELECT test_id
            FROM laboratory_tests
            WHERE test_id = %s
        """, (test_id,))

        if not cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "Selected laboratory test does not exist."
            }), 400

        cursor.execute("""
            UPDATE laboratory_requests
            SET
                patient_id = %s,
                doctor_id = %s,
                test_id = %s,
                priority = %s,
                status = %s,
                notes = %s
            WHERE request_id = %s
        """, (
            patient_id,
            doctor_id if doctor_id else None,
            test_id,
            data.get("priority") or "Normal",
            data.get("status") or "Requested",
            data.get("notes"),
            request_id
        ))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory request updated successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update laboratory request.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# DELETE LABORATORY REQUEST
# ---------------------------------------------------------

@app.route("/api/laboratory/requests/<int:request_id>", methods=["DELETE"])
def delete_laboratory_request(request_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM laboratory_requests
            WHERE request_id = %s
        """, (request_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Laboratory request not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory request deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete laboratory request.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# GET LABORATORY RESULTS
# ---------------------------------------------------------

@app.route("/api/laboratory/results", methods=["GET"])
def get_laboratory_results():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                lres.result_id,
                lres.request_id,
                lres.result_value,
                lres.reference_range,
                lres.interpretation,
                lres.technician_name,
                lres.result_date,

                lr.patient_id,
                lr.doctor_id,
                lr.test_id,
                lr.request_date,
                lr.priority,
                lr.status AS request_status,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.middle_name AS patient_middle_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.middle_name AS doctor_middle_name,
                d.last_name AS doctor_last_name,

                lt.test_name,
                lt.category,
                lt.price

            FROM laboratory_results lres

            INNER JOIN laboratory_requests lr
                ON lres.request_id = lr.request_id

            LEFT JOIN patients p
                ON lr.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON lr.doctor_id = d.doctor_id

            LEFT JOIN laboratory_tests lt
                ON lr.test_id = lt.test_id

            ORDER BY lres.result_id DESC
        """)

        results = cursor.fetchall()

        return jsonify({
            "success": True,
            "count": len(results),
            "results": [
                serialize_row(result)
                for result in results
            ]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get laboratory results.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# GET ONE LABORATORY RESULT
# ---------------------------------------------------------

@app.route("/api/laboratory/results/<int:result_id>", methods=["GET"])
def get_laboratory_result(result_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                lres.result_id,
                lres.request_id,
                lres.result_value,
                lres.reference_range,
                lres.interpretation,
                lres.technician_name,
                lres.result_date,

                lr.patient_id,
                lr.doctor_id,
                lr.test_id,
                lr.request_date,
                lr.priority,
                lr.status AS request_status,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.last_name AS doctor_last_name,

                lt.test_name,
                lt.category,
                lt.price

            FROM laboratory_results lres

            INNER JOIN laboratory_requests lr
                ON lres.request_id = lr.request_id

            LEFT JOIN patients p
                ON lr.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON lr.doctor_id = d.doctor_id

            LEFT JOIN laboratory_tests lt
                ON lr.test_id = lt.test_id

            WHERE lres.result_id = %s
        """, (result_id,))

        result = cursor.fetchone()

        if not result:

            return jsonify({
                "success": False,
                "message": "Laboratory result not found."
            }), 404

        return jsonify({
            "success": True,
            "result": serialize_row(result)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Unable to get laboratory result.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# CREATE LABORATORY RESULT
# ---------------------------------------------------------

@app.route("/api/laboratory/results", methods=["POST"])
def create_laboratory_result():

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        request_id = data.get("request_id")

        if not request_id:

            return jsonify({
                "success": False,
                "message": "Laboratory request is required."
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Check request
        cursor.execute("""
            SELECT
                request_id,
                status
            FROM laboratory_requests
            WHERE request_id = %s
        """, (request_id,))

        laboratory_request = cursor.fetchone()

        if not laboratory_request:

            return jsonify({
                "success": False,
                "message": "Laboratory request not found."
            }), 404

        # Prevent duplicate result
        cursor.execute("""
            SELECT result_id
            FROM laboratory_results
            WHERE request_id = %s
        """, (request_id,))

        if cursor.fetchone():

            return jsonify({
                "success": False,
                "message": "A result already exists for this laboratory request."
            }), 409

        cursor.execute("""
            INSERT INTO laboratory_results
            (
                request_id,
                result_value,
                reference_range,
                interpretation,
                technician_name
            )
            VALUES
            (
                %s, %s, %s, %s, %s
            )
        """, (
            request_id,
            data.get("result_value"),
            data.get("reference_range"),
            data.get("interpretation"),
            data.get("technician_name")
        ))

        result_id = cursor.lastrowid

        # Automatically mark request as completed
        cursor.execute("""
            UPDATE laboratory_requests
            SET status = 'Completed'
            WHERE request_id = %s
        """, (request_id,))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory result created successfully.",
            "result_id": result_id
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to create laboratory result.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# UPDATE LABORATORY RESULT
# ---------------------------------------------------------

@app.route("/api/laboratory/results/<int:result_id>", methods=["PUT"])
def update_laboratory_result(result_id):

    connection = None
    cursor = None

    try:

        data = request.get_json(silent=True) or {}

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE laboratory_results
            SET
                request_id = %s,
                result_value = %s,
                reference_range = %s,
                interpretation = %s,
                technician_name = %s
            WHERE result_id = %s
        """, (
            data.get("request_id"),
            data.get("result_value"),
            data.get("reference_range"),
            data.get("interpretation"),
            data.get("technician_name"),
            result_id
        ))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Laboratory result not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory result updated successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to update laboratory result.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# DELETE LABORATORY RESULT
# ---------------------------------------------------------

@app.route("/api/laboratory/results/<int:result_id>", methods=["DELETE"])
def delete_laboratory_result(result_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM laboratory_results
            WHERE result_id = %s
        """, (result_id,))

        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Laboratory result not found."
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Laboratory result deleted successfully."
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "success": False,
            "message": "Unable to delete laboratory result.",
            "error": str(e)
        }), 500

    finally:

        close_db(connection, cursor)
# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "success": False,
        "message": "API endpoint not found."
    }), 404


@app.errorhandler(500)
def internal_error(error):

    return jsonify({
        "success": False,
        "message": "Internal server error."
    }), 500
    # =========================================================
# BILLING MODULE
# =========================================================

# ---------------------------------------------------------
# # ---------------------------------------------------------
# GET ALL INVOICES
# ---------------------------------------------------------

@app.route("/api/billing/invoices", methods=["GET"])
def get_invoices():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                i.invoice_id,
                i.patient_id,
                i.doctor_id,
                i.invoice_number,
                i.invoice_date,
                i.subtotal,
                i.discount,
                i.tax,
                i.total_amount,
                i.status,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.middle_name AS patient_middle_name,
                p.last_name AS patient_last_name,

                d.first_name AS doctor_first_name,
                d.middle_name AS doctor_middle_name,
                d.last_name AS doctor_last_name,
                d.specialization AS doctor_specialization,

                ii.description,
                ii.quantity,
                ii.unit_price,
                ii.total_price

            FROM invoices i

            INNER JOIN patients p
                ON i.patient_id = p.patient_id

            LEFT JOIN doctors d
                ON i.doctor_id = d.doctor_id

            LEFT JOIN invoice_items ii
                ON i.invoice_id = ii.invoice_id

            ORDER BY i.invoice_id DESC
        """

        cursor.execute(query)

        invoices = cursor.fetchall()

        for invoice in invoices:

            invoice["subtotal"] = float(
                invoice["subtotal"] or 0
            )

            invoice["discount"] = float(
                invoice["discount"] or 0
            )

            invoice["tax"] = float(
                invoice["tax"] or 0
            )

            invoice["total_amount"] = float(
                invoice["total_amount"] or 0
            )

            invoice["quantity"] = int(
                invoice["quantity"] or 0
            )

            invoice["unit_price"] = float(
                invoice["unit_price"] or 0
            )

            invoice["total_price"] = float(
                invoice["total_price"] or 0
            )

        return jsonify({
            "success": True,
            "count": len(invoices),
            "invoices": invoices
        }), 200

    except Exception as e:

        print("GET INVOICES ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        close_db(connection, cursor)

# ---------------------------------------------------------
# GET SINGLE INVOICE
# ---------------------------------------------------------

@app.route("/api/billing/invoices/<int:invoice_id>", methods=["GET"])
def get_invoice(invoice_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)

        # Invoice
        cursor.execute("""
            SELECT
                i.invoice_id,
                i.patient_id,
                i.invoice_number,
                i.invoice_date,
                i.subtotal,
                i.discount,
                i.tax,
                i.total_amount,
                i.status,

                p.patient_number,
                p.first_name AS patient_first_name,
                p.middle_name AS patient_middle_name,
                p.last_name AS patient_last_name,
                p.phone AS patient_phone,
                p.email AS patient_email,
                p.address AS patient_address

            FROM invoices i

            INNER JOIN patients p
                ON i.patient_id = p.patient_id

            WHERE i.invoice_id = %s
        """, (invoice_id,))

        invoice = cursor.fetchone()

        if not invoice:

            return jsonify({
                "success": False,
                "message": "Invoice not found."
            }), 404


        # Invoice items
        cursor.execute("""
            SELECT
                invoice_item_id,
                invoice_id,
                service_id,
                description,
                quantity,
                unit_price,
                total_price

            FROM invoice_items

            WHERE invoice_id = %s

            ORDER BY invoice_item_id ASC
        """, (invoice_id,))

        items = cursor.fetchall()


        # Payments
        cursor.execute("""
            SELECT
                payment_id,
                invoice_id,
                payment_reference,
                amount,
                payment_method,
                payment_date,
                received_by,
                notes

            FROM payments

            WHERE invoice_id = %s

            ORDER BY payment_id ASC
        """, (invoice_id,))

        payments = cursor.fetchall()


        # Convert Decimal values
        invoice["subtotal"] = float(
            invoice["subtotal"] or 0
        )

        invoice["discount"] = float(
            invoice["discount"] or 0
        )

        invoice["tax"] = float(
            invoice["tax"] or 0
        )

        invoice["total_amount"] = float(
            invoice["total_amount"] or 0
        )


        for item in items:

            item["unit_price"] = float(
                item["unit_price"] or 0
            )

            item["total_price"] = float(
                item["total_price"] or 0
            )


        for payment in payments:

            payment["amount"] = float(
                payment["amount"] or 0
            )


        invoice["items"] = items

        invoice["payments"] = payments


        return jsonify({
            "success": True,
            "invoice": invoice
        }), 200

    except Exception as e:

        print("GET SINGLE INVOICE ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# CREATE INVOICE
# ---------------------------------------------------------

@app.route("/api/billing/invoices", methods=["POST"])
def create_invoice():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "No invoice data received."
            }), 400


        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        invoice_date = data.get("invoice_date")
        description = data.get("description")

        quantity = data.get("quantity", 1)

        unit_price = data.get("unit_price", 0)

        discount = data.get("discount", 0)

        tax = data.get("tax", 0)

        status = data.get("status", "Unpaid")


        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not patient_id:

            return jsonify({
                "success": False,
                "message": "Patient is required."
            }), 400


        if not description:

            return jsonify({
                "success": False,
                "message": "Description is required."
            }), 400


        try:

            quantity = int(quantity)

            unit_price = float(unit_price)

            discount = float(discount)

            tax = float(tax)

        except (ValueError, TypeError):

            return jsonify({
                "success": False,
                "message": "Invalid numeric billing value."
            }), 400


        if quantity <= 0:

            return jsonify({
                "success": False,
                "message": "Quantity must be greater than zero."
            }), 400


        if unit_price < 0:

            return jsonify({
                "success": False,
                "message": "Unit price cannot be negative."
            }), 400


        if discount < 0:

            return jsonify({
                "success": False,
                "message": "Discount cannot be negative."
            }), 400


        if tax < 0:

            return jsonify({
                "success": False,
                "message": "Tax cannot be negative."
            }), 400


        # -------------------------------------------------
        # MAP FRONTEND STATUS TO DATABASE STATUS
        # -------------------------------------------------

        status_map = {

            "Paid": "Paid",

            "Pending": "Unpaid",

            "Partial Payment": "Partially Paid",

            "Unpaid": "Unpaid",

            "Partially Paid": "Partially Paid",

            "Cancelled": "Cancelled"

        }

        db_status = status_map.get(
            status,
            "Unpaid"
        )


        # -------------------------------------------------
        # CALCULATE AMOUNTS
        # -------------------------------------------------

        subtotal = quantity * unit_price

        total_amount = (
            subtotal
            - discount
            + tax
        )


        if total_amount < 0:
            total_amount = 0


        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)


        # -------------------------------------------------
        # CHECK PATIENT
        # -------------------------------------------------

        cursor.execute("""
            SELECT patient_id
            FROM patients
            WHERE patient_id = %s
        """, (patient_id,))

        patient = cursor.fetchone()


        if not patient:

            return jsonify({
                "success": False,
                "message": "Selected patient does not exist."
            }), 400


        # -------------------------------------------------
        # GENERATE INVOICE NUMBER
        # -------------------------------------------------

        cursor.execute("""
            SELECT invoice_id
            FROM invoices
            ORDER BY invoice_id DESC
            LIMIT 1
        """)

        last_invoice = cursor.fetchone()


        if last_invoice:

            next_number = int(
                last_invoice["invoice_id"]
            ) + 1

        else:

            next_number = 1


        invoice_number = (
            f"INV-{next_number:04d}"
        )


        # -------------------------------------------------
        # INSERT INVOICE
        # -------------------------------------------------

        invoice_query = """
            INSERT INTO invoices
            (
                patient_id,
                 doctor_id,
                invoice_number,
                invoice_date,
                subtotal,
                discount,
                tax,
                total_amount,
                status
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """


        cursor.execute(
            invoice_query,
            (
                patient_id,
                doctor_id if doctor_id else None,
                invoice_number,
                invoice_date if invoice_date else None,
                subtotal,
                discount,
                tax,
                total_amount,
                db_status
            )
        )


        invoice_id = cursor.lastrowid


        # -------------------------------------------------
        # INSERT INVOICE ITEM
        # -------------------------------------------------

        item_query = """
            INSERT INTO invoice_items
            (
                invoice_id,
                service_id,
                description,
                quantity,
                unit_price,
                total_price
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """


        cursor.execute(
            item_query,
            (
                invoice_id,
                data.get("service_id"),
                description,
                quantity,
                unit_price,
                subtotal
            )
        )


        # -------------------------------------------------
        # PAYMENT
        # -------------------------------------------------

        amount_paid = data.get(
            "amount_paid",
            0
        )

        try:

            amount_paid = float(amount_paid)

        except (ValueError, TypeError):

            amount_paid = 0


        if amount_paid > 0:

            payment_method =data.get(
                    "payment_method",
                    "Cash"
                )

        else:

            payment_method = "Cash"


        # -------------------------------------------------
        # MAP PAYMENT METHOD
        # -------------------------------------------------

        payment_method_map = {

            "Cash": "Cash",

            "Bank Transfer": "Bank",

            "Bank": "Bank",

            "Mobile Money": "Mobile Money",

            "eBirr": "Mobile Money",

            "Card": "Card"

        }


        db_payment_method = payment_method_map.get(
            payment_method,
            "Cash"
        )


        # -------------------------------------------------
        # INSERT PAYMENT
        # -------------------------------------------------

        if amount_paid > 0:

            cursor.execute("""
                INSERT INTO payments
                (
                    invoice_id,
                    payment_reference,
                    amount,
                    payment_method,
                    notes
                )

                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                invoice_id,
                data.get("payment_reference"),
                amount_paid,
                db_payment_method,
                data.get("notes")
            ))


        connection.commit()


        return jsonify({

            "success": True,

            "message": "Invoice created successfully.",

            "invoice_id": invoice_id,

            "invoice_number": invoice_number,

            "subtotal": subtotal,

            "discount": discount,

            "tax": tax,

            "total_amount": total_amount,

            "status": db_status,

            "amount_paid": amount_paid

        }), 201


    except Exception as e:

        if connection:

            connection.rollback()

        print("CREATE INVOICE ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# DELETE INVOICE
# ---------------------------------------------------------

@app.route("/api/billing/invoices/<int:invoice_id>", methods=["DELETE"])
def delete_invoice(invoice_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()


        # Delete payments first
        cursor.execute("""
            DELETE FROM payments
            WHERE invoice_id = %s
        """, (invoice_id,))


        # Delete invoice items
        cursor.execute("""
            DELETE FROM invoice_items
            WHERE invoice_id = %s
        """, (invoice_id,))


        # Delete invoice
        cursor.execute("""
            DELETE FROM invoices
            WHERE invoice_id = %s
        """, (invoice_id,))


        if cursor.rowcount == 0:

            connection.rollback()

            return jsonify({
                "success": False,
                "message": "Invoice not found."
            }), 404


        connection.commit()


        return jsonify({
            "success": True,
            "message": "Invoice deleted successfully."
        }), 200


    except Exception as e:

        if connection:
            connection.rollback()

        print("DELETE INVOICE ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# GET ALL PAYMENTS
# ---------------------------------------------------------

@app.route("/api/billing/payments", methods=["GET"])
def get_billing_payments():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                payment_id,
                invoice_id,
                payment_reference,
                amount,
                payment_method,
                payment_date,
                received_by,
                notes

            FROM payments

            ORDER BY payment_id DESC
        """)

        payments = cursor.fetchall()


        for payment in payments:

            payment["amount"] = float(
                payment["amount"] or 0
            )


        return jsonify({

            "success": True,

            "count": len(payments),

            "payments": payments

        }), 200


    except Exception as e:

        print("GET PAYMENTS ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# ---------------------------------------------------------
# ADD PAYMENT
# ---------------------------------------------------------

@app.route("/api/billing/payments", methods=["POST"])
def add_billing_payment():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "No payment data received."
            }), 400


        invoice_id = data.get("invoice_id")

        amount = data.get("amount")

        payment_method = data.get(
            "payment_method",
            "Cash"
        )


        if not invoice_id:

            return jsonify({
                "success": False,
                "message": "Invoice ID is required."
            }), 400


        try:

            amount = float(amount)

        except (ValueError, TypeError):

            return jsonify({
                "success": False,
                "message": "Invalid payment amount."
            }), 400


        if amount <= 0:

            return jsonify({
                "success": False,
                "message": "Payment amount must be greater than zero."
            }), 400


        payment_method_map = {

            "Cash": "Cash",

            "Bank Transfer": "Bank",

            "Bank": "Bank",

            "Mobile Money": "Mobile Money",

            "eBirr": "Mobile Money",

            "Card": "Card"

        }


        db_payment_method = payment_method_map.get(
            payment_method,
            "Cash"
        )


        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)


        # -------------------------------------------------
        # CHECK INVOICE
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                invoice_id,
                total_amount,
                status

            FROM invoices

            WHERE invoice_id = %s
        """, (invoice_id,))


        invoice = cursor.fetchone()


        if not invoice:

            return jsonify({
                "success": False,
                "message": "Invoice not found."
            }), 404


        # -------------------------------------------------
        # GET CURRENT PAYMENTS
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                COALESCE(SUM(amount), 0) AS paid_amount

            FROM payments

            WHERE invoice_id = %s
        """, (invoice_id,))


        payment_row = cursor.fetchone()


        already_paid = float(
            payment_row["paid_amount"] or 0
        )


        total_amount = float(
            invoice["total_amount"] or 0
        )


        remaining = (
            total_amount - already_paid
        )


        if amount > remaining:

            return jsonify({
                "success": False,
                "message": (
                    f"Payment is greater than "
                    f"the remaining balance of "
                    f"{remaining:.2f} ETB."
                )
            }), 400


        # -------------------------------------------------
        # INSERT PAYMENT
        # -------------------------------------------------

        cursor.execute("""
            INSERT INTO payments
            (
                invoice_id,
                payment_reference,
                amount,
                payment_method,
                notes
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """, (
            invoice_id,
            data.get("payment_reference"),
            amount,
            db_payment_method,
            data.get("notes")
        ))


        # -------------------------------------------------
        # UPDATE INVOICE STATUS
        # -------------------------------------------------

        new_paid_amount = (
            already_paid + amount
        )


        if new_paid_amount >= total_amount:

            new_status = "Paid"

        elif new_paid_amount > 0:

            new_status = "Partially Paid"

        else:

            new_status = "Unpaid"


        cursor.execute("""
            UPDATE invoices

            SET status = %s

            WHERE invoice_id = %s
        """, (
            new_status,
            invoice_id
        ))


        connection.commit()


        return jsonify({

            "success": True,

            "message": "Payment recorded successfully.",

            "payment_id": cursor.lastrowid,

            "invoice_id": invoice_id,

            "amount": amount,

            "total_paid": new_paid_amount,

            "remaining": total_amount - new_paid_amount,

            "status": new_status

        }), 201


    except Exception as e:

        if connection:
            connection.rollback()

        print("ADD PAYMENT ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        close_db(connection, cursor)


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )